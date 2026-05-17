import { logger } from "./logger";

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.info({ phone, message: message.substring(0, 100) }, "WhatsApp webhook not configured, skipping");
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
    
    if (!response.ok) {
      logger.warn({ phone, status: response.status }, "WhatsApp webhook returned non-OK status");
    } else {
      logger.info({ phone }, "WhatsApp notification sent");
    }
  } catch (err) {
    logger.error({ err, phone }, "Failed to send WhatsApp notification");
  }
}
