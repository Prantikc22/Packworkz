# Packworkz

India's First Managed Packaging Platform — a B2B web app where brands can browse 110+ packaging SKUs, request quotes, order samples, track orders, and manage design requests.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/packwerk run dev` — run the frontend (port 19798)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `npx tsx lib/db/seed-skus.ts` — seed the database with 33 packaging SKUs
- Required env: `DATABASE_URL` — Postgres connection string (auto-set by Replit DB)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, wouter for routing, shadcn/ui components
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (local Replit DB, with Supabase fallback)
- Auth: Custom JWT-based auth stored in localStorage (`packwerk_access_token`)
- Admin: Header-based admin key auth (`x-admin-key`)
- Payments: Razorpay integration
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/packwerk/` — React + Vite frontend
- `artifacts/api-server/` — Express 5 backend
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod schemas
- `lib/db/` — Drizzle ORM schema + migrations
- `lib/db/seed-skus.ts` — Product seed script (33 SKUs)
- `attached_assets/` — Images and design assets

## Architecture decisions

- Supabase is used as primary DB connection (hardcoded URL/key); Replit local Postgres as fallback. In Replit dev, Supabase TCP may be unreachable (IPv6-only) and falls back automatically.
- Admin auth uses a simple header key (`ADMIN_KEY` env var, default `packwerk-admin-2024`) — not JWT.
- User auth uses JWT tokens stored in localStorage, sent as `Authorization: Bearer <token>`.
- API request bodies in OpenAPI spec use entity-shaped `$ref` component names (not inline) to avoid Orval TS2308 collisions.
- The `db` export is declared before the async connectivity probe to avoid TS2448/TS2454 errors.

## Product

- **Public site**: Home, Products catalogue, Product detail, Industries, How It Works, Sustainability, About
- **Quote flow**: Multi-product quote request form
- **Sample flow**: Sample request with payment via Razorpay
- **Design flow**: Custom design request with payment
- **Customer dashboard**: Orders, Quotes, Designs, Invoices, Profile
- **Admin panel**: Manage quotes, orders, designs, samples, users

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml`
- OpenAPI request body schemas must use `$ref` to named components (not inline) — inline bodies cause TS2308 collisions after codegen
- Supabase direct TCP (db.*.supabase.co:5432) resolves IPv6-only from Replit dev containers and will fail; the app automatically falls back to local `DATABASE_URL`
- Do NOT run `pnpm dev` at workspace root — use workflow or `pnpm --filter @workspace/<slug> run dev`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
