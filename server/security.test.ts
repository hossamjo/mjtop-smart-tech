import { describe, expect, it } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { appRouter, contactInput } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getSessionCookieOptions } from "./_core/cookies";
import { securityHeaders } from "./security";

describe("OWASP baseline controls", () => {
  it("sets defensive response headers and HSTS on HTTPS", () => {
    const headers = new Map<string, string>();
    const res = { setHeader: (name: string, value: string) => headers.set(name, value) } as unknown as Response;
    const req = { protocol: "https", headers: {} } as Request;
    const next = (() => undefined) as NextFunction;

    securityHeaders(req, res, next);

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("keeps session cookies HttpOnly, Secure on HTTPS, and out of URLs", () => {
    const options = getSessionCookieOptions({ protocol: "https", headers: {} } as Request);
    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    expect(options.path).toBe("/");
    expect(options.sameSite).toBe("none");
  });

  it("rejects oversized contact input and does not elevate a normal user", async () => {
    expect(contactInput.safeParse({ name: "A", contact: "x", message: "short" }).success).toBe(false);
    expect(contactInput.safeParse({ name: "A", contact: "x", message: "x".repeat(5001) }).success).toBe(false);

    const user = { id: 7, openId: "user-7", name: "User", email: "user@example.com", loginMethod: "test", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    const ctx = { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).admin.messages()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
