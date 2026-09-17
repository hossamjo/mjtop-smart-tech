import { describe, expect, it, beforeEach } from "vitest";
import { isEmailConfigured } from "./email";
import { checkContactRateLimit, clearRateLimitBuckets } from "./rateLimit";

describe("contact security", () => {
  beforeEach(() => clearRateLimitBuckets());

  it("allows five requests and blocks the sixth within the window", () => {
    const fingerprint = "test-fingerprint";
    for (let index = 0; index < 5; index += 1) {
      expect(checkContactRateLimit(fingerprint).allowed).toBe(true);
    }
    const blocked = checkContactRateLimit(fingerprint);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("recognizes the configured Resend delivery path", () => {
    expect(isEmailConfigured()).toBe(true);
  });
});
