# Packworkz Product Buying Flow Audit

**Audit date:** 17 September 2026  
**Catalog source:** `artifacts/packwerk/src/lib/catalog.ts`  
**Storefront scope:** 47 published product families

## Executive summary

| Public flow | Product families | Share | Customer path |
|---|---:|---:|---|
| Direct buying | 17 | 36.2% | Product detail → configurator → cart → checkout |
| Managed quote | 30 | 63.8% | Product detail → procurement brief → specialist reviewed commercial |

The public routing field `publicBuyingPath` is the authoritative storefront decision. Direct-buy products still switch to a managed quote when the selected quantity reaches the product's `quote_threshold`; the largest self-serve quantity is one unit below that threshold. A cart containing any quote-required line is submitted as one managed quote.

## Direct buying flow (17)

### Flexible Packaging (1)

| Code | Product | MOQ | Direct checkout limit | Source mode |
|---|---|---:|---:|---|
| FP-101 | Stand-up Pouch | 250 units | 19,999 units | instant |

### E-commerce Packaging (5)

| Code | Product | MOQ | Direct checkout limit | Source mode |
|---|---|---:|---:|---|
| EC-501 | Mailer Box | 50 units | 9,999 units | instant |
| EC-504 | Courier & Return Mailers | 1,000 units | 24,999 units | instant |
| EC-505 | Paper & Padded Mailers | 100 units | 9,999 units | instant |
| EC-509 | Frosted Zipper Garment Bag | 100 units | 9,999 units | instant |
| EC-510 | Custom Printed Paper Carry Bags | 50 units | 4,999 units | instant |

### Labels & Brand Extras (11)

| Code | Product | MOQ | Direct checkout limit | Source mode |
|---|---|---:|---:|---|
| LC-816 | Round Paper Labels | 25 units | 24,999 units | instant |
| LC-817 | Square Paper Labels | 25 units | 24,999 units | instant |
| LC-818 | Rectangular Paper Labels | 25 units | 24,999 units | instant |
| LC-819 | Oval Paper Labels | 25 units | 24,999 units | instant |
| LC-820 | Custom Die-cut Stickers | 25 units | 9,999 units | instant |
| LC-804 | Waterproof BOPP & Vinyl Labels | 25 units | 24,999 units | instant |
| LC-805 | Clear & Transparent Labels | 25 units | 24,999 units | instant |
| LC-808 | Hang Tags & Insert Cards | 50 units | 9,999 units | instant |
| LC-810 | Printed Tissue and Wrapping Paper | 250 units | 9,999 units | hybrid |
| LC-811 | Custom Packaging Tape | 72 units | 4,999 units | instant |
| LC-815 | Foil & Special-effect Labels | 50 units | 9,999 units | instant |

## Managed quote flow (30)

### Flexible Packaging (5)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| FP-103 | Flat-bottom & Gusseted Pouch | 500 units | hybrid |
| FP-104 | Spout & Refill Pouch | 500 units | hybrid |
| FP-105 | Sachet / Stick Pack | 5,000 units | instant |
| FP-110 | Retort Pouch | 10,000 units | brief |
| FP-112 | Flow-wrap & Pillow Pack | 250 kg | brief |

### Bottles & Containers (7)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| BC-201 | Plastic Bottles & Jars | 500 units | instant |
| BC-202 | Glass Bottles & Jars | 200 units | hybrid |
| BC-204 | Cosmetic Jar | 200 units | hybrid |
| BC-205 | Dropper Bottle | 200 units | hybrid |
| BC-206 | Airless Pump Bottle | 200 units | hybrid |
| BC-213 | Perfume and Attar Bottle | 100 units | hybrid |
| BC-214 | Custom Printed Shampoo & Lotion Bottles | 250 units | instant |

### Tubes & Small Packs (2)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| TS-301 | Cosmetic Tube | 1,000 units | hybrid |
| TS-306 | Custom Printed Mono-material & PCR Cosmetic Tubes | 500 units | instant |

### Boxes & Cartons (3)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| BX-401 | Custom Printed Folding Carton | 100 units | hybrid |
| BX-402 | Custom Printed Two-piece Rigid Box | 50 units | instant |
| BX-403 | Magnetic Closure Box | 50 units | instant |

### E-commerce Packaging (2)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| EC-502 | Corrugated Box (Shipping) | 500 units | hybrid |
| EC-503 | Food Delivery Box | 200 units | hybrid |

### Protective Packaging (2)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| PR-601 | Protective Wrap & Void Fill | 1 rolls | instant |
| PR-602 | Custom Inserts & Dividers | 100 units | brief |

### Packaging Rolls (3)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| RL-701 | Printed Flexible Rollstock | 100 kg | brief |
| RL-704 | Lidding and Sealing Film | 300 kg | brief |
| RL-705 | Shrink Film and Sleeve Rollstock | 300 kg | brief |

### Labels & Brand Extras (2)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| LC-806 | Shrink Sleeve & Wrap-around Labels | 10,000 units | brief |
| LC-814 | Machine-applied Roll Labels | 5,000 units | brief |

### Sustainable Foodservice (4)

| Code | Product | MOQ | Source mode |
|---|---|---:|---|
| SP-905 | Bagasse Food Containers | 100 units | instant |
| SP-907 | Paper Bowls & Food Containers | 300 units | hybrid |
| SP-909 | Custom Printed Greaseproof Food Wrap | 5,000 units | instant |
| SP-912 | Compostable Bio Paper Cups | 100 units | hybrid |

## Verification notes

- The catalog page labels and filters use `publicBuyingPath`, so the displayed “Instant buy” and “Managed quote” states match this report.
- `getConfigureHref` sends managed quote products to `/procurement-plan` and direct-buy products to `/configure`.
- `requiresQuote` moves direct-buy quantities at or above `quote_threshold` to the managed quote flow.
- Cart and checkout re-evaluate all lines; one quote-required line converts the complete cart to quote checkout.
- The internal `purchaseMode` describes source catalog complexity and is not the final public routing field. Differences between `purchaseMode` and `publicBuyingPath` are intentional under the current narrow online-checkout allowlist.
