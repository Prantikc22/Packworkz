# Packworkz Commerce Catalog

Generated from the storefront source of truth. 49 product families: 41 instant-buy and 8 request-quote.

## Commerce rules

- Customers see only two paths: Instant buy and Request quote. Internal estimate logic is never presented as a third buying mode.
- Public prices are per-unit launch prices for the named standard specification and exclude GST and freight.
- Instant products can proceed to payment after pincode, artwork and tax identity checks.
- An instant product automatically moves to Request quote at its enterprise quantity threshold so capacity, freight and bulk pricing can be reviewed.
- Quote products are limited to rollstock, tooling-heavy, regulated, cold-chain and process-validated formats.
- Quantity tiers must be recalibrated from matched supplier rate cards before launch, then protected by a landed-cost and contribution-margin floor.
- GSTIN belongs behind a 'Buying as a business' toggle. It is optional for browsing and required only when the buyer requests a B2B tax invoice.
- Packworkz owns catalog, pricing, artwork, order records and SmartStock. Razorpay is used only for server-created payments up to Rs 50,000.
- Larger totals and technical products create a managed payment and production-confirmation task instead of a Razorpay order.

## Flexible (6)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| FP-101 | Stand-up Pouch | instant | 250 units | 250+ @ Rs 22.45/unit; 500+ @ Rs 17.5/unit; 1,000+ @ Rs 13.5/unit; 2,500+ @ Rs 9.97/unit; 5,000+ @ Rs 7.99/unit | Packworkz supplier network |
| FP-103 | Flat-bottom & Gusseted Pouch | instant | 500 units | 500+ @ Rs 22/unit; 1,000+ @ Rs 17.45/unit; 2,500+ @ Rs 13.3/unit; 5,000+ @ Rs 10.31/unit | Packworkz supplier network |
| FP-104 | Spout & Refill Pouch | instant | 500 units | 500+ @ Rs 19.13/unit; 1,000+ @ Rs 14.97/unit; 2,500+ @ Rs 11.64/unit; 5,000+ @ Rs 8.65/unit; 10,000+ @ Rs 6.99/unit | Packworkz supplier network |
| FP-105 | Sachet / Stick Pack | instant | 5,000 units | 5,000+ @ Rs 2.4/unit; 10,000+ @ Rs 1.85/unit; 25,000+ @ Rs 1.35/unit; 50,000+ @ Rs 1.05/unit | Packworkz supplier network |
| FP-110 | Retort Pouch | quote | 10,000 units | estimate Rs 4.2-14.5/unit + setup Rs 35000-120000 | Retort-certified laminate converter |
| FP-112 | Flow-wrap & Pillow Pack | quote | 250 kg | estimate Rs 165-330/unit + setup Rs 12000-40000 | Rotogravure flexible-pack converter |

## Bottles (6)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| BC-201 | Plastic Bottles & Jars | instant | 500 units | 500+ @ Rs 24/unit; 1,000+ @ Rs 18.5/unit; 2,500+ @ Rs 14/unit; 5,000+ @ Rs 11/unit | Packworkz supplier network |
| BC-202 | Glass Bottles & Jars | instant | 200 units | 200+ @ Rs 66.47/unit; 500+ @ Rs 53.17/unit; 1,000+ @ Rs 41.54/unit; 2,500+ @ Rs 34.9/unit | Packworkz supplier network |
| BC-204 | Cosmetic Jar | instant | 200 units | 200+ @ Rs 53.17/unit; 500+ @ Rs 41.54/unit; 1,000+ @ Rs 33.24/unit; 2,500+ @ Rs 26.59/unit | Packworkz supplier network |
| BC-205 | Dropper Bottle | instant | 200 units | 200+ @ Rs 44.88/unit; 500+ @ Rs 35/unit; 1,000+ @ Rs 28.25/unit; 2,500+ @ Rs 23.27/unit | Packworkz supplier network |
| BC-206 | Airless Pump Bottle | instant | 200 units | 200+ @ Rs 96.37/unit; 500+ @ Rs 79.76/unit; 1,000+ @ Rs 69.79/unit; 2,500+ @ Rs 58.17/unit | Packworkz supplier network |
| BC-213 | Perfume and Attar Bottle | instant | 100 units | 100+ @ Rs 74.77/unit; 250+ @ Rs 59.84/unit; 500+ @ Rs 49.87/unit; 1,000+ @ Rs 41.54/unit | Fragrance bottle and pump importer |

