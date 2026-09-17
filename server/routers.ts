import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createContactMessage,
  listContactMessages,
  updateContactMessageEmailStatus,
  updateContactMessageStatus,
  createGuestUser,
  createLocalAdmin,
  getUserByEmail,
} from "./db";
import { sendContactNotification } from "./email";
import {
  checkContactRateLimit,
  checkLoginRateLimit,
  getClientFingerprint,
} from "./rateLimit";
import { normalizeUsername, verifyPassword } from "./localAuth";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import type { User } from "../drizzle/schema";

const GUEST_SESSION_MS = 24 * 60 * 60 * 1000;

const localLoginInput = z.object({
  username: z.string().trim().min(3).max(320),
  password: z.string().min(1).max(256),
});

function toAuthUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
  };
}

export const contactInput = z.object({
  name: z.string().trim().min(2).max(150),
  contact: z.string().trim().min(3).max(255),
  service: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    providers: publicProcedure.query(() => ({
      local: Boolean(ENV.adminPasswordHash),
      google: Boolean(ENV.googleClientId && ENV.googleClientSecret),
      facebook: Boolean(ENV.facebookAppId && ENV.facebookAppSecret),
      guest: true,
    })),
    loginLocal: publicProcedure
      .input(localLoginInput)
      .mutation(async ({ input, ctx }) => {
        const limit = checkLoginRateLimit(getClientFingerprint(ctx.req));
        if (!limit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `محاولات كثيرة. حاول بعد ${limit.retryAfterSeconds} ثانية.`,
          });
        }
        if (!ENV.adminPasswordHash) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "المصادقة المحلية غير مفعّلة بعد. أضف ADMIN_PASSWORD_HASH إلى الأسرار.",
          });
        }

        const username = normalizeUsername(input.username);
        let user = await getUserByEmail(username);
        if (!user && username === normalizeUsername(ENV.adminUsername)) {
          user = await createLocalAdmin(username, ENV.adminPasswordHash);
        }
        if (
          !user ||
          user.role !== "admin" ||
          !(await verifyPassword(input.password, user.passwordHash))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "بيانات الدخول غير صحيحة.",
          });
        }

        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || username,
        });
        ctx.res.cookie(COOKIE_NAME, token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, user: toAuthUser(user) };
      }),
    loginGuest: publicProcedure.mutation(async ({ ctx }) => {
      const user = await createGuestUser();
      if (!user)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "تعذر إنشاء جلسة الضيف.",
        });
      const token = await sdk.createSessionToken(user.openId, {
        name: user.name || "Guest User",
      });
      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: GUEST_SESSION_MS,
      });
      return { success: true, user: toAuthUser(user) };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(contactInput)
      .mutation(async ({ input, ctx }) => {
        if (input.website?.trim()) {
          return { success: true, emailStatus: "skipped" as const };
        }

        const fingerprint = getClientFingerprint(ctx.req);
        const limit = checkContactRateLimit(fingerprint);
        if (!limit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `طلبات كثيرة. حاول بعد ${limit.retryAfterSeconds} ثانية.`,
          });
        }

        const created = await createContactMessage({
          name: input.name,
          contact: input.contact,
          service: input.service || null,
          message: input.message,
          ipHash: fingerprint,
          userAgent: ctx.req.get("user-agent")?.slice(0, 255) || null,
          emailStatus: "pending",
        });

        try {
          const result = await sendContactNotification(input);
          const emailStatus = result.sent ? "sent" : "skipped";
          await updateContactMessageEmailStatus(created.id, emailStatus);
          return { success: true, emailStatus } as const;
        } catch (error) {
          console.error("[Contact] Email delivery failed:", error);
          await updateContactMessageEmailStatus(created.id, "failed");
          return { success: true, emailStatus: "failed" as const };
        }
      }),
  }),

  admin: router({
    messages: adminProcedure.query(async () => listContactMessages()),
    updateMessageStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["new", "read", "replied", "archived"]),
        })
      )
      .mutation(({ input }) =>
        updateContactMessageStatus(input.id, input.status)
      ),
  }),
});

export type AppRouter = typeof appRouter;
