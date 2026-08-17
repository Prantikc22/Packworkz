import { Link } from "wouter";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { CATALOG_SKUS } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { getCartCheckoutDecision, getCartConfigurationDetails, getCartEstimate, useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem } = useCart();
  const rows = items.flatMap((item) => {
    const sku = CATALOG_SKUS.find((entry) => entry.code === item.skuCode);
    return sku ? [{ item, sku }] : [];
  });
  const checkoutDecision = getCartCheckoutDecision(rows);
  const hasUnavailableItems = rows.length !== items.length;
  const total = items.reduce((sum, item) => {
    const sku = CATALOG_SKUS.find((entry) => entry.code === item.skuCode);
    return sum + (sku ? getCartEstimate(item, sku).high : 0);
  }, 0);

  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="absolute inset-0 bg-slate-950/45" onClick={closeCart} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3"><ShoppingCart className="h-5 w-5" /><h2 className="text-xl font-bold text-navy">Your cart</h2></div>
          <button type="button" onClick={closeCart} className="p-2 text-slate-600 hover:text-navy" aria-label="Close cart"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="py-20 text-center"><ShoppingCart className="mx-auto mb-4 h-10 w-10 text-slate-300" /><p className="font-semibold text-navy">Your cart is empty</p><p className="mt-2 text-sm text-muted">Choose a standard product to get started.</p></div>
          ) : items.map((item) => {
            const configuration = getCartConfigurationDetails(item);
            return (
            <div key={item.id} className="grid grid-cols-[80px_1fr_auto] gap-4 border-b border-slate-200 py-5 first:pt-0">
              <img src={item.image} alt="" className="h-20 w-20 object-cover" />
              <div>
                <p className="font-bold text-navy">{item.productName}</p>
                <p className="mt-1 text-xs text-muted">{item.sizeLabel} · Custom printed</p>
                <p className="mt-2 text-sm font-semibold text-navy">{item.quantity.toLocaleString("en-IN")} {item.quantityUnit}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{configuration.slice(0, 3).map(({ value }) => value).join(" · ")}</p>
              </div>
              <button type="button" onClick={() => removeItem(item.id)} className="self-start p-1 text-slate-400 hover:text-red-600" aria-label={`Remove ${item.productName}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          )})}
        </div>
        {items.length > 0 && <div className="border-t border-slate-200 p-6">
          <div className="mb-4 flex justify-between"><span className="text-sm text-muted">Estimated total, including GST</span><strong className="text-xl text-navy">{formatINR(total)}</strong></div>
          <p className="mb-4 text-xs leading-5 text-muted">{hasUnavailableItems ? "Review unavailable saved items before continuing." : checkoutDecision.requiresQuote ? "The complete cart will be reviewed as one quote; no line is charged separately." : "Your address is entered once for the complete cart."}</p>
          <Link href={hasUnavailableItems ? "/cart" : "/cart/checkout"} onClick={closeCart} className="flex min-h-14 items-center justify-center bg-amber px-5 text-base font-black text-navy hover:bg-[#d99a2a]">{hasUnavailableItems ? "Review cart" : checkoutDecision.requiresQuote ? "Continue to quote checkout" : "Proceed to checkout"}</Link>
          <Link href="/cart" onClick={closeCart} className="mt-3 flex min-h-12 items-center justify-center border border-navy px-5 text-sm font-bold text-navy hover:bg-slate-50">View and edit cart</Link>
        </div>}
      </aside>
    </div>,
    document.body,
  );
}
