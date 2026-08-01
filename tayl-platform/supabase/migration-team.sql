-- TAYL Automation Platform — Team Invites (Phase 24)
-- Lets an owner invite a teammate (e.g. a salesperson) with restricted access,
-- instead of sharing their own login.
-- Run this in Supabase SQL Editor.

create table invites (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  email text not null,
  role text not null default 'sales', -- 'owner' | 'sales'
  token uuid default uuid_generate_v4(),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

alter table invites enable row level security;

create policy "company scoped access" on invites
  for all using (is_company_member(company_id));

-- NOTE: the invite acceptance route uses the service-role client (bypasses
-- RLS by design), since the invited person isn't a company member yet.

-- 'sales' role scope, enforced in the app:
--   Can access: Customers, Quotes, AI Estimates, Tasks
--   Cannot access: Billing, Payment Settings, WhatsApp, Chat Widget,
--                  Knowledge Base, Calendar settings
