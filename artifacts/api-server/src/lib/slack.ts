type SlackField = { label: string; value?: string | number | boolean | null };

export type SlackLeadEvent = {
  source: "Configurator" | "Contact" | "Support" | "Packworkz AI" | "Exit offer" | "Newsletter" | "Enterprise benchmark" | "Design" | "Sample" | "Razorpay";
  title: string;
  referenceId?: string;
  summary: string;
  fields?: SlackField[];
  actionUrl?: string;
};

export type SlackDelivery = {
  delivered: boolean;
  reason?: string;
};

const truncate = (value: unknown, max = 2800) =>
  String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export async function notifySlack(event: SlackLeadEvent): Promise<SlackDelivery> {
  const channel = process.env.SLACK_CHANNEL_ID;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!channel && !webhookUrl) return { delivered: false, reason: "missing_channel" };
  if (!botToken && !webhookUrl) {
    const reason = process.env.SLACK_APP_TOKEN?.startsWith("xapp-")
      ? "app_token_cannot_post_messages"
      : "missing_bot_token_or_webhook";
    return { delivered: false, reason };
  }

  const fields = (event.fields || [])
    .filter(field => field.value !== undefined && field.value !== null && field.value !== "")
    .slice(0, 10)
    .map(field => ({
      type: "mrkdwn",
      text: `*${truncate(field.label, 80)}*\n${truncate(field.value, 700)}`,
    }));

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: truncate(`${event.source}: ${event.title}`, 145), emoji: false },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: truncate(event.summary) },
    },
  ];

  if (event.referenceId) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `Reference: *${truncate(event.referenceId, 100)}*` }],
    });
  }
  if (fields.length) blocks.push({ type: "section", fields });
  if (event.actionUrl) {
    blocks.push({
      type: "actions",
      elements: [{
        type: "button",
        text: { type: "plain_text", text: "Open in Packworkz" },
        url: event.actionUrl,
        action_id: "open_packworkz_record",
      }],
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl || "https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: webhookUrl
        ? { "Content-Type": "application/json" }
        : { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${botToken}` },
      body: JSON.stringify(webhookUrl
        ? { text: `${event.source}: ${event.title}`, blocks }
        : { channel, text: `${event.source}: ${event.title}`, blocks, unfurl_links: false }),
      signal: controller.signal,
    });

    const payload = webhookUrl
      ? { ok: response.ok, error: response.ok ? undefined : await response.text() }
      : await response.json() as { ok?: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      return { delivered: false, reason: truncate(payload.error || `http_${response.status}`, 120) };
    }
    return { delivered: true };
  } catch (error) {
    return {
      delivered: false,
      reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "network_error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
