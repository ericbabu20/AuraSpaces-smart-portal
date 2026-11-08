-- Production backend hardening for Aura Spaces.
-- Secrets are stored in Supabase Vault and can only be accessed by service_role.

create extension if not exists vault with schema vault;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.energy_inputs
  add column if not exists has_solar boolean not null default false,
  add column if not exists has_battery boolean not null default false,
  add column if not exists has_gas boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.energy_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  provider text not null default 'octopus' check (provider = 'octopus'),
  api_key_secret_id uuid not null,
  electricity_mpan text,
  electricity_serial text,
  gas_mprn text,
  gas_serial text,
  is_active boolean not null default true,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_devices (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('climate', 'lighting', 'appliance', 'ev')),
  is_on boolean not null default false,
  power_draw integer not null default 0 check (power_draw >= 0),
  icon text not null,
  room text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists energy_connections_user_id_idx
  on public.energy_connections (user_id);
create unique index if not exists energy_inputs_one_per_user_idx
  on public.energy_inputs (user_id);
create index if not exists sessions_user_started_idx
  on public.sessions (user_id, started_at desc);
create index if not exists messages_session_created_idx
  on public.messages (session_id, created_at asc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists energy_inputs_set_updated_at on public.energy_inputs;
create trigger energy_inputs_set_updated_at
before update on public.energy_inputs
for each row execute function public.set_updated_at();

drop trigger if exists energy_connections_set_updated_at on public.energy_connections;
create trigger energy_connections_set_updated_at
before update on public.energy_connections
for each row execute function public.set_updated_at();

-- Every new auth user receives a matching profile and default non-solar,
-- non-battery energy profile. The user can edit these later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.energy_inputs (
    user_id, has_ev, has_smart_meter, has_solar, has_battery, has_gas
  )
  values (new.id, false, false, false, false, true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.energy_connections enable row level security;
alter table public.household_devices enable row level security;

drop policy if exists "energy_connections owner read" on public.energy_connections;
create policy "energy_connections owner read"
  on public.energy_connections
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "household_devices owner access" on public.household_devices;
create policy "household_devices owner access"
  on public.household_devices
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Replace broad message/recommendation write policies. Users can read their
-- conversation, but trusted Edge Functions (service_role) write all turns.
drop policy if exists "messages owner access via session" on public.messages;
create policy "messages owner read via session"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "recommendations owner access via session" on public.recommendations;
create policy "recommendations owner read via session"
  on public.recommendations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = recommendations.session_id and s.user_id = auth.uid()
    )
  );

-- Session rows can be read by users. Creation is performed by the chat
-- function so user_id is always derived from the verified JWT.
drop policy if exists "sessions owner access" on public.sessions;
create policy "sessions owner read"
  on public.sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Edge Functions call these RPCs with service_role. They are not executable by
-- the client roles. Vault plaintext never appears in a public table.
create or replace function public.upsert_octopus_connection(
  p_user_id uuid,
  p_api_key text,
  p_electricity_mpan text default null,
  p_electricity_serial text default null,
  p_gas_mprn text default null,
  p_gas_serial text default null
)
returns public.energy_connections
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.energy_connections;
  secret_id uuid;
  result public.energy_connections;
begin
  select * into existing
  from public.energy_connections
  where user_id = p_user_id;

  if existing.id is null then
    secret_id := vault.create_secret(
      p_api_key,
      'octopus-' || p_user_id::text,
      'Octopus API key for Aura user'
    );
  else
    secret_id := existing.api_key_secret_id;
    perform vault.update_secret(secret_id, p_api_key);
  end if;

  insert into public.energy_connections (
    user_id, api_key_secret_id, electricity_mpan, electricity_serial,
    gas_mprn, gas_serial, is_active, last_verified_at
  )
  values (
    p_user_id, secret_id, p_electricity_mpan, p_electricity_serial,
    p_gas_mprn, p_gas_serial, true, now()
  )
  on conflict (user_id) do update set
    electricity_mpan = excluded.electricity_mpan,
    electricity_serial = excluded.electricity_serial,
    gas_mprn = excluded.gas_mprn,
    gas_serial = excluded.gas_serial,
    is_active = true,
    last_verified_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.get_octopus_connection_secret(p_user_id uuid)
returns table (
  api_key text,
  electricity_mpan text,
  electricity_serial text,
  gas_mprn text,
  gas_serial text
)
language sql
security definer
set search_path = ''
as $$
  select
    decrypted.decrypted_secret,
    connection.electricity_mpan,
    connection.electricity_serial,
    connection.gas_mprn,
    connection.gas_serial
  from public.energy_connections connection
  join vault.decrypted_secrets decrypted
    on decrypted.id = connection.api_key_secret_id
  where connection.user_id = p_user_id
    and connection.is_active = true;
$$;

revoke all on function public.upsert_octopus_connection(uuid, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.get_octopus_connection_secret(uuid)
  from public, anon, authenticated;
grant execute on function public.upsert_octopus_connection(uuid, text, text, text, text, text)
  to service_role;
grant execute on function public.get_octopus_connection_secret(uuid)
  to service_role;

grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.energy_inputs to authenticated;
grant select on public.sessions, public.messages, public.recommendations to authenticated;
grant select on public.energy_connections to authenticated;
grant select, insert, update, delete on public.household_devices to authenticated;
grant select on public.kb_articles to anon, authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant all on all tables in schema public to service_role;

