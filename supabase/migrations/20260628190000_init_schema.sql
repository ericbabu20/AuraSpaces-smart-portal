-- Aura Spaces initial schema
-- 7 core tables. UUID primary keys, created_at defaults, and foreign keys to
-- auth.users wherever a row belongs to a specific user.
--
-- Row Level Security is enabled in the follow-up migration
-- (20260628190001_rls_policies.sql).

-- gen_random_uuid() is available on Postgres 13+ (Supabase enables pgcrypto).

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (id == auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  name           text,
  segment        text,
  postcode_area  text,
  consent_flags  jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- energy_inputs: a user's home / tariff details
-- ---------------------------------------------------------------------------
create table if not exists public.energy_inputs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  home_type        text,
  occupants        integer,
  current_supplier text,
  tariff_type      text,
  est_kwh          numeric,
  has_ev           boolean not null default false,
  has_smart_meter  boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists energy_inputs_user_id_idx
  on public.energy_inputs (user_id);

-- ---------------------------------------------------------------------------
-- sessions: a conversation/interaction owned by a user
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  started_at  timestamptz not null default now(),
  channel     text,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_user_id_idx
  on public.sessions (user_id);

-- ---------------------------------------------------------------------------
-- messages: chat turns belonging to a session
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'system')),
  content     text,
  tokens      integer,
  created_at  timestamptz not null default now()
);

create index if not exists messages_session_id_idx
  on public.messages (session_id);

-- ---------------------------------------------------------------------------
-- recommendations: AI recommendations produced within a session
-- ---------------------------------------------------------------------------
create table if not exists public.recommendations (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions (id) on delete cascade,
  action           text,
  est_saving_low   numeric,
  est_saving_high  numeric,
  rationale        text,
  verdict          text,
  created_at       timestamptz not null default now()
);

create index if not exists recommendations_session_id_idx
  on public.recommendations (session_id);

-- ---------------------------------------------------------------------------
-- kb_articles: knowledge base content (world-readable, see RLS migration)
-- ---------------------------------------------------------------------------
create table if not exists public.kb_articles (
  id          uuid primary key default gen_random_uuid(),
  topic       text,
  body        text,
  source_url  text,
  valid_from  timestamptz,
  valid_to    timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- leads: partner referral leads owned by a user
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  partner_type  text,
  status        text,
  disclosed_at  timestamptz,
  consented     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists leads_user_id_idx
  on public.leads (user_id);