## Tubes (1)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| TS-301 | Cosmetic Tube | instant | 1,000 units | 1,000+ @ Rs 19.94/unit; 2,500+ @ Rs 14.97/unit; 5,000+ @ Rs 11.64/unit; 10,000+ @ Rs 9.2/unit | Packworkz supplier network |

## Boxes (8)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| BX-401 | Straight Tuck End Carton | instant | 100 units | 25+ @ Rs 52/unit; 50+ @ Rs 45/unit; 100+ @ Rs 38/unit; 250+ @ Rs 25/unit; 500+ @ Rs 18/unit; 1,000+ @ Rs 14/unit | Packworkz supplier network |
| BX-402 | Two-piece Rigid Box | instant | 50 units | 50+ @ Rs 340/unit; 100+ @ Rs 275/unit; 250+ @ Rs 225/unit; 500+ @ Rs 178/unit; 1,000+ @ Rs 145/unit | Packworkz supplier network |
| BX-403 | Magnetic Closure Box | instant | 50 units | 50+ @ Rs 395/unit; 100+ @ Rs 325/unit; 250+ @ Rs 255/unit; 500+ @ Rs 205/unit; 1,000+ @ Rs 169/unit | Packworkz supplier network |
| BX-412 | Reverse Tuck End Carton | instant | 25 units | 25+ @ Rs 52/unit; 50+ @ Rs 45/unit; 100+ @ Rs 38/unit; 250+ @ Rs 25/unit; 500+ @ Rs 18.5/unit; 1,000+ @ Rs 14.2/unit | Digital folding-carton converter |
| BX-404 | Auto-bottom Carton | instant | 25 units | 25+ @ Rs 48.19/unit; 50+ @ Rs 40/unit; 100+ @ Rs 34/unit; 250+ @ Rs 23/unit; 500+ @ Rs 16.8/unit; 1,000+ @ Rs 12.9/unit | Digital folding-carton converter |
| BX-405 | Sleeve and Tray Box | instant | 25 units | 25+ @ Rs 95/unit; 50+ @ Rs 72/unit; 100+ @ Rs 51/unit; 250+ @ Rs 35/unit; 500+ @ Rs 27/unit | Short-run carton converter |
| BX-406 | Window Carton | instant | 25 units | 25+ @ Rs 59/unit; 50+ @ Rs 50/unit; 100+ @ Rs 42/unit; 250+ @ Rs 29/unit; 500+ @ Rs 21/unit; 1,000+ @ Rs 16/unit | Carton converter with window patching |
| BX-408 | Collapsible Rigid Box | instant | 50 units | 50+ @ Rs 345/unit; 100+ @ Rs 285/unit; 250+ @ Rs 220/unit; 500+ @ Rs 178/unit; 1,000+ @ Rs 149/unit | Premium rigid-box manufacturer |

