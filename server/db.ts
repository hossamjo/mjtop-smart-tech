import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { ContactMessage, contactMessages, InsertContactMessage, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createLocalAdmin(email: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  const openId = `local:${email}`;
  await db.insert(users).values({
    openId,
    name: "MjTop Administrator",
    email,
    loginMethod: "local",
    authProvider: "local",
    passwordHash,
    role: "admin",
  });
  return getUserByOpenId(openId);
}

export async function createGuestUser() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const openId = `guest:${randomUUID()}`;
  await db.insert(users).values({
    openId,
    name: "Guest User",
    email: null,
    loginMethod: "guest",
    authProvider: "guest",
    role: "user",
  });
  return getUserByOpenId(openId);
}

export async function createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");

  const result = await db.insert(contactMessages).values(message).$returningId();
  const created = await db.select().from(contactMessages).where(eq(contactMessages.id, result[0].id)).limit(1);
  if (!created[0]) throw new Error("Failed to create contact message");
  return created[0];
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function updateContactMessageStatus(id: number, status: ContactMessage["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  const updated = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return updated[0];
}

export async function updateContactMessageEmailStatus(id: number, emailStatus: ContactMessage["emailStatus"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contactMessages).set({ emailStatus }).where(eq(contactMessages.id, id));
}
