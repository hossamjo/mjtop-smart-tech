import { describe, expect, it } from "vitest";

describe("Resend configuration", () => {
  it("authenticates with Resend domains endpoint", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.ok).toBe(true);
  }, 15_000);

  it("uses a verified sender domain or Resend test sender", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();
    expect(from, "RESEND_FROM_EMAIL must be configured").toBeTruthy();

    const domain = from?.match(/@([^>\s]+)>?$/)?.[1]?.toLowerCase();
    expect(domain, "RESEND_FROM_EMAIL must contain a valid domain").toBeTruthy();
    if (domain === "resend.dev") return;

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const payload = (await response.json()) as { data?: Array<{ name?: string; status?: string }> };
    const verified = payload.data?.some(item => item.name?.toLowerCase() === domain && item.status === "verified");
    expect(verified, `Resend sender domain ${domain} must be verified`).toBe(true);
  }, 15_000);
});
