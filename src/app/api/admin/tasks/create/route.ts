import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Task } from "@/models/Task";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isAmount, isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { title, imageUrl, question, type, reward, requiredDeposit } = await req.json();
  if (!isNonEmptyString(title) || !isNonEmptyString(imageUrl) || !isNonEmptyString(question) || (type !== "normal" && type !== "special") || !isAmount(Number(reward))) {
    return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
  }
  await connectDB();
  const task = await Task.create({
    title: title.trim(),
    imageUrl: imageUrl.trim(),
    question: question.trim(),
    type,
    reward: Number(reward),
    requiredDeposit: type === "special" ? Number(requiredDeposit || 0) : 0,
    isActive: true,
    deletedAt: null
  });
  return NextResponse.json({ message: "Task created", task });
}
