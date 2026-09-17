import { describe, expect, it } from "vitest";

type TrpcEnvelope = {
  result?: { data?: { json?: unknown } };
  error?: unknown;
};

const previewUrl = process.env.ADMIN_PREVIEW_URL;
const adminPassword = process.env.ADMIN_TEST_PASSWORD;

describe("ADMIN_PASSWORD_HASH runtime secret", () => {
  it.skipIf(!previewUrl || !adminPassword)("enables local admin login through the live tRPC API", async () => {
    expect(previewUrl, "ADMIN_PREVIEW_URL is required for this integration test").toBeTruthy();
    expect(adminPassword, "ADMIN_TEST_PASSWORD is required for this integration test").toBeTruthy();

    const baseUrl = previewUrl!.replace(/\/$/, "");
    const providersResponse = await fetch(`${baseUrl}/api/trpc/auth.providers`);
    expect(providersResponse.status).toBe(200);
    const providersPayload = (await providersResponse.json()) as TrpcEnvelope;
    expect((providersPayload.result?.data?.json as { local?: boolean }).local).toBe(true);

    const loginResponse = await fetch(`${baseUrl}/api/trpc/auth.loginLocal?batch=1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        0: {
          json: {
            username: "mjtop249@gmail.com",
            password: adminPassword,
          },
        },
      }),
    });
    expect(loginResponse.status).toBe(200);
    const loginPayload = (await loginResponse.json()) as TrpcEnvelope[];
    const loginUser = loginPayload[0]?.result?.data?.json as { user?: { role?: string } };
    expect(loginUser.user?.role).toBe("admin");
  });
});
