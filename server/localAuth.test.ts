import { describe, expect, it } from "vitest";
import {
  hashPassword,
  isStrongEnoughPassword,
  verifyPassword,
} from "./localAuth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("local authentication", () => {
  it("hashes and verifies passwords without storing plaintext", async () => {
    const password = "A-strong-test-password-2026";
    const encoded = await hashPassword(password);
    expect(encoded).not.toContain(password);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword("wrong-password", encoded)).toBe(false);
  });

  it("requires a long enough password", () => {
    expect(isStrongEnoughPassword("short")).toBe(false);
    expect(isStrongEnoughPassword("A-strong-test-password-2026")).toBe(true);
  });

  it("exposes guest access while OAuth providers remain placeholders", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const providers = await appRouter.createCaller(ctx).auth.providers();
    expect(providers.guest).toBe(true);
    expect(providers.google).toBe(false);
    expect(providers.facebook).toBe(false);
  });
});
