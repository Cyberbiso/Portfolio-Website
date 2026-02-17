create extension if not exists pgcrypto;

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  question text not null,
  answer text not null,
  citations jsonb not null,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists chat_logs_session_created_idx on public.chat_logs (session_id, created_at desc);
create index if not exists chat_logs_ip_created_idx on public.chat_logs (ip_hash, created_at desc);

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_ip_created_idx on public.rate_limit_events (ip_hash, created_at desc);

create table if not exists public.assistant_error_logs (
  id uuid primary key default gen_random_uuid(),
  error_message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assistant_error_logs_created_idx on public.assistant_error_logs (created_at desc);
