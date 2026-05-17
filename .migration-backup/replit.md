# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Packwerk — B2B Packaging Platform

### Architecture

- **Frontend**: React + Vite at `artifacts/packwerk`, served on port from `PORT` env var (currently 19798)
- **API Server**: Express 5 at `artifacts/api-server`, port 8080
- **Database**: Supabase (supabase-js REST API — no TCP required)

### Vite Proxy

`vite.config.ts` proxies `/api/*` requests to `http://localhost:8080` so frontend API calls work in dev without CORS issues.

### Auth

- Session-based auth with in-memory session map
- Password hashing: SHA-256 with salt `packwerk_salt_2024`
- `Authorization: Bearer <token>` header for authenticated API calls
- Admin panel uses `x-admin-key` header (set via `ADMIN_KEY` env var, default `packwerk-admin-2024`)

### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Replit managed PostgreSQL |
| `SESSION_SECRET` | Express session secret |
| `ADMIN_KEY` | Admin panel access key (default: `packwerk-admin-2024`) |
| `VITE_ADMIN_KEY` | Frontend admin key (same value) |
| `WHATSAPP_WEBHOOK_URL` | Optional webhook for WhatsApp notifications |
| `RAZORPAY_KEY_ID` | Razorpay API key ID (test: rzp_test_SgvQEkLJbWTRYs) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (test) |
| `VITE_RAZORPAY_KEY_ID` | Frontend Razorpay key (same as KEY_ID) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase credentials (stored but using Replit DB) |

### Database Tables

- `products` — 33 SKUs across 10 categories (seeded via `lib/db/seed-skus.ts`)
- `quotes` — Quote requests from businesses
- `orders` — Production orders
- `users_profile` — Customer accounts
- `invoices` — Billing records
- `design_requests` — Custom design briefs
- `sample_requests` — Sample orders
- `testimonials` — Customer testimonials

### Demo Credentials

- Email: `demo@packwerk.in` / Password: `Demo@1234`
- Email: `test@packops.in` / Password: `Test@1234`
- Admin key: `PackOps-Admin@2024!`

### Environment Variables (full list)

| Variable | Purpose | Default/Notes |
|---|---|---|
| `ADMIN_KEY` | Admin panel access key | `PackOps-Admin@2024!` |
| `OPENROUTER_API_KEY` | PackAI OpenRouter key | `sk-or-v1-173112b...` hardcoded fallback |
| `RESEND_API_KEY` | Email via Resend | Required for emails |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments | Test keys set |
| `VITE_RAZORPAY_KEY_ID` | Frontend Razorpay key | Same as KEY_ID |
| `TEAM_WHATSAPP_PHONE` | Receives new quote alerts | Update with real number |
| `SHEETDB_API_KEY` | Pushes quote submissions to Google Sheet | Awaiting API key from user |

### SQL Migration Required

Run `artifacts/api-server/sql_migration.sql` in Supabase SQL Editor to add:
- `quote_requests`: `admin_notes`, `payment_link`, `quoted_amount`, `delivery_date`, `payment_terms`, `artwork_option`, `sample_option`
- `orders`: `payment_link`

Until migration runs, admin notes fall back to `rejection_reason` JSON encoding.

### First-Login Password Change Flow

- When admin creates a user, `default_address: { must_change_password: true }` is set in Supabase
- On login, server reads this flag and returns `must_change_password: true` in response
- Frontend stores flag in localStorage user object and redirects to `/change-password`
- On password change, the flag is cleared from `default_address`

### SheetDB Integration

Quote submissions are pushed to a Google Sheet via SheetDB.
Set `SHEETDB_API_KEY` env var to the SheetDB API ID (not full URL — just the ID from `sheetdb.io/api/v1/{API_ID}`).
Columns in the sheet: `quote_id`, `contact_name`, `company_name`, `email`, `phone`, `product_name`, `quantity`, `delivery_country`, `delivery_pincode`, `artwork_option`, `sample_option`, `estimated_budget_min`, `estimated_budget_max`, `preferred_timeline`, `notes`, `design_paid`, `sample_paid`, `submission_date`

### PackAI Models (OpenRouter)

