import { adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Ensure you have this installed

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // 1. Verify the Firebase ID Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: "Email not provided by Google" }, { status: 400 });
    }

    // 2. YOUR LOGIC: Find or Create User in your DB
    // Example: const user = await db.user.upsert({ where: { email }, ... });

    // 3. Issue your system's custom JWT
    const customJwt = jwt.sign(
      { sub: uid, email, name, picture, role: "user" },
      process.env.JWT_SECRET!, // Your existing secret
      { expiresIn: "7d" }
    );

    // 4. Return the JWT to the frontend
    return NextResponse.json({ token: customJwt, user: { name, email, picture } });
  } catch (error: any) {
    console.error("Firebase Admin Error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
