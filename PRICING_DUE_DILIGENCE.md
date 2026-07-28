# Packworkz Instant-Buy Pricing Due Diligence

Updated: 27 July 2026

## Guardrail

Instant checkout never uses a product selling price below the configured loaded
cost divided by `0.65`. The load is:

- 3% expected rejection and wastage
- 3% inward freight
- 2% production packing and handling

This creates a 35% product gross-margin floor before payment fees and company
overhead. Delivery, artwork, setup and GST are calculated separately.

Configuration changes price. Size multipliers apply first; closures, material,
finish and print-route modifiers then affect both cost and selling price. Custom
dimensions, unusual print coverage, certifications, regulated packs and
enterprise thresholds route to a managed quote.

The generated row-level ledger is available at
`artifacts/packwerk/docs/pricing-margin-audit.csv`. Regenerate it with
`pnpm --filter @workspace/packwerk audit:pricing`.

## Market anchors

| Family | Public price signal | Packworkz implication |
| --- | --- | --- |
| Printed stand-up pouch | Kraftix shows a 500-piece fixed-size route around Rs 21.24 each including GST. Public Indian converter listings vary from low single digits to Rs 50 depending on structure and print method. | The 250-piece tier is intentionally premium. Keep the current base ladder only after a matched converter quote confirms film, barrier, closure, print and freight. |
| Paper labels | Kraftix short runs commonly land around Rs 3-12 per piece. An IndiaMART-linked supplier lists Rs 0.80 only at MOQ 100,000. | Low-MOQ digital labels and six-figure flexo labels are not comparable. Separate shape pages may share cost logic but must retain size and substrate multipliers. |
| Waterproof/clear labels | Film, adhesive and white ink change cost materially. | Keep BOPP/vinyl and clear products separate; machine-applied rolls remain quote-only. |
| PET cosmetic bottles | Current Indian marketplace signals span roughly Rs 3-18 for common stock bottles, with pumps and airless formats materially higher. | Current Packworkz rates include small-run handling and decoration margin. Revalidate pump, cap and decoration as separate components. |
| Cosmetic tubes | Public supplier directories show roughly Rs 2-12 for basic tubes before dependable print/closure/freight matching. | The online printed-tube route must retain its MOQ and cost floor; non-standard diameter, barrier or applicator becomes a quote. |
| Corrugated cartons | Public suppliers show roughly Rs 12.5 for basic 2-ply printed cartons, around Rs 42 for 3-ply and Rs 60 for 5-ply at small MOQ. | Board grade, burst strength, print coverage and shipping volume must match before comparison. Mailer, transit and food cartons stay separate. |
| Printed BOPP tape | Public signals are around Rs 25-32 per roll at high MOQ; another listing shows MOQ 720 at Rs 31.50. | The 72-roll Packworkz tier must carry a low-volume premium. Recheck roll length, micron, adhesive and print colours. |
| Bagasse food-service | Public signals range from teaser listings near Rs 1.50 to Rs 8-14, with a more comparable 650-1,000 ml listing around Rs 5.90 at MOQ 2,000. | Size and lid must be costed separately. The current clamshell and bowl floors should not be reduced without a matched food-contact rate card. |
| Paper bowls/containers | Pepcom publishes a broad 200-1,250 ml family with matched lids. | Packworkz mirrors the useful fixed-size family, not dozens of thin SKUs. The size multiplier protects larger containers. |

## Current conclusion

The 49-family assortment is commercially manageable only if supplier rate cards
are maintained at the exact fixed specifications used online. The current
prices are conservative launch hypotheses protected by automated margin checks;
they are **not fully supplier-certified**.

Do not describe every green margin test as proof of profitability. A green test
means the selling price clears the cost entered in `LANDED_COSTS`; it cannot
detect a stale or incomplete supplier cost.

## Activation checklist

1. Obtain at least two like-for-like written supplier quotes for every
   instant-buy family; use three for the top five revenue families.
2. Enter the higher realistic landed cost unless a committed-volume contract
   justifies less.
3. Include rejects, replacements, inward freight, packing, plates/dies,
   closures/lids and payment cost.
4. Run the commerce tests and retain the 35% minimum product gross margin.
5. Route non-standard specifications and enterprise thresholds to managed quote.
6. Review resin, paper and freight-sensitive families monthly and the rest
   quarterly.

## Sources reviewed

- https://www.kraftixdigital.in/standup-pouch
- https://www.kraftixdigital.in/product-labels/
- https://www.kraftixdigital.in/packaging/categories/
- https://printpouch.in/product/custom-printed-standup-pouches/
- https://www.exportersindia.com/indian-suppliers/stand-up-pouch.htm
- https://www.komalprint.com/printed-label-sticker.html
- https://www.indiaprintline.com/printed-boxes.html
- https://www.tradeindia.com/manufacturers/pet-cosmetic-bottle.html
- https://www.exportersindia.com/indian-suppliers/cosmetic-plastic-tube.htm
- https://stickwelltapes.tradeindia.com/printed-bopp-tapes-9277970.html
- https://www.tradeindia.com/kolkata/printed-bopp-tape-city-200579.html
- https://www.tradeindia.com/products/bagasse-rectangular-container-c7548961.html
- https://www.exportersindia.com/product-detail/bagasse-container-8551856572.htm
- https://www.pepcomindia.com/wp-content/uploads/2026/01/Pepcom-Brochure-2026.pdf
