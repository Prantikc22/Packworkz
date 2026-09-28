import { money } from "@/lib/currency";

/** Formats an INR amount in the visitor's display currency (INR in India, USD elsewhere). */
export function formatINR(amount: number): string {
  return money(Math.round(amount));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: "bg-blue text-white",
    reviewing: "bg-amber text-navy",
    quoted: "bg-navy text-white",
    accepted: "bg-success text-white",
    rejected: "bg-danger text-white",
    confirmed: "bg-blue text-white",
    in_production: "bg-amber text-navy",
    qc: "bg-amber text-navy",
    dispatched: "bg-blue text-white",
    delivered: "bg-success text-white",
    paid: "bg-success text-white",
    in_design: "bg-amber text-navy",
    revision: "bg-amber text-navy",
    approved: "bg-success text-white",
    pending: "bg-amber text-navy",
    overdue: "bg-danger text-white",
  };
  return colors[status.toLowerCase()] || "bg-gray-200 text-gray-800";
}
