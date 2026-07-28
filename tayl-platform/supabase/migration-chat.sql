-- TAYL Automation Platform — AI Chat Widget (Phase 10)
-- This is the reference app's "AI receptionist chat" concept, minus the
-- WhatsApp transport layer (that's still deferred — see WhatsApp Cloud API note).
-- Works as a shareable link / embeddable iframe instead, using your existing
-- knowledge base (Phase 8) and feeding into customer memory (Phase 9).
-- Run this AFTER migration-integrations.sql, in Supabase SQL Editor

alter table companies add column public_slug text unique;
alter table companies add column chat_greeting text default 'Hi! How can I help you today?';
alter table companies add column chat_persona text default 'You are a friendly, professional receptionist for this business. Be concise and helpful.';

create table chat_conversations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  customer_id uuid references customers(id),
  visitor_name text,
  visitor_email text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  role text not null, -- user | assistant
  content text not null,
  created_at timestamptz default now()
);

create index idx_chat_conversations_company on chat_conversations(company_id);
create index idx_chat_messages_conversation on chat_messages(conversation_id);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

create policy "company scoped access" on chat_conversations
  for all using (is_company_member(company_id));

create policy "company scoped access" on chat_messages
  for all using (
    conversation_id in (select id from chat_conversations where is_company_member(company_id))
  );

-- NOTE: the public chat API routes use the service-role client (supabaseAdmin),
-- so they bypass RLS by design — that's expected, since visitors aren't
-- authenticated Supabase users. RLS above just protects staff-side reads.
