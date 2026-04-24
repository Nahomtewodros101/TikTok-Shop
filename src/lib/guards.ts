import { NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireSession() {
  const s = await getSession();
  if (!s) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { session: s };
}

export async function requireAdmin() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.session.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return result;
}
