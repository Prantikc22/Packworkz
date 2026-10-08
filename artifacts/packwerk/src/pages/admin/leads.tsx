import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, FileText, Image as ImageIcon, Inbox, Loader2, Mail, MessageCircle, Phone, RefreshCw, Search } from "lucide-react";
import "../dashboard/dashboard.css";

type LeadKind = "machinery" | "circular" | "manufacturing_requirement" | "manufacturer_application" | "contact" | "exit_offer" | "enterprise_benchmark" | "pack_ai_handoff" | "newsletter" | "support";

const KIND_META: Record<string, { label: string; tone: string }> = {
  machinery: { label: "Machinery", tone: "is-blue" },
  circular: { label: "Circular", tone: "is-green" },
  manufacturing_requirement: { label: "Manufacturing brief", tone: "is-amber" },
  manufacturer_application: { label: "Factory listing", tone: "is-violet" },
  contact: { label: "Contact", tone: "is-slate" },
  exit_offer: { label: "Sample-kit offer", tone: "is-amber" },
  enterprise_benchmark: { label: "Enterprise", tone: "is-violet" },
  pack_ai_handoff: { label: "Packworkz AI", tone: "is-violet" },
  newsletter: { label: "Newsletter", tone: "is-slate" },
  support: { label: "Support", tone: "is-red" },
};

const HIDDEN_META = new Set(["kind", "page", "photos", "profile", "documents", "approved", "verification_level", "reviewed_at"]);
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)(\?|$)/i;

function adminFetch(path: string) {
  const key = localStorage.getItem("packwerk_admin_key") || "";
  return fetch(`/api${path}`, { headers: { "x-admin-key": key } }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((body as { error?: string }).error || `Request failed (${response.status})`);
    return body;
  });
}

