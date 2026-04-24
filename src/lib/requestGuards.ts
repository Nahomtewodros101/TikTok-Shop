import { NextResponse } from "next/server";

export function verifySameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return { ok: true };
  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return { ok: false, response: NextResponse.json({ error: "Invalid origin" }, { status: 403 }) };
    }
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Invalid origin header" }, { status: 403 }) };
  }
  return { ok: true };
}

export function requestIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
