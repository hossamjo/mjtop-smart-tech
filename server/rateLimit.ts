import { createHash } from "node:crypto";
import type { Request } from "express";

type Bucket = { startedAt: number; count: number };

const buckets = new Map<string, Bucket>();
const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_LIMIT = 5;

export function getClientFingerprint(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : req.ip ?? "unknown";
  const userAgent = req.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

export function checkContactRateLimit(fingerprint: string) {
  const now = Date.now();
  const current = buckets.get(fingerprint);
  if (!current || now - current.startedAt >= CONTACT_WINDOW_MS) {
    buckets.set(fingerprint, { startedAt: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= CONTACT_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((CONTACT_WINDOW_MS - (now - current.startedAt)) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
