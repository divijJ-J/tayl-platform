# Phase 2 (Multi-Tenant) Setup

This update turns the platform into a real multi-tenant SaaS: each business
that signs up gets their own login, isolated data, and connects their own
Razorpay account. Follow these steps in order.

## 1. Run the new database migration
1. Supabase → SQL Editor → New Query
2. Open `supabase/migration-multitenant.sql` from this zip, paste the whole thing, Run
3. If it warns about RLS — this migration is what SETS UP proper RLS policies, so this is expected and correct

## 2. Get your Supabase Service Role key
1. Supabase → Project Settings → API Keys → find the **service_role** secret key (NOT the anon/publishable one — this one bypasses RLS and must stay secret)
2. Copy it

## 3. Replace your local code
1. Delete everything inside your local `tayl-platform\tayl-platform` folder EXCEPT the `.git` folder if you see one
2. Copy everything from this zip's `tayl-platform` folder into that same location

## 4. Push to GitHub
In your terminal, inside that folder:
```
git add .
git commit -m "Phase 2: multi-tenant, auth, Razorpay per-company"
git push
```

## 5. Add the new environment variable in Vercel
Project → Settings → Environment Variables → Add:
- `SUPABASE_SERVICE_ROLE_KEY` = (the service_role key from step 2)

Your existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` stay as they are.

## 6. Redeploy
Deployments tab → latest deployment → Redeploy (needed to pick up the new env var and code)

## 7. Test it
1. Visit your live site → click **Sign up**
2. Enter a company name, your email, a password → Sign up
3. You should land on the homepage, now showing the full nav (Customers, Quotes, Invoices, Payment Settings)
4. Go to **Payment Settings** → paste your Razorpay **test mode** Key ID + Key Secret (Razorpay Dashboard → Settings → API Keys) → Save
5. Create a quote → Accept it → go to Invoices → click **Send & Get Payment Link** — it should generate a real (test mode) Razorpay payment link

## Note on old data
Any customers/quotes/invoices you created before this update won't have a `company_id`, so they won't show up anymore (this is correct — they belonged to no company). Test data loss here is expected and fine.
