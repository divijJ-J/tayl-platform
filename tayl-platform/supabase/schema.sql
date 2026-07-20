-- TAYL Automation Platform — Phase 0 Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query > paste > Run)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============ CUSTOMERS ============
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ SERVICES / PRICING CATALOG ============
-- What you sell — used by quotes, proposals, and the AI estimator
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  unit_price numeric(12,2) not null default 0,
  unit text default 'each',        -- e.g. 'hour', 'each', 'sqft'
  category text,
  created_at timestamptz default now()
);

-- ============ QUOTES ============
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  status text default 'draft',      -- draft | sent | accepted | rejected | expired
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 0,
  discount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table quote_line_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  service_id uuid references services(id),
  description text,
  quantity numeric(12,2) default 1,
  unit_price numeric(12,2) default 0,
  line_total numeric(12,2) default 0
);

-- ============ PROPOSALS ============
-- A quote becomes a proposal once it's ready to send/sign
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  status text default 'draft',      -- draft | sent | accepted | rejected | changes_requested
  pdf_url text,
  accepted_at timestamptz,
  accepted_ip text,                 -- basic proof-of-acceptance until real e-sign is added
  created_at timestamptz default now()
);

-- ============ INVOICES ============
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  proposal_id uuid references proposals(id),
  status text default 'draft',      -- draft | sent | paid | overdue | void
  subtotal numeric(12,2) default 0,
  total numeric(12,2) default 0,
  amount_paid numeric(12,2) default 0,
  due_date date,
  stripe_invoice_id text,
  stripe_payment_link text,
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ PAYMENTS ============
create table payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text,                      -- stripe | paypal | manual
  stripe_payment_intent_id text,
  paid_at timestamptz default now()
);

-- ============ TASKS ============
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text default 'open',       -- open | in_progress | done | blocked
  trigger_type text,                -- new_lead | appointment_booked | proposal_accepted | invoice_paid | support_request | manual
  related_customer_id uuid references customers(id),
  related_invoice_id uuid references invoices(id),
  related_proposal_id uuid references proposals(id),
  assigned_to uuid,                 -- references auth.users(id), set once auth/employees exist
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  author uuid,                      -- references auth.users(id)
  comment text not null,
  created_at timestamptz default now()
);

-- ============ CRM ACTIVITY LOG ============
-- Every automated action across every module writes here — this IS the CRM history view
create table communication_log (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  type text,                        -- email | sms | note | system_event
  subject text,
  body text,
  created_at timestamptz default now()
);

-- ============ INDEXES ============
create index idx_quotes_customer on quotes(customer_id);
create index idx_proposals_customer on proposals(customer_id);
create index idx_invoices_customer on invoices(customer_id);
create index idx_tasks_customer on tasks(related_customer_id);
create index idx_comm_log_customer on communication_log(customer_id);

-- ============ NOTES ============
-- Row Level Security is OFF by default here for speed of initial build.
-- Before this touches real customer data, RLS policies must be added —
-- flag this to me before Phase 5 (integration pass).
