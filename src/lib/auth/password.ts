import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** A real hash to compare against when the user doesn't exist (constant-ish timing). */
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= bcrypt.hash("lumen-timing-equaliser", ROUNDS);
  await bcrypt.compare(password, await dummyHash).catch(() => false);
}
