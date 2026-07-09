-- Row Level Security for all Aura Spaces tables.
--
-- Rule of thumb: an authenticated user may only read/write rows that belong to
-- them. Ownership is determined by:
--   * profiles            -> id        == auth.uid()
--   * energy_inputs       -> user_id   == auth.uid()
--   * sessions            -> user_id   == auth.uid()
--   * leads               -> user_id   == auth.uid()
--   * messages            -> owning session's user_id == auth.uid()
--   * recommendations     -> owning session's user_id == auth.uid()
--
-- kb_articles is world-readable but not writable by normal users.

-- Enable RLS everywhere.
alter table public.profiles        enable row level security;
alter table public.energy_inputs   enable row level security;
alter table public.sessions        enable row level security;
alter table public.messages        enable row level security;
alter table public.recommendations enable row level security;
alter table public.kb_articles     enable row level security;
alter table public.leads           enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles owner access" on public.profiles;
create policy "profiles owner access"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- energy_inputs
-- ---------------------------------------------------------------------------
drop policy if exists "energy_inputs owner access" on public.energy_inputs;
create policy "energy_inputs owner access"
  on public.energy_inputs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- sessions
-- ---------------------------------------------------------------------------
drop policy if exists "sessions owner access" on public.sessions;
create policy "sessions owner access"
  on public.sessions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
drop policy if exists "leads owner access" on public.leads;
create policy "leads owner access"
  on public.leads
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages: ownership flows through the parent session
-- ---------------------------------------------------------------------------
drop policy if exists "messages owner access via session" on public.messages;
create policy "messages owner access via session"
  on public.messages
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- recommendations: ownership flows through the parent session
-- ---------------------------------------------------------------------------
drop policy if exists "recommendations owner access via session" on public.recommendations;
create policy "recommendations owner access via session"
  on public.recommendations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = recommendations.session_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sessions s
      where s.id = recommendations.session_id
        and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- kb_articles: readable by everyone (anon + authenticated), writable by none.
-- With RLS enabled and no INSERT/UPDATE/DELETE policy, normal users cannot
-- modify rows; the server secret key (which bypasses RLS) manages content.
-- ---------------------------------------------------------------------------
drop policy if exists "kb_articles are world readable" on public.kb_articles;
create policy "kb_articles are world readable"
  on public.kb_articles
  for select
  to anon, authenticated
  using (true);
