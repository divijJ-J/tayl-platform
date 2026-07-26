-- TAYL Automation Platform — Knowledge Base Migration (Phase 8)
-- Run this AFTER migration-multitenant.sql, in Supabase SQL Editor

create table knowledge_sources (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  content text not null,           -- plain text extracted from paste or uploaded .txt/.md file
  source_type text default 'text', -- text | file
  created_at timestamptz default now()
);

create index idx_knowledge_company on knowledge_sources(company_id);

alter table knowledge_sources enable row level security;

create policy "company scoped access" on knowledge_sources
  for all using (is_company_member(company_id));

-- NOTES
-- Content is plain text only (no embeddings/vector search) — at small per-company
-- scale, all of a company's knowledge is just concatenated straight into the AI
-- estimate prompt. This is simpler, has zero extra infra cost, and is good enough
-- until a company's knowledge base grows large enough to need real RAG.
