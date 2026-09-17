import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createContactMessage,
  listContactMessages,
  updateContactMessageEmailStatus,
  updateContactMessageStatus,
} from "./db";
import { sendContactNotification } from "./email";
import { checkContactRateLimit, getClientFingerprint } from "./rateLimit";

const contactInput = z.object({
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
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure.input(contactInput).mutation(async ({ input, ctx }) => {
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
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "read", "replied", "archived"]) }))
      .mutation(({ input }) => updateContactMessageStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
