export function isNonEmptyString(v: unknown, max = 200) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
}

export function isPhone(v: unknown) {
  return typeof v === "string" && /^[0-9+\-()\s]{6,20}$/.test(v.trim());
}

export function isEmail(v: unknown) {
  if (typeof v !== "string" || !v.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isStrongPassword(v: unknown) {
  return typeof v === "string" && v.length >= 8 && v.length <= 100;
}

export function isAmount(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 1000000;
}
