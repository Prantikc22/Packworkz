type AnalyticsValue = string | number | boolean | null | undefined;

export function trackMarketingEvent(name: string, detail: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("packworkz:analytics", { detail: { name, ...detail } }));

  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, params?: Record<string, AnalyticsValue>) => void;
  };
  analyticsWindow.dataLayer?.push({ event: name, ...detail });
  analyticsWindow.gtag?.("event", name, detail);
}
