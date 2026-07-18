# Packworkz Commerce Catalog

Generated from the storefront source of truth. 35 product families: 28 instant-buy and 7 request-quote.

## Commerce rules

- Customers see only two paths: Instant buy and Request quote. Internal estimate logic is never presented as a third buying mode.
- Public prices are per-unit launch prices for the named standard specification and exclude GST and freight.
- Instant products can proceed to payment after pincode, artwork and tax identity checks.
- An instant product automatically moves to Request quote at its enterprise quantity threshold so capacity, freight and bulk pricing can be reviewed.
- Quote products are limited to rollstock, tooling-heavy, regulated, cold-chain and process-validated formats.
- Quantity tiers must be recalibrated from three live supplier bids before launch, then protected by a landed-cost and contribution-margin floor.
- GSTIN belongs behind a 'Buying as a business' toggle. It is optional for browsing and required only when the buyer requests a B2B tax invoice.
- Shopify can host the instant lane, but tier pricing needs Shopify Functions/B2B or a volume-pricing app. Quote products should create a Packworkz lead and later convert to a Shopify draft order with a secure checkout link.
- Keep catalog, pricing rules, artwork versions, technical requests and SmartStock in the Packworkz backend even if Shopify supplies checkout initially.

## Flexible (6)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| FP-101 | Stand-up Pouch | instant | 250 units | 250+ @ Rs 32/unit; 500+ @ Rs 21.24/unit; 1,000+ @ Rs 15.8/unit; 2,500+ @ Rs 11.4/unit; 5,000+ @ Rs 8.9/unit | Packworkz supplier network |
| FP-103 | Flat-bottom & Gusseted Pouch | instant | 500 units | 500+ @ Rs 28/unit; 1,000+ @ Rs 21.84/unit; 2,500+ @ Rs 16.24/unit; 5,000+ @ Rs 12.6/unit | Packworkz supplier network |
| FP-104 | Spout & Refill Pouch | instant | 500 units | 500+ @ Rs 32/unit; 1,000+ @ Rs 24.96/unit; 2,500+ @ Rs 18.56/unit; 5,000+ @ Rs 14.4/unit | Packworkz supplier network |
| FP-105 | Sachet / Stick Pack | instant | 5,000 units | 5,000+ @ Rs 4/unit; 10,000+ @ Rs 3.12/unit; 25,000+ @ Rs 2.32/unit; 50,000+ @ Rs 1.8/unit | Packworkz supplier network |
| FP-110 | Retort Pouch | quote | 10,000 units | estimate Rs 4.2-14.5/unit + setup Rs 35000-120000 | Retort-certified laminate converter |
| FP-112 | Flow-wrap & Pillow Pack | quote | 250 kg | estimate Rs 165-330/unit + setup Rs 12000-40000 | Rotogravure flexible-pack converter |

## Bottles (6)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| BC-201 | Plastic Bottles & Jars | instant | 500 units | 500+ @ Rs 45/unit; 1,000+ @ Rs 35.1/unit; 2,500+ @ Rs 26.1/unit; 5,000+ @ Rs 20.25/unit | Packworkz supplier network |
| BC-202 | Glass Bottles & Jars | instant | 200 units | 200+ @ Rs 120/unit; 400+ @ Rs 93.6/unit; 1,000+ @ Rs 69.6/unit; 2,000+ @ Rs 54/unit | Packworkz supplier network |
| BC-204 | Cosmetic Jar | instant | 200 units | 200+ @ Rs 75/unit; 400+ @ Rs 58.5/unit; 1,000+ @ Rs 43.5/unit; 2,000+ @ Rs 33.75/unit | Packworkz supplier network |
| BC-205 | Dropper Bottle | instant | 200 units | 200+ @ Rs 60/unit; 400+ @ Rs 46.8/unit; 1,000+ @ Rs 34.8/unit; 2,000+ @ Rs 27/unit | Packworkz supplier network |
| BC-206 | Airless Pump Bottle | instant | 200 units | 200+ @ Rs 130/unit; 400+ @ Rs 101.4/unit; 1,000+ @ Rs 75.4/unit; 2,000+ @ Rs 58.5/unit | Packworkz supplier network |
| BC-213 | Perfume and Attar Bottle | instant | 100 units | 100+ @ Rs 88/unit; 250+ @ Rs 69/unit; 500+ @ Rs 55/unit; 1,000+ @ Rs 46/unit | Fragrance bottle and pump importer |

## Tubes (1)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| TS-301 | Cosmetic Tube | instant | 1,000 units | 1,000+ @ Rs 22/unit; 2,000+ @ Rs 17.16/unit; 5,000+ @ Rs 12.76/unit; 10,000+ @ Rs 9.9/unit | Packworkz supplier network |

## Boxes (2)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| BX-401 | Folding Cartons | instant | 500 units | 500+ @ Rs 18/unit; 1,000+ @ Rs 14.04/unit; 2,500+ @ Rs 10.44/unit; 5,000+ @ Rs 8.1/unit | Packworkz supplier network |
| BX-402 | Rigid & Magnetic Boxes | instant | 100 units | 100+ @ Rs 350/unit; 200+ @ Rs 273/unit; 500+ @ Rs 203/unit; 1,000+ @ Rs 157.5/unit | Packworkz supplier network |

