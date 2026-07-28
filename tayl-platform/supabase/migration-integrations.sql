-- TAYL Automation Platform — Customer Memory + Calendar Integration (Phase 9)
-- Run this AFTER migration-knowledge.sql, in Supabase SQL Editor

-- Customer memory: running AI summary built from communication_log history
alter table customers add column ai_summary text;
alter table customers add column ai_summary_updated_at timestamptz;

-- Calendar sync: link a task to a created Google Calendar event
alter table tasks add column google_event_id text;

-- One Google Calendar connection per company (stores OAuth tokens)
create table calendar_connections (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade unique,
  google_email text,
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  created_at timestamptz default now()
);

alter table calendar_connections enable row level security;

create policy "company scoped access" on calendar_connections
  for all using (is_company_member(company_id));
