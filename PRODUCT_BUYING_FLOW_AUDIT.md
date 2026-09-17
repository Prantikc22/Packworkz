# Packworkz Product Buying Flow Audit

**Audit date:** 17 September 2026  
**Catalog source:** `artifacts/packwerk/src/lib/catalog.ts`  
**Storefront scope:** 47 published product families

## Executive summary

| Public flow | Product families | Share | Customer path |
|---|---:|---:|---|
| Instant buy | 16 | 34.0% | Product detail → configurator → cart → checkout |
| Request quote | 31 | 66.0% | Product detail → procurement brief → specialist reviewed commercial |

The public routing field `publicBuyingPath` is the authoritative storefront decision. Instant-buy products still switch to a quote when the selected quantity reaches the product's `quote_threshold`; the largest self-serve quantity is one unit below that threshold. A cart containing any quote-required line is submitted as one managed quote.

## Instant buy flow (16)

### E-commerce Packaging (5)

| Code | Product | MOQ | Direct checkout limit |
|---|---|---:|---:|
| EC-501 | Mailer Box | 50 units | 9,999 units |
| EC-504 | Courier & Return Mailers | 1,000 units | 24,999 units |
| EC-505 | Paper & Padded Mailers | 100 units | 9,999 units |
| EC-509 | Frosted Zipper Garment Bag | 100 units | 9,999 units |
| EC-510 | Custom Printed Paper Carry Bags | 50 units | 4,999 units |

### Labels & Brand Extras (11)

| Code | Product | MOQ | Direct checkout limit |
|---|---|---:|---:|
| LC-816 | Round Paper Labels | 25 units | 24,999 units |
| LC-817 | Square Paper Labels | 25 units | 24,999 units |
| LC-818 | Rectangular Paper Labels | 25 units | 24,999 units |
| LC-819 | Oval Paper Labels | 25 units | 24,999 units |
| LC-820 | Custom Die-cut Stickers | 25 units | 9,999 units |
| LC-804 | Waterproof BOPP & Vinyl Labels | 25 units | 24,999 units |
| LC-805 | Clear & Transparent Labels | 25 units | 24,999 units |
| LC-808 | Hang Tags & Insert Cards | 50 units | 9,999 units |
| LC-810 | Printed Tissue and Wrapping Paper | 250 units | 9,999 units |
| LC-811 | Custom Packaging Tape | 72 units | 4,999 units |
| LC-815 | Foil & Special-effect Labels | 50 units | 9,999 units |

## Request quote flow (31)

### Flexible Packaging (6)

| Code | Product | MOQ |
|---|---|---:|
| FP-101 | Stand-up Pouch | 250 units |
| FP-103 | Flat-bottom & Gusseted Pouch | 500 units |
| FP-104 | Spout & Refill Pouch | 500 units |
| FP-105 | Sachet / Stick Pack | 5,000 units |
| FP-110 | Retort Pouch | 10,000 units |
| FP-112 | Flow-wrap & Pillow Pack | 250 kg |

### Bottles & Containers (7)

| Code | Product | MOQ |
|---|---|---:|
| BC-201 | Plastic Bottles & Jars | 500 units |
| BC-202 | Glass Bottles & Jars | 200 units |
| BC-204 | Cosmetic Jar | 200 units |
| BC-205 | Dropper Bottle | 200 units |
| BC-206 | Airless Pump Bottle | 200 units |
| BC-213 | Perfume and Attar Bottle | 100 units |
| BC-214 | Custom Printed Shampoo & Lotion Bottles | 250 units |

### Tubes & Small Packs (2)

| Code | Product | MOQ |
|---|---|---:|
| TS-301 | Cosmetic Tube | 1,000 units |
| TS-306 | Custom Printed Mono-material & PCR Cosmetic Tubes | 500 units |

### Boxes & Cartons (3)

| Code | Product | MOQ |
|---|---|---:|
| BX-401 | Custom Printed Folding Carton | 100 units |
| BX-402 | Custom Printed Two-piece Rigid Box | 50 units |
| BX-403 | Magnetic Closure Box | 50 units |

### E-commerce Packaging (2)

| Code | Product | MOQ |
|---|---|---:|
| EC-502 | Corrugated Box (Shipping) | 500 units |
| EC-503 | Food Delivery Box | 200 units |

### Protective Packaging (2)

| Code | Product | MOQ |
|---|---|---:|
| PR-601 | Protective Wrap & Void Fill | 1 rolls |
| PR-602 | Custom Inserts & Dividers | 100 units |

### Packaging Rolls (3)

| Code | Product | MOQ |
|---|---|---:|
| RL-701 | Printed Flexible Rollstock | 100 kg |
| RL-704 | Lidding and Sealing Film | 300 kg |
| RL-705 | Shrink Film and Sleeve Rollstock | 300 kg |

### Labels & Brand Extras (2)

| Code | Product | MOQ |
|---|---|---:|
| LC-806 | Shrink Sleeve & Wrap-around Labels | 10,000 units |
| LC-814 | Machine-applied Roll Labels | 5,000 units |

### Sustainable Foodservice (4)

| Code | Product | MOQ |
|---|---|---:|
| SP-905 | Bagasse Food Containers | 100 units |
| SP-907 | Paper Bowls & Food Containers | 300 units |
| SP-909 | Custom Printed Greaseproof Food Wrap | 5,000 units |
| SP-912 | Compostable Bio Paper Cups | 100 units |

## Verification notes

- The catalog page labels and filters use `publicBuyingPath`, so the displayed “Instant buy” and “Request quote” states match this report.
- `getConfigureHref` sends quote products to `/procurement-plan` and instant-buy products to `/configure`.
- `requiresQuote` moves instant-buy quantities at or above `quote_threshold` to the quote flow.
- Cart and checkout re-evaluate all lines; one quote-required line converts the complete cart to quote checkout.
- Customers see exactly two buying paths: Instant buy or Request quote. Stand-up Pouch (FP-101) uses Request quote.
