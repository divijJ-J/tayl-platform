-- TAYL Automation Platform — Multi-Tenant Migration
-- Run this AFTER schema.sql, in Supabase SQL Editor

-- ============ COMPANIES (one per customer of your SaaS) ============
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- ============ COMPANY MEMBERS (links Supabase Auth users to a company) ============
create table company_members (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'owner',
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

-- ============ PAYMENT GATEWAY CREDENTIALS (each company connects their own) ============
create table payment_gateway_keys (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade unique,
  provider text default 'razorpay',
  key_id text,
  key_secret text,
  webhook_secret text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ ADD company_id TO EVERY EXISTING BUSINESS TABLE ============
alter table customers add column company_id uuid references companies(id);
alter table services add column company_id uuid references companies(id);
alter table quotes add column company_id uuid references companies(id);
alter table proposals add column company_id uuid references companies(id);
alter table invoices add column company_id uuid references companies(id);
alter table payments add column company_id uuid references companies(id);
alter table tasks add column company_id uuid references companies(id);
alter table task_comments add column company_id uuid references companies(id);
alter table communication_log add column company_id uuid references companies(id);

create index idx_customers_company on customers(company_id);
create index idx_quotes_company on quotes(company_id);
create index idx_invoices_company on invoices(company_id);
create index idx_tasks_company on tasks(company_id);

-- ============ ROW LEVEL SECURITY — now genuinely needed since real customers' data lives here ============
alter table companies enable row level security;
alter table company_members enable row level security;
alter table payment_gateway_keys enable row level security;
alter table customers enable row level security;
alter table quotes enable row level security;
alter table quote_line_items enable row level security;
alter table proposals enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
alter table communication_log enable row level security;
alter table services enable row level security;

-- Helper: is the current user a member of this company?
create or replace function is_company_member(target_company_id uuid)
returns boolean as $$
  select exists (
    select 1 from company_members
    where company_id = target_company_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- A user can see/manage their own company row
create policy "members can view their company" on companies
  for select using (is_company_member(id));

create policy "members can view their membership" on company_members
  for select using (user_id = auth.uid());

-- Every business table: members can do everything scoped to their own company_id
create policy "company scoped access" on customers for all using (is_company_member(company_id));
create policy "company scoped access" on quotes for all using (is_company_member(company_id));
create policy "company scoped access" on proposals for all using (is_company_member(company_id));
create policy "company scoped access" on invoices for all using (is_company_member(company_id));
create policy "company scoped access" on payments for all using (is_company_member(company_id));
create policy "company scoped access" on tasks for all using (is_company_member(company_id));
create policy "company scoped access" on task_comments for all using (is_company_member(company_id));
create policy "company scoped access" on communication_log for all using (is_company_member(company_id));
create policy "company scoped access" on services for all using (is_company_member(company_id));
create policy "company scoped access" on payment_gateway_keys for all using (is_company_member(company_id));

-- quote_line_items has no direct company_id — scope through its parent quote
create policy "company scoped access via quote" on quote_line_items
  for all using (
    exists (select 1 from quotes where quotes.id = quote_line_items.quote_id and is_company_member(quotes.company_id))
  );

-- ============ NOTES ============
-- Server-side API routes use the Supabase SERVICE ROLE key (bypasses RLS) and
-- manually filter by the authenticated user's company_id — this is intentional,
-- not a gap. RLS here is the safety net for any direct client-side queries.
