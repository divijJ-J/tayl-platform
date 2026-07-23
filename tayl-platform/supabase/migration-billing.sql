-- Billing fields for the platform's own subscription (not customer payments)
alter table companies add column plan text default 'trial';
alter table companies add column subscription_status text default 'trialing';
alter table companies add column trial_ends_at timestamptz default (now() + interval '14 days');
