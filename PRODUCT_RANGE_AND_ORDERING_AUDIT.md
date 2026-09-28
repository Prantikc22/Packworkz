# Packworkz — Ordering Flow & Product Range Audit

**Audit date:** 28 September 2026
**Scope:** `/products` listing, `/products/:slug` detail, `/configure` wizard, cart/checkout, and the published catalogue compared with EzPac, Nexibles and Packhelp.
**Catalogue snapshot:** 47 published product families (16 instant-buy, 31 request-quote).

---

## Part A — Ordering flow

### P0: fix before scaling paid traffic

| # | Issue | Where | Why it matters | Fix |
|---|---|---|---|---|
| A1 | **Artwork upload fails silently.** If `/api/upload/artwork` errors, the wizard stores `local:<filename>` and lets the order continue. | `src/pages/quote.tsx:755-762` | A paid order can reach prepress with no artwork file. The customer believes they uploaded it. | Block progress on failure with a visible retry, or offer an explicit “I’ll email artwork later” option that is stored on the order. |
| A2 | **Certifications are guessed from the eco flag.** Every non-eco product shows “ISO” and “BRC-ready”; every eco product shows “FSC” and “EPR-ready”. | `src/pages/product-detail.tsx:93` | Tape, tissue and labels display food-safety certifications that were never verified for that SKU. This is a claims risk. | Store certifications per SKU in the catalogue, or remove the Compliance tab until the data exists. |
| A3 | **Global delivery time is invented** as India lead time + 14 days. | `src/pages/product-detail.tsx:359` | It shows a precise promise for every destination. | Replace with “Quoted per destination” or collect a country before showing a date. |

### P1: conversion

| # | Issue | Evidence | Recommendation |
|---|---|---|---|
| A4 | **Products start two screens down.** The intro, showcase banner, family rail and sticky filter bar stack above the grid. | First card at **1,232 px** on desktop (900 px viewport) and **1,598 px** on mobile (812 px). | Collapse the showcase into a slim category header. Show the grid within the first viewport. |
| A5 | **66% of the catalogue shows no price at all.** Quote-path cards and detail pages show “Detailed quote in 4 business hours” in place of a price. | 31 of 47 families. The catalogue already holds `estimate` ranges for most of them. | Show “Indicative from ₹X/unit at N units”, with the quote as the confirmation step. Packhelp prices everything instantly, and a price anchor is the strongest filter for B2B intent. |
| A6 | **The same product is configured twice.** The detail page collects size, variants and quantity, then “Add to cart” opens the 4-step `/configure` wizard, which asks again. | `product-detail.tsx`, where `addToCartHref` points to `/configure` | For instant-buy SKUs, make “Add to cart” add directly with the chosen spec. Collect artwork at checkout or after payment, as Packhelp and Nexibles do. |
| A7 | **Filters don’t live in the URL.** Only `?category`/`?industry` are read once. Search, mode and eco state are lost on Back and can’t be shared. | `src/pages/products.tsx` | Sync all filter state to the query string. |
| A8 | **The industry filter is invisible.** `?industry=food-beverage` narrows results with no chip or label, so users can’t see why items are missing. | `products.tsx` (industry has no UI) | Show an active-filter chip row with individual clear buttons. |
| A9 | **No sort.** | — | Add Recommended / Lowest MOQ / Lowest price / Fastest production. |
| A10 | **The detail page is thin for a ₹10k–₹2L purchase:** a single image, no breadcrumb, native `<select>`s, no FAQ, no reviews, no “pairs well with”, and no mobile sticky price/CTA bar. | `product-detail.tsx` | Add a gallery (flat, in-hand, close-up of finish), visual swatches for material/finish, a size diagram, an FAQ and a mobile sticky bar. Add cross-sells such as mailer box → tissue → tape → thank-you card. |
| A11 | **Card noise.** A running index (“01”, “02”…) and a “Custom printed” badge appear on every card, and two icon systems are loaded (Material Symbols webfont plus lucide). | `products.tsx` | Drop the index and the universal badge. Move to lucide only to save a font request. |
| A12 | **The sample kit is not sold inside the catalogue.** At ₹299, it is the cheapest way into the funnel. | — | Add a sample-kit promo card after the first grid row and in the empty state. |

### P2: retention and depth

- **Reorder:** one-click reorder of a past spec from the dashboard. Nexibles advertises this and it drives repeat revenue.
- **Batch calendar:** Nexibles shows the live batch (“Artwork cut-off 29 Sept → Dispatch 8–10 Oct”). A cut-off date creates honest urgency and sets expectations. It suits stock-size pouches and labels.
- **Recently viewed / compare:** useful once the catalogue passes about 60 families.
- **Payment terms for enterprise:** Packhelp offers up to 120 days. Even “Net 30 for approved accounts” on `/enterprise` would move large buyers.
- **Warehousing and call-off:** Packhelp stores stock and ships on demand. Packworkz already has “Warehouse Hold” in the wizard, so productise it as SmartStock call-off.

