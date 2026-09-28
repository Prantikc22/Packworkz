import { useState } from "react";
import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  ArrowRight, ArrowUpRight, Box, Check, Clock3, CreditCard, ExternalLink, Factory, FileText, Link2, Loader2,
  Package, PackageCheck, Plus, Recycle, RefreshCw, Truck, X,
} from "lucide-react";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import "./dashboard.css";

const STEPS = ["Confirmed", "Production", "QC", "Dispatched", "Delivered"] as const;

const STATUS_META: Record<string, { label: string; tone: "amber" | "blue" | "violet" | "green" | "slate"; step: number }> = {
  payment_pending: { label: "Advance due", tone: "amber", step: 0 },
  payment_processing: { label: "Verifying payment", tone: "amber", step: 0 },
  pending: { label: "Pending", tone: "slate", step: 0 },
  confirmed: { label: "Confirmed", tone: "blue", step: 1 },
  in_production: { label: "In production", tone: "blue", step: 2 },
  qc: { label: "Quality check", tone: "amber", step: 3 },
  qc_check: { label: "Quality check", tone: "amber", step: 3 },
  dispatched: { label: "Dispatched", tone: "violet", step: 4 },
  delivered: { label: "Delivered", tone: "green", step: 5 },
};

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtINR = (n: number) => `₹${fmt(n)}`;

function effectiveStatus(order: any) {
  return order.advance_amount > 0 && !order.advance_paid ? "payment_pending" : order.status;
}

function formatDelivery(value?: string | null) {
  if (!value) return "Date confirmed after approval";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  return value;
}

function findSku(item: any) {
  if (!item) return undefined;
  return CATALOG_SKUS.find((sku) => sku.code === item.sku_code || sku.id === item.product_id || sku.name === item.product_name);
}

