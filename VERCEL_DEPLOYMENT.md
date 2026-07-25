# 🚀 Vercel Deployment Guide for XN Reward ($NXB)

Follow these simple steps to deploy your **XN Reward ($NXB)** Tap-to-Earn WebApp to Vercel for FREE:

---

## 1️⃣ Connect Code to GitHub
1. Export or sync your codebase to a **GitHub Repository** (e.g., `xn-reward-app`).
2. Make sure all files (including `vercel.json`, `api/index.ts`, and `supabase_schema.sql`) are committed.

---

## 2️⃣ Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **"Import Project"** and select your GitHub repository (`xn-reward-app`).
3. Vercel will automatically detect **Vite** framework settings.

---

## 3️⃣ Set Environment Variables in Vercel
In the Vercel project deployment screen, expand **Environment Variables** and add:

| Key | Example / Default Value |
| --- | --- |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` *(Your Supabase Service Role Key)* |
| `BREVO_API_KEY` | `xkeysib-...` *(Your Brevo API Key)* |
| `BREVO_SENDER_EMAIL` | `noreply@yourdomain.com` |
| `RESEND_API_KEY` | `re_...` *(Your Resend API Key)* |
| `IMGBB_API_KEY` | *(Your ImgBB API Key)* |

---

## 4️⃣ Click Deploy!
1. Click **Deploy**.
2. Vercel will build your Vite frontend assets and deploy the backend Serverless API at `/api/*`.
3. Your live application will be available at `https://your-project.vercel.app`!

---

## 🗄️ Database Setup (Supabase)
If you haven't run the SQL script in Supabase yet:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project -> Go to **SQL Editor** -> Click **New Query**.
3. Copy all code from `supabase_schema.sql` (found in project root) and click **Run**.

---

## ✅ Admin Access
- **Admin Email**: `admin@gmail.com`
- **Admin Password**: `admin123`
- Access Admin Panel directly from the Header badge or Account dropdown.