## Ecommerce (7)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| EC-501 | Mailer Box | instant | 200 units | 200+ @ Rs 75/unit; 400+ @ Rs 58.5/unit; 1,000+ @ Rs 43.5/unit; 2,000+ @ Rs 33.75/unit | Packworkz supplier network |
| EC-502 | Corrugated Box (Shipping) | instant | 500 units | 500+ @ Rs 35/unit; 1,000+ @ Rs 27.3/unit; 2,500+ @ Rs 20.3/unit; 5,000+ @ Rs 15.75/unit | Packworkz supplier network |
| EC-503 | Food Delivery Box | instant | 200 units | 200+ @ Rs 40/unit; 400+ @ Rs 31.2/unit; 1,000+ @ Rs 23.2/unit; 2,000+ @ Rs 18/unit | Packworkz supplier network |
| EC-504 | Courier & Return Mailers | instant | 1,000 units | 1,000+ @ Rs 10/unit; 2,000+ @ Rs 7.8/unit; 5,000+ @ Rs 5.8/unit; 10,000+ @ Rs 4.5/unit | Packworkz supplier network |
| EC-505 | Paper & Padded Mailers | instant | 100 units | 100+ @ Rs 24/unit; 250+ @ Rs 17.5/unit; 500+ @ Rs 13.6/unit; 1,000+ @ Rs 10.8/unit | Paper mailer bag converter |
| EC-509 | Frosted Zipper Garment Bag | instant | 100 units | 100+ @ Rs 22/unit; 250+ @ Rs 16/unit; 500+ @ Rs 12.5/unit; 1,000+ @ Rs 10/unit | Garment polybag converter |
| EC-510 | Printed Paper Carrier Bag | instant | 50 units | 50+ @ Rs 24/unit; 100+ @ Rs 17/unit; 250+ @ Rs 12/unit; 500+ @ Rs 9.5/unit | Paper bag manufacturer |

## Protective (2)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| PR-601 | Protective Wrap & Void Fill | instant | 1 rolls | 1+ @ Rs 5000/unit; 2+ @ Rs 3900/unit; 5+ @ Rs 2900/unit; 10+ @ Rs 2250/unit | Packworkz supplier network |
| PR-602 | Custom Inserts & Dividers | quote | 100 units | estimate Rs 15-180/unit + setup Rs 5000-50000 | Packworkz supplier network |

## Rolls (3)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| RL-701 | Printed Flexible Rollstock | quote | 100 kg | estimate Rs 180-450/unit + setup Rs 5000-50000 | Packworkz supplier network |
| RL-704 | Lidding and Sealing Film | quote | 300 kg | estimate Rs 240-540/unit + setup Rs 18000-90000 | Specialty lidding-film converter |
| RL-705 | Shrink Film and Sleeve Rollstock | quote | 300 kg | estimate Rs 155-390/unit + setup Rs 15000-75000 | Shrink-film manufacturer |

## Labels (5)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| LC-801 | Custom Labels & Stickers | instant | 1,000 units | 1,000+ @ Rs 8/unit; 2,000+ @ Rs 6.24/unit; 5,000+ @ Rs 4.64/unit; 10,000+ @ Rs 3.6/unit | Packworkz supplier network |
| LC-806 | Shrink Sleeve & Wrap-around Labels | quote | 10,000 units | estimate Rs 1.8-8.5/unit + setup Rs 25000-95000 | Gravure shrink-sleeve converter |
| LC-808 | Hang Tags & Insert Cards | instant | 50 units | 50+ @ Rs 12/unit; 100+ @ Rs 7.5/unit; 250+ @ Rs 4.4/unit; 500+ @ Rs 3.2/unit | Digital commercial printer |
| LC-810 | Printed Tissue and Wrapping Paper | instant | 250 units | 250+ @ Rs 14/unit; 500+ @ Rs 10.5/unit; 1,000+ @ Rs 8.1/unit; 2,500+ @ Rs 6.4/unit | Tissue-paper printer |
| LC-811 | Custom Packaging Tape | instant | 72 units | 72+ @ Rs 92/unit; 144+ @ Rs 78/unit; 360+ @ Rs 64/unit; 720+ @ Rs 56/unit | Printed adhesive-tape converter |

## Sustainable (3)

| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |
|---|---|---:|---:|---|---|
| SP-905 | Bagasse Food Containers | instant | 500 units | 500+ @ Rs 9.8/unit; 1,000+ @ Rs 8.6/unit; 2,500+ @ Rs 7.7/unit; 5,000+ @ Rs 7/unit | Bagasse tableware manufacturer |
| SP-907 | Paper Cups, Bowls & Food Tubs | instant | 1,000 units | 1,000+ @ Rs 5.8/unit; 2,500+ @ Rs 4.7/unit; 5,000+ @ Rs 4.1/unit; 10,000+ @ Rs 3.6/unit | Food-contact paper cup manufacturer |
| SP-909 | Greaseproof and Food Wrap Paper | instant | 1,000 units | 1,000+ @ Rs 2.9/unit; 2,500+ @ Rs 2.1/unit; 5,000+ @ Rs 1.65/unit; 10,000+ @ Rs 1.3/unit | Food-contact paper printer |