function StatusChip({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return <span className={`db-chip is-${meta.tone}`}>{meta.label}</span>;
}

function Progress({ status }: { status: string }) {
  const current = (STATUS_META[status] ?? STATUS_META.pending).step;
  return (
    <ol className="db-progress" aria-label="Order progress">
      {STEPS.map((step, index) => (
        <li key={step} className={index + 1 < current ? "is-done" : index + 1 === current ? "is-current" : ""}>
          <i />{step}
        </li>
      ))}
    </ol>
  );
}

export default function DashboardOverview() {
  const { data, isLoading, refetch } = useGetDashboardOverview();
  const storedUser = (() => {
    if (typeof window === "undefined") return {} as Record<string, string>;
    try { return JSON.parse(localStorage.getItem("packwerk_user") || "{}"); } catch { return {}; }
  })();
  const savedClaimReference = typeof window === "undefined" ? "" : localStorage.getItem("packwerk_claim_reference") || "";
  const [claimOpen, setClaimOpen] = useState(!!savedClaimReference);
  const [claimReference, setClaimReference] = useState(savedClaimReference);
  const [claimContact, setClaimContact] = useState(storedUser.email || storedUser.phone || "");
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claiming, setClaiming] = useState(false);

  const claimHistory = async (event: React.FormEvent) => {
    event.preventDefault();
    setClaiming(true);
    setClaimError("");
    setClaimSuccess("");
    try {
      const token = localStorage.getItem("packwerk_access_token");
      const response = await fetch("/api/dashboard/claim-history", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reference: claimReference, contact: claimContact }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "We could not link that record.");
      localStorage.removeItem("packwerk_claim_reference");
      setClaimSuccess(`${body.order_reference || body.quote_reference} is now in your workspace.`);
      setClaimReference("");
      await refetch();
    } catch (requestError) {
      setClaimError(requestError instanceof Error ? requestError.message : "We could not link that record.");
    } finally {
      setClaiming(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  if (isLoading) {
    return <div className="db-loading"><Loader2 className="animate-spin" size={28} /></div>;
  }

  const overview = data as any;
  const recentOrders = (overview?.recent_orders as any[]) ?? [];
  const activeOrders = overview?.active_orders ?? 0;
  const inProd = recentOrders.filter((order) => ["confirmed", "in_production", "qc", "qc_check"].includes(effectiveStatus(order))).length;
  const dispatched = recentOrders.filter((order) => effectiveStatus(order) === "dispatched").length;
  const pendingQuotes = overview?.pending_quotes ?? 0;
  const totalSaved = overview?.total_saved ?? 0;
  const ordersCompleted = overview?.orders_completed ?? 0;
  const creditEligible = overview?.credit_eligible ?? false;
  const creditLimit = overview?.credit_limit ?? 500000;
  const companyName = overview?.company_name || storedUser.company_name || storedUser.contact_name || "your team";
  const pendingQuotesList: any[] = (overview?.pending_quotes_list as any[]) ?? [];
  const activeOrderList = recentOrders.filter((order: any) => order.status !== "delivered" && order.status !== "cancelled");
  const advanceDue = activeOrderList.find((order: any) => effectiveStatus(order) === "payment_pending");
  const reorderItems = recentOrders
    .map((order: any) => ({ order, item: Array.isArray(order.items) ? order.items[0] : null }))
    .filter(({ item }) => item)
    .slice(0, 3);

  return (
    <div className="db">
      {/* ── Header ── */}
      <header className="db-head">
        <div>
          <p className="db-kicker">{today}</p>
          <h1>{greeting}, {companyName}</h1>
        </div>
        <div className="db-head-actions">
          <button type="button" className="db-btn is-line" onClick={() => setClaimOpen((open) => !open)}><Link2 size={15} /> Link past order</button>
          <Link href="/products" className="db-btn is-amber"><Plus size={16} /> New order</Link>
        </div>
      </header>

      {claimOpen && (
        <section className="db-claim">
          <div className="db-claim-intro">
            <div>
              <p className="db-kicker is-light">Secure record link</p>
              <h2>Bring an earlier guest order into this workspace.</h2>
              <p>Use the reference from your confirmation and the same checkout email or mobile. Records are never linked by email alone.</p>
            </div>
            <button aria-label="Close" onClick={() => setClaimOpen(false)}><X size={16} /></button>
          </div>
          <form onSubmit={claimHistory}>
            <label><span>Order or plan reference</span><input required placeholder="PO-2026-10001" value={claimReference} onChange={(event) => setClaimReference(event.target.value.toUpperCase())} /></label>
            <label><span>Checkout email or mobile</span><input required placeholder="you@company.com" value={claimContact} onChange={(event) => setClaimContact(event.target.value)} /></label>
            <button disabled={claiming} className="db-btn is-amber">{claiming ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />} Link record</button>
            {claimError && <p className="db-error">{claimError}</p>}
            {claimSuccess && <p className="db-success"><Check size={16} /> {claimSuccess}</p>}
          </form>
        </section>
      )}

      {/* ── Next action ── */}
      {advanceDue ? (
        <section className="db-next is-amber">
          <span className="db-next-icon"><CreditCard size={20} /></span>
          <div><b>Advance due on {advanceDue.order_id}</b><small>Production starts as soon as the advance is received.</small></div>
          {advanceDue.payment_link
            ? <a className="db-btn is-navy" href={advanceDue.payment_link} target="_blank" rel="noopener noreferrer">Pay advance <ExternalLink size={14} /></a>
            : <Link className="db-btn is-navy" href="/dashboard/payments">Open payments <ArrowRight size={15} /></Link>}
        </section>
      ) : pendingQuotesList.length > 0 ? (
        <section className="db-next">
          <span className="db-next-icon"><FileText size={20} /></span>
          <div><b>{pendingQuotesList.length} quote{pendingQuotesList.length > 1 ? "s" : ""} ready for your review</b><small>Approve to lock pricing and production slots.</small></div>
          <Link className="db-btn is-navy" href="/dashboard/quotes">Review quotes <ArrowRight size={15} /></Link>
        </section>
      ) : activeOrderList.length === 0 ? (
        <section className="db-next">
          <span className="db-next-icon"><Package size={20} /></span>
          <div><b>Start your next pack</b><small>{CATALOG_SKUS.length} formats with instant or 4-hour pricing — or feel samples first.</small></div>
          <Link className="db-btn is-navy" href="/products">Browse packaging <ArrowRight size={15} /></Link>
        </section>
      ) : null}

      {/* ── Metrics ── */}
      <section className="db-metrics">
        <article>
          <span className="db-metric-icon"><Truck size={18} /></span>
          <small>Active orders</small>
          <b>{activeOrders}</b>
          <p><span>{inProd} in production</span><span>{dispatched} dispatched</span></p>
        </article>
        <article>
          <span className="db-metric-icon"><FileText size={18} /></span>
          <small>Quotes to review</small>
          <b className={pendingQuotes > 0 ? "is-amber" : ""}>{pendingQuotes}</b>
          <p>{pendingQuotes > 0 ? <Link href="/dashboard/quotes">Review now <ArrowRight size={13} /></Link> : <span>All caught up</span>}</p>
        </article>
        <article>
          <span className="db-metric-icon"><PackageCheck size={18} /></span>
          <small>Total saved</small>
          <b className="is-green">{fmtINR(totalSaved)}</b>
          <p><span>Across completed orders</span></p>
        </article>
        <article>
          <span className="db-metric-icon"><CreditCard size={18} /></span>
          <small>Credit</small>
          {creditEligible ? (
            <><b className="is-green">Net-30</b><p><span>Limit {fmtINR(creditLimit)}</span></p></>
          ) : (
            <>
              <b>{Math.min(ordersCompleted, 3)}<em>/3</em></b>
              <div className="db-meter"><i style={{ width: `${Math.min((ordersCompleted / 3) * 100, 100)}%` }} /></div>
              <p><span>Completed orders towards credit</span></p>
            </>
          )}
        </article>
      </section>

      <div className="db-columns">
        {/* ── Active orders ── */}
        <section className="db-panel">
          <div className="db-panel-head">
            <h2>Active orders</h2>
            <Link href="/dashboard/orders">View all <ArrowRight size={14} /></Link>
          </div>
          {activeOrderList.length === 0 ? (
            <div className="db-empty">
              <Box size={34} />
              <b>No active orders</b>
              <p>Your production, QC and dispatch updates will appear here.</p>
              <Link href="/products" className="db-btn is-amber">Browse packaging</Link>
            </div>
          ) : (
            <ul className="db-orders">
              {activeOrderList.map((order: any) => {
                const status = effectiveStatus(order);
                const item = Array.isArray(order.items) ? order.items[0] : null;
                const sku = findSku(item);
                return (
                  <li key={order.id}>
                    <div className="db-order-top">
                      {sku ? <img src={getCatalogImage(sku)} alt="" /> : <span className="db-order-ph"><Package size={20} /></span>}
                      <div className="db-order-main">
                        <span className="db-order-id">{order.order_id}</span>
                        <b>{item?.product_name ?? "Packaging order"}{Array.isArray(order.items) && order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}</b>
                        <small>{item?.quantity ? `${fmt(item.quantity)} ${item.quantity_unit || "units"}` : ""} · <Clock3 size={12} /> {formatDelivery(order.delivery_date_label || order.estimated_delivery)}</small>
                      </div>
                      <div className="db-order-side">
                        <StatusChip status={status} />
                        {status === "payment_pending" && order.payment_link ? (
                          <a href={order.payment_link} target="_blank" rel="noopener noreferrer" className="db-link is-strong">Pay advance <ExternalLink size={13} /></a>
                        ) : order.tracking_url ? (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="db-link">Track shipment <ExternalLink size={13} /></a>
                        ) : (
                          <Link href="/dashboard/orders" className="db-link">Details <ArrowRight size={13} /></Link>
                        )}
                      </div>
                    </div>
                    <Progress status={status} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Side column ── */}
        <aside className="db-side">
          {pendingQuotesList.length > 0 && (
            <section className="db-panel">
              <div className="db-panel-head"><h2>Quotes</h2><Link href="/dashboard/quotes">All <ArrowRight size={14} /></Link></div>
              <ul className="db-quotes">
                {pendingQuotesList.slice(0, 3).map((quote: any) => {
                  const daysLeft = Math.max(0, Math.round((new Date(quote.created_at).getTime() + 7 * 86400000 - Date.now()) / 86400000));
                  const paymentPending = quote.status === "payment_pending" || quote.status === "payment_processing";
                  return (
                    <li key={quote.id}>
                      <div><span className="db-order-id">{quote.quote_id}</span><span className={`db-chip ${paymentPending ? "is-blue" : daysLeft < 2 ? "is-red" : "is-amber"}`}>{paymentPending ? "Advance due" : `${daysLeft}d left`}</span></div>
                      <b>{Array.isArray(quote.items) ? quote.items.map((item: any) => item.product_name).filter(Boolean).join(", ") || "Custom packaging" : "Custom packaging"}</b>
                      {quote.total_estimated_min ? <small>Est. {fmtINR(quote.total_estimated_min)} – {fmtINR(quote.total_estimated_max ?? quote.total_estimated_min)}</small> : null}
                      <Link href="/dashboard/quotes" className="db-link is-strong">{paymentPending ? "Open payment" : "Review quote"} <ArrowRight size={13} /></Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="db-panel">
            <div className="db-panel-head"><h2><RefreshCw size={15} /> Reorder</h2></div>
            {reorderItems.length ? (
              <ul className="db-reorder">
                {reorderItems.map(({ order, item }) => {
                  const sku = findSku(item);
                  return (
                    <li key={order.id}>
                      {sku ? <img src={getCatalogImage(sku)} alt="" /> : <span className="db-order-ph"><Package size={16} /></span>}
                      <span><b>{item.product_name}</b><small>{item.quantity ? `${fmt(item.quantity)} ${item.quantity_unit || "units"} · ` : ""}{order.order_id}</small></span>
                      <Link href={sku ? `/products/${sku.slug}` : "/products"} className="db-btn is-line is-sm">Reorder</Link>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="db-muted">Past orders appear here for one-click reordering.</p>}
          </section>

          <section className="db-shortcuts">
            <Link href="/samples"><Box size={18} /><span><b>Sample kit · ₹299</b><small>25–50+ real samples</small></span><ArrowUpRight size={15} /></Link>
            <Link href="/mockup-studio"><Package size={18} /><span><b>3D Studio</b><small>Preview your next pack</small></span><ArrowUpRight size={15} /></Link>
            <Link href="/machinery"><Factory size={18} /><span><b>Machinery</b><small>Sealers, fillers, coders</small></span><ArrowUpRight size={15} /></Link>
            <Link href="/circular"><Recycle size={18} /><span><b>Sell scrap</b><small>Quotes from recyclers</small></span><ArrowUpRight size={15} /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
