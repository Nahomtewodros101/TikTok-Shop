import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("tts_session")?.value;
  const { pathname } = req.nextUrl;
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/profile");
  if (needsAuth && !token) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"]
};
