import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SCRYPT_PREFIX = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${SCRYPT_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  encoded: string | null | undefined
): Promise<boolean> {
  if (!encoded) return false;
  const [prefix, salt, hash] = encoded.split("$");
  if (prefix !== SCRYPT_PREFIX || !salt || !hash) return false;

  try {
    const expected = Buffer.from(hash, "hex");
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

export function isStrongEnoughPassword(password: string) {
  return password.length >= 12;
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}