Preferred model rotation (in order): `google/gemma-4-26b-a4b-it:free`, `minimax/minimax-m2.5:free`, `qwen/qwen3-next-80b-a3b-instruct:free`, `openai/gpt-oss-120b:free`, `mistralai/mistral-nemo:free`, then legacy fallbacks.

### Pages

**Public**: `/`, `/products`, `/products/:slug`, `/quote` (6-step wizard), `/design`, `/samples`, `/login`, `/industries`, `/industries/:slug`, `/sustainable`
**Dashboard**: `/dashboard`, `/dashboard/orders`, `/dashboard/designs`, `/dashboard/payments`, `/dashboard/profile`
**Admin**: `/admin/quotes`, `/admin/orders`, `/admin/designs`, `/admin/samples`, `/admin/users` (Clients)

### Design System (Functional Brutalism)

- **Brand name**: "PackOps" (nav/UI), "Packwerk" (legal/DB)
- **Colors**: Navy `#0D1B2A`, Container `#0F1C2C`, Blue `#1B6CA8`, Amber `#E8A838`, Surface `#F8F9FC`
- **Fonts**: Space Grotesk (headlines), Plus Jakarta Sans (body), Manrope (numbers/stats), JetBrains Mono (dashboard stats)
- **Images**: `src/lib/images.ts` — `getProductImage()` fallback using 8 confirmed Unsplash photo IDs mapped by category/keyword

### Key Features

- 33 product SKUs across 10 categories; `/sustainable` page showcases all 12 certified eco SKUs
- SKU schema: each has `variants` (decision-oriented option groups) and `customization_fields` stored in `specs` JSONB column
- SKU catalog defined client-side in `artifacts/packwerk/src/lib/skus.ts` and mirrored to DB via `lib/db/seed-skus.ts`
- Industries section: 8 verticals (food, pharma, cosmetics, ecommerce, fmcg, industrial, agriculture, electronics) with dedicated landing pages
- 6-step quote wizard with Razorpay integration: Step 3 (design ₹1,999), Step 5 (Express sample ₹4,999)
- Razorpay API route: `POST /api/payments/create-order` + `POST /api/payments/verify` in `api-server/src/routes/payments.ts`
- Frontend Razorpay utility: `artifacts/packwerk/src/lib/razorpay.ts` (openRazorpay function)
- 7 new home sections: BrandAdvantage (orbital + accordion), Sustainable, PackOS (5-node flow), FactoryNetwork (world map SVG), Testimonials, Certifications, Final CTA (Section G)
- Client logo marquee in hero section with 12 sample brand names
- Global WhatsApp float button (bottom-right, #25D366) in PublicLayout.tsx
- Customer dashboard "COMMAND CENTER" with deployments table and system health
- Savings calculator on home page (unit savings + overhead + credit + stockout formulas)
- Admin panel for managing quotes, orders, designs, samples, and clients (Create/Reset PW/Delete)
- DB connection: `lib/db/src/index.ts` tries `SUPABASE_DATABASE_URL` first (production), auto-falls back to `DATABASE_URL` (local Replit Postgres for dev). Supabase TCP resolves IPv6-only from Replit dev container so fallback is automatic.
- Supabase project: `tmvbjbmudxyvimdnhrmw` — all 8 tables created and data migrated. Management API used for DDL (PAT stored as `SUPABASE_ACCESS_TOKEN`).
- Email: Resend (`RESEND_API_KEY` secret). Sends from `onboarding@resend.dev`. Three email types: quote confirmation (`sendQuoteConfirmation`), design confirmation (`sendDesignConfirmation`), sample confirmation (`sendSampleConfirmation`). All in `artifacts/api-server/src/lib/email.ts`.
- Admin credentials: `x-admin-key: PackOps-Admin@2024!` (env var `ADMIN_KEY`); stored in `localStorage.packwerk_admin_key` on login
- Net-30 credit system (unlocks after 3 completed orders)
- CSS animations: pulse-glow, slideIn, flow-dot (for orbital/PackOS sections), marquee-track (client logos)
- INR formatting throughout; WhatsApp placeholder number: 919999999999 (update when ready)
