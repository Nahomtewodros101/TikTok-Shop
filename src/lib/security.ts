import bcrypt from "bcryptjs";

export async function hashSecret(value: string) {
  return bcrypt.hash(value, 12);
}

export async function compareSecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function generateInviteKey(prefix = "INV") {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export function sanitizeText(value: string) {
  return value.trim().replace(/[<>]/g, "");
}
