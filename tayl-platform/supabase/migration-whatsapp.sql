-- TAYL Automation Platform — WhatsApp Integration (Phase 15)
-- Uses the official WhatsApp Cloud API (Meta) — works fine on Vercel's free
-- serverless tier since it's webhook-based, unlike the unofficial QR-pairing
-- libraries (e.g. Neonize) that need a persistent connection.
-- "Bring your own API keys" pattern — same approach as Razorpay.
-- Run this AFTER migration-chat.sql, in Supabase SQL Editor

alter table customers add column phone text;

create table whatsapp_connections (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade unique,
  phone_number_id text,
  access_token text,
  verify_token text,
  created_at timestamptz default now()
);

alter table whatsapp_connections enable row level security;

create policy "company scoped access" on whatsapp_connections
  for all using (is_company_member(company_id));

-- NOTE: the webhook route uses the service-role client and is looked up by
-- companies.public_slug (the same slug already used for the chat widget),
-- so make sure Phase 10's migration-chat.sql has been run first.
