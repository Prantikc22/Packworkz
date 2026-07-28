# Packworkz Catalog and Commerce Audit

Updated: 27 July 2026

## Launch decision

Launch with **49 focused product families** across nine categories. Customers see
only two buying paths:

1. **Instant buy** for a fixed production size and repeatable specification.
   Quantity pricing, configuration effects, artwork, delivery, GST and payment
   are handled in one Packworkz flow.
2. **Request quote** for rollstock, line-applied formats, unusual print coverage,
   custom dimensions, tooling, regulated packs, certifications and enterprise
   thresholds.

An instant product automatically becomes a managed quote when its quantity or
configuration crosses a review threshold. Packworkz is the commerce system of
record; Razorpay is only the payment gateway.

## Assortment

| Category | Public families |
| --- | ---: |
| Flexible packaging | 6 |
| Bottles and containers | 6 |
| Tubes and small packs | 1 |
| Boxes and cartons | 8 |
| E-commerce packaging | 7 |
| Protective packaging | 2 |
| Packaging rolls | 3 |
| Labels and brand extras | 13 |
| Sustainable food-service | 3 |
| **Total** | **49** |

There are **41 online-priced families** and **8 quote-only families**. The broad
supplier library remains internal so the storefront does not become a directory
of duplicate or unvalidated edge cases.

## Labels and boxes

The live catalog deliberately gives visually distinct label shapes and box
structures their own pages. This is useful for first-time D2C buyers even when
some products share a manufacturing route.

Public label families are round, square, rectangular, oval, custom die-cut,
waterproof BOPP/vinyl, clear, shrink-sleeve/wrap-around, hang tags/inserts,
printed tissue, packaging tape, machine-applied roll labels, and foil/special
effects.

Public box families are straight-tuck, reverse-tuck, auto-bottom, window,
sleeve-and-tray, two-piece rigid, magnetic-closure, and collapsible rigid.

Dimensions remain fixed for online checkout. A custom size, unusual board,
structural engineering requirement, special application condition, or
non-standard print coverage moves to a managed quote.

## Stand-up pouch ladder

The low-MOQ tier uses a higher-cost production route:

| Quantity | Base route | Ex-GST base unit price |
| ---: | --- | ---: |
| 250 | Fixed-size short-run production | Rs 22.00 |
| 500 | Fixed-size direct digital print | Rs 17.50 |
| 1,000 | Direct print | Rs 13.50 |
| 2,500 | Direct print | Rs 9.80 |
| 5,000 | Direct print | Rs 7.80 |

Size, closure, material, finish and branding selections change the price.
Coffee valves, premium films, soft-touch/foil effects and direct full-colour
printing all carry configuration multipliers. Custom dimensions and technical
specifications leave online checkout.

## Pricing status

The code applies an 8% landed-cost load for expected wastage/rejection, inward
freight and production packing, then enforces a 35% product gross-margin floor.
The commerce test suite sweeps every fixed tier, size and supported
configuration.

This is a **software control, not procurement certification**. Public Kraftix,
Pepcom, TradeIndia, ExportersIndia and IndiaMART-linked pages establish retail
or directory anchors. They do not establish Packworkz's exact landed cost.
Before enabling live payment for a family, obtain at least two matched written
supplier quotes with material, dimensions, print method/coverage, closure,
tooling, packing, freight, rejection allowance and validity.

Use gross margin, not markup:

`selling price = fully loaded landed cost / (1 - target gross margin)`

Do not accept a supplier teaser rate that omits plates, cylinders, dies, white
ink, closures, lids, freight, GST treatment or replacements.

## Commerce controls

- The server recalculates payable totals from the catalog source of truth.
- The browser never supplies the final payable amount.
- Eligible instant orders up to Rs 50,000 open Razorpay.
- Larger totals and quote products create a managed payment confirmation task.
- Payment success requires Razorpay signature or webhook verification.
- Guest tracking uses order reference plus checkout email/mobile.
- Account holders can see and claim verified orders and quotes in the dashboard.
- GSTIN is optional unless the buyer requests a business tax invoice.

## Launch blockers

The configured Supabase REST endpoint is responding in the latest local
readiness check. Account creation is still deliberately unavailable because
`JWT_SECRET` is not present in the runtime environment. Add a strong,
deployment-specific secret before enabling signup and login.

Razorpay test mode is wired, but the configured test credentials currently
receive an authentication failure from Razorpay. A dedicated
`RAZORPAY_WEBHOOK_SECRET` is also absent. Replace or reactivate the test keys,
register the webhook, and complete a successful payment-to-confirmed-order test
before enabling live checkout.

Every online family also remains commercially blocked until its provisional
`LANDED_COSTS` entry is replaced by a matched, written supplier rate card.
