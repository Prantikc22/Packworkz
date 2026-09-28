export type LeadKind = "machinery" | "circular";

type LeadInput = {
  kind: LeadKind;
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  metadata: Record<string, unknown>;
};

/**
 * Saves an enquiry through the shared leads pipeline. The kind is stored in
 * metadata and the subject prefix so the admin inbox can group it.
 */
export async function submitLead(input: LeadInput): Promise<string> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "contact",
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      subject: `[${input.kind === "machinery" ? "Machinery" : "Circular"}] ${input.subject}`,
      message: input.message,
      metadata: { kind: input.kind, page: typeof window !== "undefined" ? window.location.pathname : "", ...input.metadata },
    }),
  });
  const payload = await response.json().catch(() => ({})) as { inquiry_id?: string; error?: string };
  if (!response.ok) throw new Error(payload.error || "We could not save your request. Please try again.");
  return payload.inquiry_id || "saved";
}
