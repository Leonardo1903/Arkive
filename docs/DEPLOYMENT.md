# Deployment & Operations Guide

| Project | **Last Updated** | **Node Version** | **Package Manager** |
| :--- | :--- | :--- | :--- |
| Arkive | December 17, 2025 | v18.17.0+ (LTS) | npm/pnpm/yarn |

---

## 1. Prerequisites
Before you begin, ensure you have the following installed locally:
* **Node.js:** v18.17.0 or higher (LTS recommended)
* **npm:** v9+ (or pnpm v8+ / yarn v1.22+)
* **Git:** For cloning the repository
* **PostgreSQL Client:** (Optional) For direct database access via CLI

**Cloud Services Required:**
* **Clerk Account:** For authentication ([clerk.com](https://clerk.com))
* **ImageKit Account:** For file storage ([imagekit.io](https://imagekit.io))
* **Neon Account:** For serverless PostgreSQL ([neon.tech](https://neon.tech))
* **Vercel Account:** (Optional) For production deployment ([vercel.com](https://vercel.com))

---

## 2. Environment Variables
Create a `.env.local` file in the root directory. You can copy the template:

```bash
cp .env.sample .env.local
```

**Required Variables:**

| Variable | Description | Example |
| :--- | :--- | :--- |
| **Clerk Authentication** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key (client-side) | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page URL | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Post-login redirect | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Post-signup redirect | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Fallback redirect | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Fallback redirect | `/` |
| **ImageKit Storage** |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit public key | `public_...` |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server-side) | `private_...` |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit CDN endpoint | `https://ik.imagekit.io/your_id` |
| **Database** |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| **Application** |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app | `http://localhost:3000` (dev) or `https://arkive.vercel.app` (prod) |

---

## 3. Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/arkive.git
cd arkive
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended for faster installs)
pnpm install

# Using yarn
yarn install
```

### Step 3: Set Up Clerk Authentication
1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. Copy the **Publishable Key** and **Secret Key** to your `.env.local`
4. Configure sign-in/sign-up options:
   - Enable **Email** authentication
   - Enable **Username** field
   - Enable **First Name** and **Last Name** fields
   - Enable **Profile Image** uploads

### Step 4: Set Up ImageKit Storage
1. Create a free account at [imagekit.io](https://imagekit.io)
2. Go to **Developer Options** in the dashboard
3. Copy the following to your `.env.local`:
   - **Public Key** → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - **Private Key** → `IMAGEKIT_PRIVATE_KEY`
   - **URL Endpoint** → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
4. Configure CORS settings:
   - Go to **Settings** → **CORS**
   - Add `http://localhost:3000` for development

### Step 5: Set Up Database
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project (select region closest to your users)
3. Copy the **Connection String** to your `.env.local` as `DATABASE_URL`
4. Run database migrations:

```bash
# Generate migration SQL
npm run db:generate

# Apply migrations to database
npm run db:push

# (Optional) Open Drizzle Studio to view database
npm run db:studio
```

### Step 6: Start the Development Server
```bash
npm run dev
```

**Access Points:**
- **Frontend:** http://localhost:3000
- **API Routes:** http://localhost:3000/api/*

### Step 7: Verify Setup
1. Open http://localhost:3000
2. Click **Get Started** to sign up
3. Complete email verification
4. Upload a test file to verify ImageKit integration
5. Check database in Drizzle Studio (`npm run db:studio`) to confirm data is being saved

---

## 4. Database Management

### Running Migrations
When you make changes to the schema in `src/lib/schema.ts`:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:push
```

### Viewing Database
```bash
# Open Drizzle Studio (visual database browser)
npm run db:studio
```

Access at: http://localhost:4983

### Backup Database
```bash
# Export data using Neon CLI
neonctl db export --connection-string="YOUR_DATABASE_URL" --output=backup.sql
```

### Reset Database (Development Only)
```bash
# Drop all tables and re-run migrations
npm run db:push -- --force
```

**Warning:** This will delete all data. Only use in development.

---

## 5. Production Deployment

### Deploying to Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications. It provides zero-config deployment with automatic HTTPS, CDN, and serverless functions.

#### Step 1: Prepare for Deployment
1. Ensure all environment variables are set correctly
2. Run linting and type checks:

```bash
npm run lint
npm run type-check  # (if you have this script)
```

3. Test production build locally:

```bash
npm run build
npm run start
```

#### Step 2: Deploy to Vercel

**Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

6. Add Environment Variables:
   - Click **Environment Variables** tab
   - Add all variables from your `.env.sample`
   - Use production values for:
     - `NEXT_PUBLIC_APP_URL` → Your Vercel domain (e.g., `https://arkive.vercel.app`)
     - `DATABASE_URL` → Production Neon database URL

7. Click **Deploy**

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 3: Configure Custom Domain (Optional)
1. Go to your project on Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `arkive.com`)
4. Update DNS records as instructed by Vercel
5. Update `NEXT_PUBLIC_APP_URL` environment variable with new domain

#### Step 4: Enable Automatic Deployments
Vercel automatically deploys on every push to `main` branch:
- **Production:** `main` branch → Production deployment
- **Preview:** Pull requests → Preview deployments with unique URLs

---

## 6. Alternative Deployment Platforms

### Netlify
1. Connect GitHub repository
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
3. Add environment variables in Netlify dashboard
4. Enable **Next.js Runtime** plugin

### Self-Hosted (Docker)
Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
# Build image
docker build -t arkive .

# Run container
docker run -p 3000:3000 --env-file .env.local arkive
```

---

## 7. Post-Deployment Checklist

After deploying to production, verify the following:

- [ ] **Authentication:** Sign up and sign in flow works
- [ ] **Email Verification:** OTP codes are received and work
- [ ] **File Upload:** Files upload successfully to ImageKit
- [ ] **File Download:** Files can be accessed via CDN URLs
- [ ] **Search:** Search functionality returns correct results
- [ ] **Dark Mode:** Theme toggle works and persists
- [ ] **Mobile:** Test on mobile devices for responsiveness
- [ ] **Performance:** Run Lighthouse audit (target: 90+ score)
- [ ] **Security:** Check for exposed secrets in client-side code
- [ ] **Database:** Verify connection pooling is working (Neon dashboard)
- [ ] **Error Handling:** Test error scenarios (invalid uploads, network failures)

---

## 8. Monitoring & Maintenance

### Performance Monitoring
**Vercel Analytics (Included with Pro Plan):**
- Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Speed Insights

**Alternative: Google Lighthouse CI**
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --config=lighthouserc.json
```

### Error Tracking
**Integrate Sentry (Recommended):**
```bash
npm install @sentry/nextjs

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

Configure `sentry.client.config.ts` and `sentry.server.config.ts`

### Database Monitoring
- **Neon Dashboard:** Monitor connection pool usage, query performance
- **Query Optimization:** Add indexes if slow queries detected
- **Connection Limits:** Free tier: 100 connections, Scale plan: 1000+

### Storage Monitoring
- **ImageKit Dashboard:** Track bandwidth usage (20GB free tier)
- **Storage Quota:** Monitor file count and total size
- **CDN Performance:** Check cache hit ratio

---

## 9. Backup & Disaster Recovery

### Database Backups
**Neon Automatic Backups:**
- Point-in-time recovery (PITR) available on paid plans
- Automatic daily snapshots retained for 7 days (free tier)

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20251217.sql
```

### File Storage Backups
**ImageKit:**
- Files are stored redundantly across multiple regions
- No manual backup needed (99.9% durability SLA)
- For extra safety, sync to S3/Google Cloud Storage using ImageKit webhooks

### Code Repository Backups
- **Primary:** GitHub (automatic)
- **Mirror:** GitLab/Bitbucket (optional for redundancy)

---

## 10. Scaling Considerations

### When to Scale

| Metric | Free Tier Limit | Scale Plan |
| :--- | :--- | :--- |
| **Clerk MAU** | 10,000 users | Pro: 100,000+ |
| **ImageKit Bandwidth** | 20GB/month | Pro: 200GB/month |
| **Neon Database** | 0.5GB storage | Scale: 10GB+ |
| **Vercel Builds** | 6,000 build minutes/month | Pro: 24,000 minutes |

### Optimization Tips
1. **Enable Next.js Image Optimization:** Use `next/image` component (already implemented)
2. **Lazy Load Components:** Use `next/dynamic` for heavy components
3. **Reduce Bundle Size:** Run `npm run build` and check bundle analyzer
4. **Add CDN Caching:** Configure `Cache-Control` headers for static assets
5. **Database Indexing:** Add indexes to frequently queried columns

---

## 11. Common Issues & Troubleshooting

### Issue: "Clerk Session Invalid" Error
**Symptoms:** User is logged out repeatedly or API returns 401 errors

**Fix:**
1. Verify `CLERK_SECRET_KEY` is set correctly in production environment
2. Check Clerk dashboard → **API Keys** → Ensure using Production keys (not Test keys)
3. Clear browser cookies and try signing in again
4. Ensure `NEXT_PUBLIC_APP_URL` matches your actual domain

---

### Issue: "ImageKit Upload Failed"
**Symptoms:** File upload shows error or times out

**Fix:**
1. Check ImageKit dashboard → **Usage** → Ensure bandwidth limit not exceeded
2. Verify `IMAGEKIT_PRIVATE_KEY` is correct (server-side only)
3. Check CORS settings in ImageKit dashboard (must include your domain)
4. Test direct upload via ImageKit dashboard → **Media Library** → **Upload**
5. Check browser console for CORS errors

---

### Issue: "Database Connection Pool Exhausted"
**Symptoms:** API returns 500 errors, Neon dashboard shows high connection count

**Fix:**
1. Neon free tier limits: 100 concurrent connections
2. Ensure you're using connection pooling (Drizzle handles this automatically)
3. Add `?connection_limit=50` to your `DATABASE_URL`
4. Check for slow queries in Neon dashboard → **Monitoring**
5. Add missing indexes to speed up queries

---

### Issue: "Next.js Build Fails on Vercel"
**Symptoms:** Deployment fails during build step

**Fix:**
1. Check Vercel build logs for specific error
2. Common causes:
   - TypeScript errors: Run `npm run build` locally to catch issues
   - Missing environment variables: Ensure all `NEXT_PUBLIC_*` vars are set
   - Node version mismatch: Set `"engines": { "node": "18.x" }` in `package.json`
3. Verify `next.config.ts` doesn't have syntax errors
4. Clear Vercel build cache: **Project Settings** → **General** → **Clear Build Cache**

---

### Issue: "Dark Mode Flash on Page Load"
**Symptoms:** Brief white flash before dark mode applies

**Fix:**
1. Ensure `suppressHydrationWarning` is on `<html>` tag in `app/layout.tsx` ✅ (already implemented)
2. Verify `next-themes` provider wraps entire app ✅ (already implemented)
3. Check browser cache is not blocking theme script

---

### Issue: "Search Returns No Results"
**Symptoms:** Search works locally but not in production

**Fix:**
1. Check database connection in production (Neon dashboard)
2. Verify search API route has proper error handling
3. Test search API directly: `curl https://your-domain.vercel.app/api/search?q=test&ownerId=user_xxx`
4. Check for special characters in search query (may need URL encoding)

---

### Issue: "File Download/Preview Not Working"
**Symptoms:** Files upload successfully but can't be accessed

**Fix:**
1. Check ImageKit URLs are using HTTPS (not HTTP)
2. Verify `next.config.ts` includes `img.clerk.com` and `ik.imagekit.io` in `remotePatterns` ✅ (already implemented)
3. Check browser console for CSP (Content Security Policy) errors
4. Test direct ImageKit URL in browser (should display file)

---

## 12. Development Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Apply schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

---

## 13. Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to Git (already in `.gitignore`)
- ✅ Use different keys for development and production
- ✅ Rotate API keys every 90 days
- ✅ Use Vercel/Netlify secret encryption for sensitive values

### Authentication
- ✅ Clerk handles password security (bcrypt hashing)
- ✅ Email verification required before account activation
- ✅ Session tokens are httpOnly cookies (XSS protection)
- ⚠️ TODO: Implement 2FA (Two-Factor Authentication) for admin accounts

### File Upload Security
- ✅ ImageKit generates signed upload tokens (time-limited)
- ✅ File type validation on client-side
- ⚠️ TODO: Add server-side file size validation
- ⚠️ TODO: Implement virus scanning for uploaded files (ClamAV integration)

### Database Security
- ✅ All queries parameterized (SQL injection protection via Drizzle)
- ✅ User data isolated by `ownerId` (no cross-user access)
- ✅ SSL/TLS encryption for database connections (Neon enforces this)
- ⚠️ TODO: Add audit logging for sensitive operations (delete, move)

---

## Appendix: Related Documents
- [PRD.md](./PRD.md) - Product requirements and user stories
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical design
- [API.md](./API.md) - Detailed API endpoint documentation
- [README.md](../README.md) - Project overview and quick start

---

## Support & Contact
For deployment issues or questions:
- **GitHub Issues:** [github.com/yourusername/arkive/issues](https://github.com/yourusername/arkive/issues)
- **Clerk Support:** [clerk.com/support](https://clerk.com/support)
- **ImageKit Support:** [imagekit.io/support](https://imagekit.io/support)
- **Neon Support:** [neon.tech/docs](https://neon.tech/docs)
