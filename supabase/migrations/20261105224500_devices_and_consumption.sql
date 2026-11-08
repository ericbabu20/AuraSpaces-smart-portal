-- Devices stay. Daily electricity and gas use is kept for 30 days, then removed.

create table if not exists public.energy_inputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  home_type text,
  occupants integer,
  current_supplier text,
  tariff_type text,
  est_kwh numeric,
  has_ev boolean not null default false,
  has_smart_meter boolean not null default false,
  has_solar boolean not null default false,
  has_battery boolean not null default false,
  has_gas boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists energy_inputs_one_per_user_idx
  on public.energy_inputs (user_id);

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

create table if not exists public.consumption_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  fuel text not null check (fuel in ('electricity', 'gas')),
  usage_date date not null,
  kwh numeric not null check (kwh >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, fuel, usage_date)
);

create index if not exists consumption_daily_usage_date_idx
  on public.consumption_daily (usage_date);

alter table public.energy_inputs enable row level security;
alter table public.household_devices enable row level security;
alter table public.consumption_daily enable row level security;

drop policy if exists "energy_inputs owner access" on public.energy_inputs;
create policy "energy_inputs owner access"
  on public.energy_inputs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "household_devices owner access" on public.household_devices;
create policy "household_devices owner access"
  on public.household_devices
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "consumption_daily owner access" on public.consumption_daily;
create policy "consumption_daily owner access"
  on public.consumption_daily
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.energy_inputs to authenticated;
grant select, insert, update, delete on public.household_devices to authenticated;
grant select, insert, update, delete on public.consumption_daily to authenticated;

-- Each new reading also clears that user's days older than 30.
create or replace function public.trim_old_consumption()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.consumption_daily
  where user_id = new.user_id
    and usage_date < (current_date - 30);
  return new;
end;
$$;

drop trigger if exists consumption_daily_trim_old on public.consumption_daily;
create trigger consumption_daily_trim_old
after insert or update on public.consumption_daily
for each row execute function public.trim_old_consumption();
