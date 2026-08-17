import { Link } from "wouter";
import { AlertTriangle, ArrowRight, PackageOpen, ShoppingBag, Trash2 } from "lucide-react";
import { CATALOG_SKUS, requiresQuote } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { getCartCheckoutDecision, getCartConfigurationDetails, getCartEstimate, useCart } from "@/lib/cart";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const rows = items.flatMap((item) => {
    const sku = CATALOG_SKUS.find((entry) => entry.code === item.skuCode);
    if (!sku) return [];
    return [{ item, sku, estimate: getCartEstimate(item, sku) }];
  });
  const unresolvedItems = items.filter((item) => !CATALOG_SKUS.some((sku) => sku.code === item.skuCode));
  const checkoutDecision = getCartCheckoutDecision(rows);
  const total = rows.reduce((sum, row) => sum + row.estimate.high, 0);

  if (!items.length) {
    return (
      <main className="min-h-[72vh] bg-slate-50 px-5 pb-20 pt-40">
        <section className="mx-auto max-w-3xl border border-slate-200 bg-white px-6 py-16 text-center md:px-14">
          <PackageOpen className="mx-auto mb-5 h-12 w-12 text-blue" />
          <h1 className="text-3xl font-black text-navy md:text-5xl">Your cart is ready when you are.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">Browse standard packaging you can buy online, or request a managed quote for technical and high-volume work.</p>
          <Link href="/products" className="mt-8 inline-flex h-14 items-center gap-3 bg-amber px-7 text-lg font-black text-navy hover:bg-[#d99a29]">
            Shop packaging <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-36 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue">Your cart</p>
            <h1 className="mt-2 text-4xl font-black text-navy md:text-6xl">Review your packaging.</h1>
          </div>
          <Link href="/products" className="font-bold text-blue hover:text-navy">Continue shopping</Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4" aria-label="Cart items">
            {unresolvedItems.map((item) => (
              <article key={item.id} className="flex items-start justify-between gap-5 border border-amber-300 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div><h2 className="font-black text-navy">{item.productName || item.skuCode} is no longer available</h2><p className="mt-1 text-sm text-slate-600">Remove this saved item before checkout. It will never be silently omitted or charged.</p></div>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-600" aria-label={`Remove ${item.productName}`}><Trash2 className="h-5 w-5" /></button>
              </article>
            ))}
            {rows.map(({ item, sku, estimate }) => {
              const configuration = getCartConfigurationDetails(item);
              const quantities = Array.from(new Set([
                ...(sku.price_tiers || []).filter((tier) => !requiresQuote(sku, tier.min_qty)).map((tier) => tier.min_qty),
                item.quantity,
              ])).sort((a, b) => a - b);
              return (
                <article key={item.id} className="grid gap-5 border border-slate-200 bg-white p-4 sm:grid-cols-[150px_1fr] md:p-5">
                  <img src={item.image} alt={item.productName} className="aspect-square h-full w-full object-cover" />
                  <div className="flex min-w-0 flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">{item.skuCode} · Custom printed</p>
                        <h2 className="mt-1 text-2xl font-black text-navy">{item.productName}</h2>
                        <p className="mt-1 text-sm text-muted">{item.sizeLabel}</p>
                        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          {configuration.map(({ label, value }) => (
                            <div key={`${label}:${value}`} className="flex min-w-0 gap-2">
                              <dt className="shrink-0 font-bold text-slate-500">{label}:</dt>
                              <dd className="truncate font-semibold text-navy">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-muted hover:text-red-600" aria-label={`Remove ${item.productName}`}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-5 border-t border-slate-200 pt-4">
                      <label className="text-sm font-bold text-navy">
                        Quantity
                        <select
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                          className="mt-2 block h-11 min-w-40 border border-slate-300 bg-white px-3 font-bold outline-none focus:border-blue"
                        >
                          {quantities.map((quantity) => <option key={quantity} value={quantity}>{quantity.toLocaleString("en-IN")} {item.quantityUnit}</option>)}
                        </select>
                      </label>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Estimated total, incl. GST</p>
                        <p className="mt-1 text-2xl font-black text-navy">{formatINR(estimate.high)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit border border-navy bg-navy p-6 text-white lg:sticky lg:top-32">
            <div className="flex items-center gap-3 border-b border-white/15 pb-5">
              <ShoppingBag className="h-6 w-6 text-amber" />
              <h2 className="text-2xl font-black">Order summary</h2>
            </div>
            <div className="flex justify-between border-b border-white/15 py-6 text-sm text-white/70">
              <span>{items.length} {items.length === 1 ? "product" : "products"}</span>
              <span>Delivery calculated at checkout</span>
            </div>
            <div className="flex items-end justify-between py-6">
              <span className="font-bold">Estimated total</span>
              <strong className="text-3xl">{formatINR(total)}</strong>
            </div>
            <p className="mb-5 text-sm leading-6 text-white/60">{unresolvedItems.length ? "Remove unavailable items before continuing." : checkoutDecision.requiresQuote ? "This cart will be submitted as one managed quote. Instant-buy lines will not be charged separately." : "Includes the launch discount and GST. Your address is entered once on the next step."}</p>
            {unresolvedItems.length ? (
              <div className="flex h-14 w-full items-center justify-center bg-white/10 px-5 text-center text-sm font-bold text-white/60">Review unavailable items</div>
            ) : (
              <Link href="/cart/checkout" className="flex h-14 w-full items-center justify-center gap-3 bg-amber px-5 text-lg font-black text-navy hover:bg-[#d99a29]">
                {checkoutDecision.requiresQuote ? "Continue to quote checkout" : "Proceed to checkout"} <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
