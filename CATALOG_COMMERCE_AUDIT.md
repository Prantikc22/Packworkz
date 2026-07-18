# Packworkz Catalog and Commerce Audit

Date: 18 July 2026

## Final decision

Launch with **35 curated product families** across nine categories. Customers see only two buying paths:

1. **Instant buy** for repeatable standard specifications, visible quantity breaks, artwork upload, proof approval, payment, GST invoice and reorder.
2. **Request quote** for rollstock, tooling, regulated formats, cold-chain, process validation and unusual enterprise requirements.

An instant product automatically changes to Request quote at its enterprise quantity threshold. This avoids a third customer-facing “estimate” mode while preserving internal pricing logic for configurable products.

The exact launch assortment, MOQ, tier prices, supplier route, specification fields and quote threshold are generated from the code in:

- `artifacts/packwerk/docs/COMMERCE_CATALOG.md`
- `artifacts/packwerk/docs/commerce-catalog.json`
- `artifacts/packwerk/docs/commerce-catalog.csv`
- `artifacts/packwerk/docs/shopify-products.csv`

## Assortment shape

| Category | Public families |
| --- | ---: |
| Flexible packaging | 6 |
| Bottles and containers | 6 |
| Tubes and small packs | 1 |
| Boxes and cartons | 2 |
| E-commerce packaging | 7 |
| Protective packaging | 2 |
| Packaging rolls | 3 |
| Labels and accessories | 5 |
| Sustainable food-service | 3 |
| **Total** | **35** |

The storefront keeps the broad sourcing library behind the scenes but excludes 66 concepts from public navigation. The main cuts are duplicate structural names, industrial edge cases, standalone fitments and accessories that belong inside a configuration rather than on thin product pages.

The seven public quote families are retort pouches, flow-wrap/pillow packs, custom inserts, printed flexible rollstock, lidding film, shrink film/rollstock and machine-applied shrink/wrap-around labels. Everything else is either a repeatable instant-buy family or enters through the general production brief instead of pretending to be a configured storefront product.

Consolidated examples:

- Auto-bottom, sleeve-and-tray and window structures are options under **Folding Cartons**.
- Magnetic and collapsible constructions are options under **Rigid & Magnetic Boxes**.
- PET jars are options under **Plastic Bottles & Jars**; glass jars sit under **Glass Bottles & Jars**.
- Standard, compostable and dual-seal return mailers are options under **Courier & Return Mailers**.
- Bubble wrap, air pillows, honeycomb paper and crinkle filler are options under **Protective Wrap & Void Fill**.
- Sheet, roll, die-cut and tamper-evident formats are options under **Custom Labels & Stickers**.
- BOPP and paper tape are options under **Custom Packaging Tape**.

## Stand-up pouch launch ladder

The low-MOQ route is intentionally more expensive because the production method changes:

| Quantity | Standard route | Ex-GST unit price |
| ---: | --- | ---: |
| 250 | Stock zipper pouch with premium printed labels | Rs 32.00 |
| 500 | Direct digital print entry | Rs 21.24 |
| 1,000 | Direct print | Rs 15.80 |
| 2,500 | Direct print | Rs 11.40 |
| 5,000 | Direct print | Rs 8.90 |

The 500-unit anchor matches Kraftix's currently published custom-printed pouch price. Packhelp's label-led pouch route starts at 250, while Kraftix's plain stock pouch starts at 100. Sources: [Kraftix printed stand-up pouch](https://www.kraftixdigital.in/standup-pouch), [Kraftix plain stand-up pouch](https://www.kraftixdigital.in/standuppouch-notprinted/), [Packhelp custom-label stand-up pouch](https://packhelp.com/p/stand-up-pouches/custom/?showMinimalPrices=0).

## Margin controls

Published prices are provisional launch hypotheses, not supplier cost truth. Before payment is enabled, every tier needs a matched specification and rate cards from at least two approved suppliers.

Use gross margin, not markup:

`sell price = landed cost / (1 - target gross margin)`

Landed cost must include product, setup amortisation, print plates/cylinders/dies, QA, packing, inward and outward freight, payment cost, expected rejection and replacement allowance.

- Stock/plain products: target 32-38% gross margin
- Digital customisation and short runs: 42-50%
- Labels, cards and accessories: 45-55%
- Standard printed boxes and pouches: 38-45%
- Technical enterprise work: 28-35% plus a minimum gross-profit rupee floor
- Never publish a tier below 25% post-freight contribution margin

## Shopify architecture

Use Shopify as the **commerce and checkout engine**, not as the whole Packworkz product.

- Keep this React site, configurator, 3D studio, artwork versions, quote workflow, supplier operations and SmartStock in Packworkz.
- Sync instant-buy variants, inventory, quantity prices and order status to Shopify.
- Send Request quote submissions to the Packworkz backend; after commercial approval, create a Shopify Draft Order and send the secure checkout link.
- Start without Shopify Plus. Add Plus only when company-specific catalogs, payment terms and multi-location B2B controls justify it.

## GST checkout

Use a **Buying as a business** toggle. When enabled, collect legal name, GSTIN, billing address, state/place of supply and optional PO reference. GSTIN is not required for browsing or for an unregistered startup buyer.

## Landing-page result

The homepage now follows: hero, trust, process, catalog, industries, interactive SmartStock, customer proof, Packworkz advantage, sustainability and final CTA. The older repetitive comparison and calculator blocks remain hidden. The remaining page is still substantial, but each visible section now has a distinct job rather than repeating the same sourcing claim.
