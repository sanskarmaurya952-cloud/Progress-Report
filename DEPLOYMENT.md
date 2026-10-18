# 🚀 ALPHA++ (Progress Report) — Deployment Guide

This guide covers deploying the full application for **100% FREE** using modern cloud providers:
- **Database (PostgreSQL)**: [Neon.tech](https://neon.tech) (Free Serverless Postgres) or [Supabase](https://supabase.com)
- **Backend (Express + Prisma)**: [Render.com](https://render.com) (Free Web Service)
- **Frontend (React + Vite)**: [Vercel](https://vercel.com) (Free Global Edge CDN) or Render Static Site

---

## Step 1: Create Free PostgreSQL Database (Neon.tech)

1. Go to [https://neon.tech](https://neon.tech) and sign up with your GitHub account.
2. Click **Create Project**, name it `alpha-plus-db`, and select region **AWS Asia Pacific (Singapore / Mumbai)** or closest to you.
3. Once created, copy the **Connection string** (it looks like `postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`).
4. Save this URL — this is your `DATABASE_URL`.

---

## Step 2: Deploy Backend to Render.com

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your repository: `sanskarmaurya952-cloud/Progress-Report`.
4. Configure the Web Service:
   - **Name**: `alpha-plus-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Singapore (or closest to your DB)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma db push && npm start`
5. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL` = `<your Neon connection string>`
   - `SESSION_SECRET` = `<any long random string e.g. alpha_secret_key_8756_prod>`
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app` *(update once frontend is deployed)*
   - `COOKIE_SAMESITE` = `none`
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g. `https://alpha-plus-api.onrender.com`).
   - Check health endpoint: `https://alpha-plus-api.onrender.com/api/v1/health`

---

## Step 3: Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import `sanskarmaurya952-cloud/Progress-Report`.
4. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit -> select `client`
5. Expand **Environment Variables**:
   - `VITE_API_URL` = `https://alpha-plus-api.onrender.com` *(your backend URL from Step 2)*
6. Click **Deploy**.
7. Vercel will give you a domain like `https://progress-report.vercel.app`.

---

## Step 4: Final Linkup

1. Go back to **Render** -> your `alpha-plus-api` service -> **Environment**.
2. Set `CLIENT_URL` to your Vercel URL (e.g. `https://progress-report.vercel.app`).
3. Click **Save Changes** (Render will automatically redeploy).

🎉 **Congratulations! Your full-stack ALPHA++ application is live on the internet!**
