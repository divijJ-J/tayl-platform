# Phase 0 Setup — Get This Live (Free)

## 1. Supabase (database)
1. Go to supabase.com → sign up free → "New project"
2. Once created, go to **SQL Editor > New Query**
3. Open `supabase/schema.sql` from this zip, paste the whole thing in, click **Run**
4. Go to **Settings > API** — copy the **Project URL** and the **anon public** key. You'll need these in step 3.

## 2. GitHub (code storage)
1. Go to github.com → sign up free → **New repository** → name it `tayl-platform` → keep it private → Create
2. On your computer, unzip this file, open a terminal in that folder, run:
   ```
   git init
   git add .
   git commit -m "Phase 0: foundation"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/tayl-platform.git
   git push -u origin main
   ```
   (Replace YOUR-USERNAME. GitHub will prompt you to log in the first time.)

## 3. Vercel (hosting, free)
1. Go to vercel.com → sign up free with your GitHub account
2. **Add New > Project** → select the `tayl-platform` repo → Import
3. Before clicking Deploy, expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = (the Project URL from step 1)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (the anon public key from step 1)
4. Click **Deploy**. In ~1 minute you'll get a live URL like `tayl-platform.vercel.app`

## 4. Confirm it's working
- Visit `your-url.vercel.app` → should show the TAYL homepage
- Visit `your-url.vercel.app/customers` → should say "No customers yet" (this means it successfully connected to your live database)
- In Supabase, go to **Table Editor > customers > Insert row**, add a name, save
- Refresh the `/customers` page — your new customer should appear

If that last step works, the full chain (Next.js → Vercel → Supabase) is proven live end to end, and Phase 1 (quotes & proposals) builds directly on top of it.

## Stuck?
Copy the exact error message back to me — most first-deploy issues are a typo'd env var or a missed step above.
