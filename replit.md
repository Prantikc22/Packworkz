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
- **Database**: Replit PostgreSQL via `DATABASE_URL` env var

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
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase credentials (stored but using Replit DB) |

### Database Tables

- `products` — 94 SKUs across 8 categories
- `quotes` — Quote requests from businesses
- `orders` — Production orders
- `users_profile` — Customer accounts
- `invoices` — Billing records
- `design_requests` — Custom design briefs
- `sample_requests` — Sample orders
- `testimonials` — Customer testimonials

### Demo Credentials

- Email: `demo@packwerk.in`
- Password: `demo123`
- Admin key: `packwerk-admin-2024`

### Pages

**Public**: `/`, `/products`, `/products/:slug`, `/quote` (6-step wizard), `/design`, `/samples`, `/login`, `/industries`, `/industries/:slug`
**Dashboard**: `/dashboard`, `/dashboard/orders`, `/dashboard/designs`, `/dashboard/payments`, `/dashboard/profile`
**Admin**: `/admin/quotes`, `/admin/orders`, `/admin/designs`, `/admin/samples`

### Design System (Functional Brutalism)

- **Brand name**: "PackOps" (nav/UI), "Packwerk" (legal/DB)
- **Colors**: Navy `#0D1B2A`, Container `#0F1C2C`, Blue `#1B6CA8`, Amber `#E8A838`, Surface `#F8F9FC`
- **Fonts**: Space Grotesk (headlines), Plus Jakarta Sans (body), Manrope (numbers/stats), JetBrains Mono (dashboard stats)
- **Images**: `src/lib/images.ts` — `getProductImage()` fallback using 8 confirmed Unsplash photo IDs mapped by category/keyword

### Key Features

- 110+ product SKUs across 8 categories with SmartStock/Eco badges, INR pricing, contextual images
- Industries section: 8 verticals (food, pharma, cosmetics, ecommerce, fmcg, industrial, agriculture, electronics) with dedicated landing pages
- 6-step quote wizard
- Design brief request (3-step: product type → brand assets → checkout)
- Sample order with 3 tiers (Standard ₹2,999, Premium ₹4,999, Complex ₹7,999)
- Customer dashboard "COMMAND CENTER" with deployments table and system health
- Savings calculator on home page (unit savings + overhead + credit + stockout formulas)
- Admin panel for managing quotes, orders, designs, samples
- Net-30 credit system (unlocks after 3 completed orders)
- WhatsApp notification abstraction (silent fallback if webhook not set)
- INR formatting throughout
