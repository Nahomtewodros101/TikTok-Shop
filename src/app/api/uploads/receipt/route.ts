import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { requireSession } from "@/lib/guards";
import { verifySameOrigin } from "@/lib/requestGuards";
import { applyRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
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
    const binary = Buffer.from(base64, "base64");
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      const blob = await put(`receipts/${guard.session.userId}/${outName}`, binary, {
        access: "public",
        token: blobToken,
        addRandomSuffix: true,
        contentType: mime
      });
      return NextResponse.json({ url: blob.url, storage: "vercel-blob" });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, outName), binary);
      return NextResponse.json({ url: `/uploads/${outName}` });
    } catch (writeError) {
      // Vercel serverless filesystem is read-only at runtime; keep upload flow working.
      console.error("Receipt file write failed, using data URL fallback", writeError);
      return NextResponse.json({ url: dataUrl, storage: "inline" });
    }
  } catch (error) {
    console.error("Receipt upload failed", error);
    return NextResponse.json({ error: "Could not upload receipt right now. Please try a smaller image." }, { status: 500 });
  }
}
