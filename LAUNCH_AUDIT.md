# Packworkz Full Launch Audit

Updated: 27 July 2026

## Decision

**Hold production launch.** The storefront and commerce application are in good
shape, but live selling is blocked by payment/session configuration and
supplier-certified landed costs.

## What passed

- 49 focused public product families: 41 online-priced and 8 quote-only.
- 1,290 generated SKU, size, tier and supported-configuration checks.
- Every checked row clears the 35% product gross-margin floor against the
  provisional cost currently entered in `LANDED_COSTS`.
- Configuration changes recalculate the price. Fixed-size instant products do
  not accept arbitrary dimensions.
- Custom dimensions, unusual print coverage, certifications, regulated formats
  and enterprise thresholds route to managed quote.
- Orders above Rs 50,000 do not open Razorpay; the order desk confirms the
  payment route.
- The server calculates the payable amount from the catalog source of truth.
  The browser cannot submit its own final price.
- Payment verification uses timing-safe Razorpay signature checks and a
  signature-verified webhook.
- Guest tracking requires both the Packworkz reference and matching checkout
  email or mobile. Invalid lookups return a generic response.
- Public signup, login, orders, quotes and a secure earlier-record claim flow
  are present. A guest can create an account after buying and link the verified
  order or quote to the dashboard.
- Desktop and mobile checks found no horizontal page overflow, visible broken
  images or application console errors across the main launch routes.
- All 49 public SKU families resolve to local, product-relevant imagery.
- Label shapes and box structures are separate, visual product pages.
- The landing page now uses the premium food-service container image for food
  and sustainable packaging, and SP-907 covers the Pepcom-style bowl and
  container size family.
- The favicon is a new navy-and-amber Packworkz mark with SVG and PNG fallback.
- The canonical sustainability route is `/sustainable`; `/sustainability`
  redirects safely.

## Production blockers

### P0 — commerce and accounts

1. `JWT_SECRET` is missing, so signup and login correctly return temporary
   unavailability instead of creating insecure sessions.
2. The configured Razorpay test credentials are rejected by Razorpay. Fixed
   service checkout currently returns a safe 502 response and makes no charge.
3. `RAZORPAY_WEBHOOK_SECRET` is missing. Register
   `https://packworkz.com/api/payments/webhook` for `payment.captured` and
   `order.paid`, then add the exact secret to the deployment.
4. Complete one real test-mode payment through the browser and verify:
   `payment_pending` -> `confirmed`, invoice creation, dashboard visibility,
   guest tracking and Slack notification.

### P0 — pricing

`LANDED_COSTS` is a provisional commercial model, not a supplier rate card.
Public marketplace prices are useful anchors but are not sufficient proof of
Packworkz's cost. Before activating a family:

1. Obtain at least two like-for-like written supplier quotes, and three for the
   expected top five families.
2. Match material/board, dimensions, thickness, print method and coverage,
   closure/lid, tooling, packing, freight, replacement policy and validity.
3. Use the higher realistic fully landed cost.
4. Rerun `pnpm --filter @workspace/packwerk audit:pricing` and the commerce
   tests; do not release a row below 35% product gross margin.

### P1 — evidence and compliance

- Confirm HSN, GST, invoice and food-contact treatment with the accountant and
  applicable manufacturer documentation.
- Obtain written permission for every customer logo, named testimonial and
  numerical trust claim. Remove claims that cannot be evidenced.
- Replace directory/marketplace image or copy provenance with licensed,
  Packworkz-owned assets before production publication.
- Rotate all credentials previously shared through chat or screenshots.

## Price evidence interpretation

- Kraftix's 500-piece printed stand-up pouch is a useful fixed-size retail
  anchor; it is not directly comparable to every barrier, closure or print
  configuration.
- Low-MOQ digital labels cannot be compared with a six-figure flexographic
  label listing.
- Corrugated prices must be matched by ply, GSM/burst strength, dimensions,
  print coverage and delivered volume.
- Bagasse and paper-container pricing must include the exact capacity, lid,
  food-contact specification and case quantity.

The row-level working ledger is
`artifacts/packwerk/docs/pricing-margin-audit.csv`. See
`PRICING_DUE_DILIGENCE.md` for the reviewed public market anchors.

## Final production gate

Launch only when `/ready` returns HTTP 200, a successful Razorpay test order is
visible in both guest tracking and the signed-in dashboard, the webhook confirms
the order independently, and every active online SKU has a dated supplier cost
owner and approved margin row.
