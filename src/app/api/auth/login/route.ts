import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { compareSecret, sanitizeText } from "@/lib/security";
import { setSessionCookie, signSession } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rateLimit";
import { requestIp, verifySameOrigin } from "@/lib/requestGuards";
import { isPhone, isStrongPassword } from "@/lib/validation";

export async function POST(req: Request) {
  const { phone, password } = await req.json();
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const limiter = applyRateLimit(`login:${requestIp(req)}`, 15, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
  if (!isPhone(phone) || !isStrongPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
  }
  await connectDB();
  const user = await User.findOne({ phone: sanitizeText(phone) });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await compareSecret(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = await signSession({ userId: String(user._id), role: user.role, name: user.name });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role: user.role });
}
