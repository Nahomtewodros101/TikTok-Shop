import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generateInviteKey, hashSecret, sanitizeText } from "@/lib/security";
import { setSessionCookie, signSession } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rateLimit";
import { isEmail, isPhone, isStrongPassword, isNonEmptyString } from "@/lib/validation";
import { requestIp, verifySameOrigin } from "@/lib/requestGuards";
import { sendEmail } from "@/lib/mailer";

function classifyAuthError(error: unknown) {
  if (!(error instanceof Error)) return null;
  const message = error.message.toLowerCase();
  if (message.includes("missing mongodb_uri")) {
    return {
      status: 503,
      error: "Server configuration is incomplete. Please set MONGODB_URI in deployment environment variables."
    };
  }
  if (
    message.includes("mongoose") ||
    message.includes("mongodb") ||
    message.includes("econnrefused") ||
    message.includes("timed out")
  ) {
    return {
      status: 503,
      error: "Database connection failed. Please try again shortly."
    };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const origin = verifySameOrigin(req);
    if (!origin.ok) return origin.response;
    const limiter = applyRateLimit(`signup:${requestIp(req)}`, 10, 60_000);
    if (!limiter.ok) return NextResponse.json({ error: "Too many signup attempts" }, { status: 429 });
    const body = await req.json();
    const { name, phone, email, password, confirmPassword, withdrawalPassword, confirmWithdrawalPassword, invitationKey } = body;
    if (!isNonEmptyString(name) || !isPhone(phone) || !isStrongPassword(password) || !isStrongPassword(withdrawalPassword) || !isNonEmptyString(invitationKey)) {
      return NextResponse.json({ error: "Missing required fields or weak passwords" }, { status: 400 });
    }
    if (email && !isEmail(email)) return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    if (password !== confirmPassword || withdrawalPassword !== confirmWithdrawalPassword) {
      return NextResponse.json({ error: "Password confirmation mismatch" }, { status: 400 });
    }

    await connectDB();
    const sanitizedInvitationKey = sanitizeText(invitationKey);
    const inviter = await User.findOne({ inviteKey: sanitizedInvitationKey });
    if (!inviter) {
      return NextResponse.json({ error: "This invitation key is invalid, expired, or has already been used." }, { status: 400 });
    }

    const exists = await User.findOne({ phone: sanitizeText(phone) });
    if (exists) return NextResponse.json({ error: "Phone already exists" }, { status: 400 });

    const user = await User.create({
      name: sanitizeText(name),
      phone: sanitizeText(phone),
      email: sanitizeText(email || ""),
      passwordHash: await hashSecret(password),
      withdrawalPasswordHash: await hashSecret(withdrawalPassword),
      role: "user",
      invitedBy: inviter._id,
      inviteKey: generateInviteKey("INV"),
      balance: 10
    });

    inviter.balance += 10;
    inviter.inviteKey = generateInviteKey("INV");
    await inviter.save();

    const token = await signSession({ userId: String(user._id), role: "user", name: user.name });
    await setSessionCookie(token);
    if (user.email) {
      try {
        await sendEmail(
          user.email,
          "Account created successfully",
          "Your account has been created and your welcome balance was added. You can now start completing tasks."
        );
      } catch (mailError) {
        // Mail delivery should not block successful account creation.
        console.error("Signup email failed", mailError);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup failed", error);
    const classified = classifyAuthError(error);
    if (classified) {
      return NextResponse.json({ error: classified.error }, { status: classified.status });
    }
    return NextResponse.json({ error: "Could not create account. The invitation key may be invalid, expired, or already used." }, { status: 500 });
  }
}