---

## Part B — Product range vs. competitors

### What each competitor does well

| Competitor | Positioning | What to learn |
|---|---|---|
| **EzPac** | Retail boxes for Indian SMEs, sold by use case (soap, perfume, mithai, pooja, gift) | Industry- and occasion-named box styles that a founder searches for by name. |
| **Nexibles** | Digital-print pouches, 500 MOQ, standard sizes | Pouch *construction* choice (8 types), **add-ons** (Euro/hang hole, round corners, tear notch, window), **finishes** (gloss/matte/soft-touch), and batch dispatch dates. |
| **Packhelp** | Self-serve boxes and mailers across the EU | Live 3D editor with instant price, sample packs, 48h delivery on selected items, eco data, payment terms, and branded merchandise. |

### Gaps, grouped by effort

**1. Already modelled in `src/lib/catalog-expansion.ts` but not published.** These are the cheapest wins: data, pricing tiers and specs exist, and they only need images and publication.

| Code | Format | Competitor that sells it |
|---|---|---|
| FP-106 | Three-side seal pouch | Nexibles |
| FP-107 | Side gusset pouch | Nexibles |
| FP-108 | Quad seal pouch | Nexibles |
| FP-109 | Coffee pouch with degassing valve | Nexibles (coffee/tea is its core buyer) |
| FP-113 | Stand-up refill pouch | — |
| BX-404 | Auto-bottom (crash-lock) carton | EzPac |
| BX-405 | Sleeve and tray box | EzPac (“slider box”) |
| BX-406 | Window carton | EzPac (window / gift box with window) |
| BX-407 | Gable and handle box | EzPac (bakery/snack), Packhelp |
| BX-408 | Collapsible rigid box | Packhelp |
| BX-412 | Reverse tuck end carton | EzPac |
| BC-207 / BC-209 / BC-210 | PET jar, metal tin, food tub | Packhelp (containers) |
| TS-304 | Paper tube | Packhelp (cardboard tubes) |
| EC-511 | Cotton & jute drawstring bag | Packhelp (product bags) |
| EC-512 | Rigid document envelope | Packhelp (envelopes) |
| PR-603 / PR-604 | Honeycomb wrap, crinkle filler | Packhelp (void fill) |

**2. Missing entirely: add these**

| Format | Why | Seen at |
|---|---|---|
| **Pillow box** | A top seller for soap, jewellery and small gifts. Cheap, flat-packed, and suited to 50–100 MOQ. | EzPac |
| **Drawer / slider box** (thin and thick wall) | A premium D2C unboxing staple, distinct from sleeve & tray. | EzPac |
| **Hanging / Euro-hole display box** | Retail peg display for accessories, cosmetics and mobile covers. | EzPac |
| **Counter display box (CDU/PDQ)** | Needed for FMCG and beauty retail launches. It is a natural enterprise upsell. | EzPac (display products) |
| **Mithai, sweet & festive gift boxes** | High-volume Indian seasonal demand (Diwali, weddings, corporate gifting). Worth a **seasonal collection page**. | EzPac (mithai, pooja, gift) |
| **Pizza / bakery / cake box** | Only a generic food delivery box exists. QSR and cloud kitchens search for these by name. | EzPac, Packhelp |
| **Shaped / die-cut pouch** | A shelf-standout format for snacks, pet treats and kids’ products. | Nexibles |
| **Zipper tear-strip box** | A tamper-evident e-commerce box. | EzPac |

**3. Options to add to existing SKUs.** These are variants rather than new products.

- **Pouch add-ons:** Euro/hang hole, round corners, tear notch, clear window, and K-seal or radius-seal bottom. Nexibles leads on these.
- **Finishes as a first-class choice on every printed SKU:** gloss, matte, soft-touch, spot UV and foil, with a visual swatch rather than a dropdown.
- **Stock-size / standard-size tier:** fixed pouch sizes at the lowest MOQ, sold on a batch calendar. This is Nexibles’ entire go-to-market, and the stand-up pouch already fits it.

**4. Adjacent category worth testing later:** branded merchandise (tote bags, tees, mugs, notebooks) for brand launch kits. Packhelp has built a second division around this. Start with totes and notebooks, which share print suppliers with existing lines.

### Recommended order

1. Fix A1–A3. These are risk items.
2. Publish the already-modelled formats in group 1 (FP-106–109, BX-404–408, TS-304, EC-511). This is mostly image work.
3. Show indicative pricing on quote SKUs (A5) and shorten the listing header (A4).
4. Add pouch add-ons and finishes as variants. Add pillow, drawer and display boxes.
5. Launch a Festive & Gifting collection ahead of Diwali. It needs mithai, pillow, drawer and window boxes, plus tissue and ribbon.
