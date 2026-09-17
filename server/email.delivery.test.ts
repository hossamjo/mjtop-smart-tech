import { afterEach, describe, expect, it, vi } from "vitest";
import { sendContactNotification } from "./email";

describe("Resend delivery", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds and sends a contact notification payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "mock-resend-id" }), { status: 200 })
      );

    const result = await sendContactNotification({
      name: "عميل اختبار",
      contact: "test@example.com",
      service: "أمن سيبراني",
      message: "رسالة اختبار محلية لمسار البريد.",
    });

    expect(result).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toMatchObject({
      Authorization: expect.stringContaining("Bearer "),
    });
    const payload = JSON.parse(String(options?.body));
    expect(payload.to).toEqual([process.env.CONTACT_RECIPIENT_EMAIL]);
    expect(payload.subject).toContain("عميل اختبار");
    expect(payload.reply_to).toBe("test@example.com");
  });
});
