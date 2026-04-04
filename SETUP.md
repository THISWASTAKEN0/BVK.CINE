# Setup Guide — Photography Portfolio

Zero code changes required after you complete these steps.
Everything after setup is managed at `/admin`.

---

## Step 1 — Supabase (free database)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, give it a name (e.g. "Photography Portfolio"), set a
   database password, choose a region close to you, and click **Create new
   project**. Wait about 2 minutes for it to spin up.
3. In the left sidebar click **SQL Editor**, then **New query**.
4. Open the file `supabase/migrations/001_init.sql` from this project, copy the
   entire contents, paste it into the SQL Editor, and click **Run**. You should
   see "Success. No rows returned."
5. In the left sidebar click **Project Settings → API**.
6. Copy three values — you'll need them in Step 3:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long JWT string under "Project API keys")
   - **service_role** key (click "Reveal" — keep this secret)

---

## Step 2 — Cloudinary (free image storage)

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account.
   No credit card required.
2. After signing in you land on the Dashboard. Copy three values:
   - **Cloud Name** (top of the dashboard)
   - **API Key**
   - **API Secret** (click "Reveal")

---

## Step 3 — Local setup

```bash
# In the project folder:
cp .env.local.example .env.local
```

Open `.env.local` and fill in all six values from Steps 1 and 2.

Also fill in your personal info at the bottom of `.env.local`:

```
NEXT_PUBLIC_PHOTOGRAPHER_NAME=Your Name
NEXT_PUBLIC_PHOTOGRAPHER_EMAIL=you@youremail.com
NEXT_PUBLIC_PHOTOGRAPHER_INSTAGRAM=@yourhandle
```

---

## Step 4 — Run the app locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the public homepage loads.

---

## Step 5 — Create your admin account

1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Click **"Create your admin account"**.
3. Enter your email address and choose a strong password.
4. Check your email for a confirmation link from Supabase — click it.
5. Return to the login page and sign in.

You now have permanent admin access. You only ever create an account once.

---

## Step 6 — Deploy to the internet (free, permanent)

1. Push the project to a GitHub repository (private is fine):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.

3. Click **Add New… → Project**, then select your repository.

4. Before clicking Deploy, open **Environment Variables** and add all values
   from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_PHOTOGRAPHER_NAME`
   - `NEXT_PUBLIC_PHOTOGRAPHER_EMAIL`
   - `NEXT_PUBLIC_PHOTOGRAPHER_INSTAGRAM`

5. Click **Deploy**. Vercel builds the project (about 60 seconds).

6. Your site is live at `yourname.vercel.app`. You can add a custom domain
   for free in Vercel's project settings.

---

## Step 7 — Optional: add your portrait photo

1. Log into your admin panel at `yoursite.vercel.app/admin`.
2. Upload any photo to any collection (just to get a Cloudinary URL).
3. Upload your headshot separately via [cloudinary.com](https://cloudinary.com)
   → Media Library → Upload.
4. Click the photo, copy the URL, and add it to Vercel environment variables:
   ```
   NEXT_PUBLIC_PHOTOGRAPHER_PORTRAIT_URL=https://res.cloudinary.com/...
   ```
5. Redeploy from the Vercel dashboard (Deployments → Redeploy).

---

## Day-to-day usage

After setup you never touch code again. Everything is at `/admin`:

| Task | Where |
|------|-------|
| Create a new collection | Dashboard → "New Collection" |
| Upload photos | Collection detail page → drop zone |
| Set a cover photo | Collection detail → hover photo → ★ |
| Reorder collections | Dashboard → drag the ⠿ handle |
| Reorder photos | Collection detail → drag any photo |
| Publish / hide a collection | Dashboard → toggle switch |
| Delete a photo | Collection detail → hover → ✕ |
| Delete a collection | Dashboard → trash icon → confirm |

Changes appear on the public site within 30 seconds automatically.

---

## Cost breakdown

| Service | Free tier | When you'd pay |
|---------|-----------|----------------|
| Vercel hosting | Free forever | Never for personal sites |
| Supabase database | Free forever (storing text only) | Never — you're not storing images |
| Cloudinary storage | 25 GB free | ~3,000 full-res photos before any cost |

This stack costs **$0** indefinitely for a typical high school photographer.
