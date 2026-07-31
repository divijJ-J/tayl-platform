-- TAYL Automation Platform — Owner WhatsApp Notifications (Phase 17)
-- Run this AFTER migration-whatsapp.sql, in Supabase SQL Editor

alter table whatsapp_connections add column notify_phone text;

-- NOTE: notify_phone is the OWNER's own number (not a customer's) — when a
-- new website chat conversation starts, TAYL sends a WhatsApp message to
-- this number using the same connected business phone_number_id/access_token,
-- so the owner hears about new leads immediately without checking the dashboard.
