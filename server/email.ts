import { ENV } from "./_core/env";

export function isEmailConfigured() {
  return Boolean(ENV.resendApiKey && ENV.resendFromEmail && ENV.contactRecipientEmail);
}

export async function sendContactNotification(input: {
  name: string;
  contact: string;
  service?: string;
  message: string;
}) {
  if (!isEmailConfigured()) return { sent: false as const, reason: "not_configured" as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ENV.resendFromEmail,
      to: [ENV.contactRecipientEmail],
      reply_to: input.contact.includes("@") ? input.contact : undefined,
      subject: `رسالة جديدة من موقع MjTop — ${input.name}`,
      text: [
        `الاسم: ${input.name}`,
        `وسيلة التواصل: ${input.contact}`,
        `الخدمة: ${input.service || "غير محددة"}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${details.slice(0, 300)}`);
  }

  return { sent: true as const };
}
