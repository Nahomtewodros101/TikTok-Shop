import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireSession } from "@/lib/guards";
import { verifySameOrigin } from "@/lib/requestGuards";
import { applyRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const limiter = applyRateLimit(`upload:${guard.session.userId}`, 20, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Too many uploads" }, { status: 429 });

  const { dataUrl, fileName } = await req.json();
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image payload" }, { status: 400 });
  }
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
  const mime = match[1];
  const base64 = match[2];
  const ext = mime.includes("png") ? "png" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "webp";
  const safeName = String(fileName || "receipt").replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50);
  const outName = `${Date.now()}-${safeName}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, outName), Buffer.from(base64, "base64"));

  return NextResponse.json({ url: `/uploads/${outName}` });
}
