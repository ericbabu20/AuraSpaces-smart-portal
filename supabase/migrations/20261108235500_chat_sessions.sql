-- Chat history used by the gemini-chat Edge Function.
-- The earlier init migration was never applied on the hosted project, so the
-- live site had nowhere to store a conversation.

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  channel text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx
  on public.sessions (user_id);
create index if not exists sessions_user_started_idx
  on public.sessions (user_id, started_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text,
  tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists messages_session_id_idx
  on public.messages (session_id);
create index if not exists messages_session_created_idx
  on public.messages (session_id, created_at asc);

alter table public.sessions enable row level security;
alter table public.messages enable row level security;

drop policy if exists "sessions owner access" on public.sessions;
drop policy if exists "sessions owner read" on public.sessions;
create policy "sessions owner read"
  on public.sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "messages owner access via session" on public.messages;
drop policy if exists "messages owner read via session" on public.messages;
create policy "messages owner read via session"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

grant select on public.sessions, public.messages to authenticated;
grant all on public.sessions, public.messages to service_role;

-- Reads the Gemini key from Supabase Vault. Only the Edge Function's
-- service role can call this. The key itself is not stored in git.
create or replace function public.get_gemini_api_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'gemini_api_key'
  order by created_at desc
  limit 1;
$$;

revoke all on function public.get_gemini_api_key() from public, anon, authenticated;
grant execute on function public.get_gemini_api_key() to service_role;