## Ecommerce (7)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| EC-501 | Mailer Box | instant | 50 units | 50+ @ Rs 34/unit; 100+ @ Rs 29/unit; 250+ @ Rs 24/unit; 500+ @ Rs 20/unit; 1,000+ @ Rs 17/unit; 2,500+ @ Rs 14/unit | Packworkz supplier network |
| EC-502 | Corrugated Box (Shipping) | instant | 500 units | 500+ @ Rs 29.93/unit; 1,000+ @ Rs 24.94/unit; 2,500+ @ Rs 19.94/unit; 5,000+ @ Rs 14.97/unit | Packworkz supplier network |
| EC-503 | Food Delivery Box | instant | 200 units | 200+ @ Rs 29.93/unit; 500+ @ Rs 23.27/unit; 1,000+ @ Rs 18.28/unit; 2,500+ @ Rs 14.13/unit | Packworkz supplier network |
| EC-504 | Courier & Return Mailers | instant | 1,000 units | 1,000+ @ Rs 7.5/unit; 2,500+ @ Rs 5.99/unit; 5,000+ @ Rs 4.67/unit; 10,000+ @ Rs 3.84/unit | Packworkz supplier network |
| EC-505 | Paper & Padded Mailers | instant | 100 units | 100+ @ Rs 20/unit; 250+ @ Rs 15/unit; 500+ @ Rs 11.8/unit; 1,000+ @ Rs 9.65/unit | Paper mailer bag converter |
| EC-509 | Frosted Zipper Garment Bag | instant | 100 units | 100+ @ Rs 18.28/unit; 250+ @ Rs 13.8/unit; 500+ @ Rs 10.65/unit; 1,000+ @ Rs 8.5/unit | Garment polybag converter |
| EC-510 | Printed Paper Carrier Bag | instant | 50 units | 50+ @ Rs 20/unit; 100+ @ Rs 15/unit; 250+ @ Rs 10.65/unit; 500+ @ Rs 8.31/unit | Paper bag manufacturer |

## Protective (2)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| PR-601 | Protective Wrap & Void Fill | instant | 1 rolls | 1+ @ Rs 1495.4/unit; 5+ @ Rs 1329.24/unit; 10+ @ Rs 1212.94/unit; 25+ @ Rs 1080/unit | Packworkz supplier network |
| PR-602 | Custom Inserts & Dividers | quote | 100 units | estimate Rs 15-180/unit + setup Rs 5000-50000 | Packworkz supplier network |

## Rolls (3)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| RL-701 | Printed Flexible Rollstock | quote | 100 kg | estimate Rs 180-450/unit + setup Rs 5000-50000 | Packworkz supplier network |
| RL-704 | Lidding and Sealing Film | quote | 300 kg | estimate Rs 240-540/unit + setup Rs 18000-90000 | Specialty lidding-film converter |
| RL-705 | Shrink Film and Sleeve Rollstock | quote | 300 kg | estimate Rs 155-390/unit + setup Rs 15000-75000 | Shrink-film manufacturer |

