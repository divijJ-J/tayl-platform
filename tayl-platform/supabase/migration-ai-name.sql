-- TAYL Automation Platform — AI Display Name (Phase 22)
-- Lets the AI refer to your business by a different name than your account's
-- literal company name, without you having to rename your actual account.
-- Run this in Supabase SQL Editor.

alter table companies add column ai_display_name text;