function FactoryReview({ quoteId, meta }: { quoteId: string; meta: Record<string, any> }) {
  const [state, setState] = useState({ approved: Boolean(meta.approved), level: String(meta.verification_level || "none") });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const save = async (approved: boolean, level: string) => {
    setBusy(true);
    setNote("");
    try {
      const response = await fetch(`/api/admin/manufacturers/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-key": localStorage.getItem("packwerk_admin_key") || "" },
        body: JSON.stringify({ approved, verification_level: level }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Update failed");
      setState({ approved, level });
      setNote(approved ? "Published on /manufacturing" : "Unpublished");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };
  const docs: Record<string, string[]> = meta.documents || {};
  return (
    <div className="adm-lead-meta" style={{ display: "grid", gap: 10, padding: 14, border: "1px solid #e1e7ee", borderRadius: 6 }}>
      <div><dt>Status</dt><dd>{state.approved ? `Published · ${state.level === "verified" ? "Verified" : state.level === "basic" ? "Documents checked" : "Unchecked"}` : "Awaiting review"}{meta.paid_service ? ` · PAID ${meta.paid_service}` : ""}</dd></div>
      {Object.entries(docs).map(([key, urls]) => urls.length > 0 && (
        <div key={key}><dt>{key}</dt><dd>{urls.map((url, i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 10 }}>File {i + 1} <ExternalLink size={11} /></a>)}</dd></div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="db-btn is-sm" disabled={busy} onClick={() => save(true, "basic")}>Publish (docs checked)</button>
        <button type="button" className="db-btn is-sm" disabled={busy} onClick={() => save(true, "verified")}>Mark Verified</button>
        {state.approved && <button type="button" className="db-btn is-line is-sm" disabled={busy} onClick={() => save(false, state.level)}>Unpublish</button>}
        {note && <small style={{ alignSelf: "center" }}>{note}</small>}
      </div>
    </div>
  );
}

function leadKind(record: any): LeadKind {
  const item = Array.isArray(record.items) ? record.items[0] || {} : {};
  return (item.metadata?.kind || item.source || "contact") as LeadKind;
}

function fileName(url: string) {
  try {
    const last = decodeURIComponent(new URL(url, window.location.origin).pathname.split("/").pop() || url);
    return last.replace(/^[a-f0-9]{24}_/, "");
  } catch {
    return url;
  }
}

const formatDate = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const waHref = (phone?: string) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

type UploadRow = { url: string; reference: string; company: string; context: string; date: string; source: "Order / quote" | "Enquiry" };

export default function AdminLeads() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"leads" | "uploads">("leads");
  const [kind, setKind] = useState<string>("all");
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    adminFetch("/admin/quotes")
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load data"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const leads = useMemo(() => records.filter((record) => record.status === "lead"), [records]);
  const counts = useMemo(() => leads.reduce<Record<string, number>>((acc, lead) => { const k = leadKind(lead); acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [leads]);

  const uploads = useMemo<UploadRow[]>(() => {
    const rows: UploadRow[] = [];
    for (const record of records) {
      const items: any[] = Array.isArray(record.items) ? record.items : [];
      if (record.status === "lead") {
        const photos: string[] = items[0]?.metadata?.photos || [];
        photos.forEach((url) => rows.push({ url, reference: record.quote_id, company: record.company_name, context: items[0]?.subject || "Enquiry photo", date: record.created_at, source: "Enquiry" }));
        continue;
      }
      const seen = new Set<string>();
      [...items.map((item) => ({ url: item.artwork_file_url, context: item.product_name })), { url: record.artwork_file_url, context: "Order artwork" }]
        .forEach(({ url, context }) => {
          if (!url || String(url).startsWith("local:") || seen.has(url)) return;
          seen.add(url);
          rows.push({ url, reference: record.quote_id, company: record.company_name, context: context || "Artwork", date: record.created_at, source: "Order / quote" });
        });
    }
    return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [records]);

  const term = query.trim().toLowerCase();
  const visibleLeads = leads
    .filter((lead) => kind === "all" || leadKind(lead) === kind)
    .filter((lead) => !term || JSON.stringify([lead.quote_id, lead.company_name, lead.contact_name, lead.email, lead.phone, lead.items]).toLowerCase().includes(term));
  const visibleUploads = uploads.filter((row) => !term || `${row.reference} ${row.company} ${row.context} ${row.url}`.toLowerCase().includes(term));

  return (
    <div className="db">
      <header className="db-head">
        <div>
          <p className="db-kicker">Admin</p>
          <h1>Leads &amp; uploads</h1>
        </div>
        <div className="db-head-actions">
          <label className="adm-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, company, reference…" /></label>
          <button type="button" className="db-btn is-line" onClick={load}><RefreshCw size={15} /> Refresh</button>
        </div>
      </header>

      <div className="adm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "leads"} className={tab === "leads" ? "is-active" : ""} onClick={() => setTab("leads")}><Inbox size={16} /> Leads <small>{leads.length}</small></button>
        <button type="button" role="tab" aria-selected={tab === "uploads"} className={tab === "uploads" ? "is-active" : ""} onClick={() => setTab("uploads")}><FileText size={16} /> Uploaded files <small>{uploads.length}</small></button>
      </div>

      {loading ? (
        <div className="db-loading"><Loader2 className="animate-spin" size={28} /></div>
      ) : error ? (
        <div className="db-panel db-empty"><b>Could not load</b><p>{error}. Check that you are signed in with the admin key.</p></div>
      ) : tab === "leads" ? (
        <>
          <div className="adm-filters">
            <button type="button" className={kind === "all" ? "is-active" : ""} onClick={() => setKind("all")}>All <small>{leads.length}</small></button>
            {Object.entries(KIND_META).filter(([key]) => counts[key]).map(([key, meta]) => (
              <button key={key} type="button" className={kind === key ? "is-active" : ""} onClick={() => setKind(key)}>{meta.label} <small>{counts[key]}</small></button>
            ))}
          </div>
          {visibleLeads.length === 0 ? (
            <div className="db-panel db-empty"><Inbox size={32} /><b>No leads here yet</b><p>New enquiries from contact, machinery, circular and offer forms appear here.</p></div>
          ) : (
            <div className="adm-leads">
              {visibleLeads.map((lead) => {
                const item = Array.isArray(lead.items) ? lead.items[0] || {} : {};
                const k = leadKind(lead);
                const meta = KIND_META[k] || KIND_META.contact;
                const extra = Object.entries(item.metadata || {}).filter(([key, value]) => !HIDDEN_META.has(key) && value !== "" && value != null && !(Array.isArray(value) && !value.length));
                const photos: string[] = item.metadata?.photos || [];
                const email = String(lead.email || "").includes("@packworkz.invalid") ? "" : lead.email;
                const phone = lead.phone && lead.phone !== "Not provided" ? lead.phone : "";
                return (
                  <article key={lead.id} className="db-panel adm-lead">
                    <div className="adm-lead-head">
                      <span className={`db-chip ${meta.tone}`}>{meta.label}</span>
                      <span className="db-order-id">{lead.quote_id}</span>
                      <time>{formatDate(lead.created_at)}</time>
                    </div>
                    <h3>{String(item.subject || "Website enquiry").replace(/^\[(Machinery|Circular|Manufacturing|Factory listing)\]\s*/, "")}</h3>
                    <p className="adm-lead-who"><b>{lead.contact_name}</b>{lead.company_name && lead.company_name !== "Not provided" ? ` · ${lead.company_name}` : ""}</p>
                    {item.message && <p className="adm-lead-msg">{item.message}</p>}
                    {extra.length > 0 && (
                      <dl className="adm-lead-meta">
                        {extra.map(([key, value]) => <div key={key}><dt>{key.replace(/_/g, " ")}</dt><dd>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}
                      </dl>
                    )}
                    {k === "manufacturer_application" && <FactoryReview quoteId={lead.quote_id} meta={item.metadata || {}} />}
                    {photos.length > 0 && (
                      <div className="adm-photos">{photos.map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Uploaded" loading="lazy" /></a>)}</div>
                    )}
                    <div className="adm-lead-actions">
                      {email && <a className="db-btn is-line is-sm" href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${item.subject || "your enquiry"} (${lead.quote_id})`)}`}><Mail size={14} /> {email}</a>}
                      {phone && <a className="db-btn is-line is-sm" href={`tel:${phone}`}><Phone size={14} /> {phone}</a>}
                      {waHref(phone) && <a className="db-btn is-line is-sm adm-wa" href={waHref(phone)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>}
                      <button type="button" className="db-btn is-line is-sm" onClick={() => navigator.clipboard?.writeText(lead.quote_id)}><Copy size={14} /> Copy ref</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : visibleUploads.length === 0 ? (
        <div className="db-panel db-empty"><FileText size={32} /><b>No uploaded files yet</b><p>Artwork attached to orders and photos attached to enquiries appear here.</p></div>
      ) : (
        <div className="db-panel adm-uploads">
          {visibleUploads.map((row) => (
            <div key={`${row.reference}-${row.url}`} className="adm-upload">
              {IMAGE_EXT.test(row.url) ? <img src={row.url} alt="" loading="lazy" /> : <span className="adm-file-icon">{row.url.toLowerCase().includes(".pdf") ? "PDF" : <FileText size={20} />}</span>}
              <div className="adm-upload-main">
                <b title={row.url}>{fileName(row.url)}</b>
                <small>{row.context} · {row.company || "—"}</small>
              </div>
              <span className="db-order-id">{row.reference}</span>
              <span className={`db-chip ${row.source === "Enquiry" ? "is-green" : "is-blue"}`}>{row.source === "Enquiry" ? <><ImageIcon size={12} />&nbsp;Enquiry</> : "Order / quote"}</span>
              <time>{formatDate(row.date)}</time>
              <div className="adm-upload-actions">
                <a className="db-btn is-line is-sm" href={row.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open</a>
                <a className="db-btn is-navy is-sm" href={row.url} download><Download size={14} /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