## Labels (13)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| LC-816 | Round Paper Labels | instant | 25 units | 25+ @ Rs 8.5/unit; 50+ @ Rs 6.8/unit; 100+ @ Rs 5.8/unit; 250+ @ Rs 3.6/unit; 500+ @ Rs 2.6/unit; 1,000+ @ Rs 1.95/unit; 2,500+ @ Rs 1.4/unit; 5,000+ @ Rs 1.05/unit | Digital sheet-label converter |
| LC-817 | Square Paper Labels | instant | 25 units | 25+ @ Rs 8.5/unit; 50+ @ Rs 6.8/unit; 100+ @ Rs 5.8/unit; 250+ @ Rs 3.6/unit; 500+ @ Rs 2.6/unit; 1,000+ @ Rs 1.95/unit; 2,500+ @ Rs 1.4/unit; 5,000+ @ Rs 1.05/unit | Digital sheet-label converter |
| LC-818 | Rectangular Paper Labels | instant | 25 units | 25+ @ Rs 8.5/unit; 50+ @ Rs 7.2/unit; 100+ @ Rs 6.4/unit; 250+ @ Rs 4/unit; 500+ @ Rs 2.9/unit; 1,000+ @ Rs 2.2/unit; 2,500+ @ Rs 1.58/unit; 5,000+ @ Rs 1.18/unit | Digital sheet-label converter |
| LC-819 | Oval Paper Labels | instant | 25 units | 25+ @ Rs 8.5/unit; 50+ @ Rs 7.2/unit; 100+ @ Rs 6.4/unit; 250+ @ Rs 4/unit; 500+ @ Rs 2.9/unit; 1,000+ @ Rs 2.2/unit; 2,500+ @ Rs 1.58/unit; 5,000+ @ Rs 1.18/unit | Digital sheet-label converter |
| LC-820 | Custom Die-cut Stickers | instant | 25 units | 25+ @ Rs 13.5/unit; 50+ @ Rs 10.5/unit; 100+ @ Rs 8.5/unit; 250+ @ Rs 5.4/unit; 500+ @ Rs 3.8/unit; 1,000+ @ Rs 2.8/unit; 2,500+ @ Rs 2/unit | Digital contour-cut sticker printer |
| LC-804 | Waterproof BOPP & Vinyl Labels | instant | 25 units | 25+ @ Rs 12/unit; 50+ @ Rs 9.5/unit; 100+ @ Rs 8.2/unit; 250+ @ Rs 5.1/unit; 500+ @ Rs 3.65/unit; 1,000+ @ Rs 2.65/unit; 2,500+ @ Rs 1.85/unit; 5,000+ @ Rs 1.35/unit | Digital film-label converter |
| LC-805 | Clear & Transparent Labels | instant | 25 units | 25+ @ Rs 12.5/unit; 50+ @ Rs 10.5/unit; 100+ @ Rs 9.2/unit; 250+ @ Rs 5.8/unit; 500+ @ Rs 4.1/unit; 1,000+ @ Rs 3/unit; 2,500+ @ Rs 2.1/unit; 5,000+ @ Rs 1.5/unit | Digital clear-label converter |
| LC-806 | Shrink Sleeve & Wrap-around Labels | quote | 10,000 units | estimate Rs 1.8-8.5/unit + setup Rs 25000-95000 | Gravure shrink-sleeve converter |
| LC-808 | Hang Tags & Insert Cards | instant | 50 units | 50+ @ Rs 9.5/unit; 100+ @ Rs 6.33/unit; 250+ @ Rs 4/unit; 500+ @ Rs 2.84/unit | Digital commercial printer |
| LC-810 | Printed Tissue and Wrapping Paper | instant | 250 units | 250+ @ Rs 11.64/unit; 500+ @ Rs 9.14/unit; 1,000+ @ Rs 7/unit; 2,500+ @ Rs 5.67/unit | Tissue-paper printer |
| LC-811 | Custom Packaging Tape | instant | 72 units | 72+ @ Rs 124.62/unit; 144+ @ Rs 103.04/unit; 360+ @ Rs 83.08/unit; 720+ @ Rs 69.79/unit | Printed adhesive-tape converter |
| LC-814 | Machine-applied Roll Labels | quote | 5,000 units | estimate Rs 0.75-4.8/unit + setup Rs 6500-38000 | Flexographic roll-label converter |
| LC-815 | Foil & Special-effect Labels | instant | 50 units | 50+ @ Rs 18/unit; 100+ @ Rs 13.5/unit; 250+ @ Rs 8.9/unit; 500+ @ Rs 6.5/unit; 1,000+ @ Rs 4.8/unit; 2,500+ @ Rs 3.4/unit | Digital embellishment label printer |

## Sustainable (3)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| SP-905 | Bagasse Food Containers | instant | 100 units | 100+ @ Rs 18.5/unit; 250+ @ Rs 17.5/unit; 500+ @ Rs 16.75/unit; 1,000+ @ Rs 13.65/unit; 2,500+ @ Rs 11.35/unit; 5,000+ @ Rs 9.7/unit | Bagasse tableware manufacturer |
| SP-907 | Paper Bowls & Food Containers | instant | 100 units | 100+ @ Rs 14.2/unit; 250+ @ Rs 12.5/unit; 500+ @ Rs 10.8/unit; 1,000+ @ Rs 9.5/unit; 2,500+ @ Rs 8/unit; 5,000+ @ Rs 6.65/unit; 10,000+ @ Rs 5.25/unit | Food-contact paper-container manufacturer |
| SP-909 | Greaseproof and Food Wrap Paper | instant | 250 units | 250+ @ Rs 5.7/unit; 500+ @ Rs 5.35/unit; 1,000+ @ Rs 5/unit; 2,500+ @ Rs 4/unit; 5,000+ @ Rs 3.2/unit; 10,000+ @ Rs 2.6/unit | Food-contact paper printer |
