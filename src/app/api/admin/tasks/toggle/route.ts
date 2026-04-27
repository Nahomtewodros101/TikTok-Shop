import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Task } from "@/models/Task";
import { verifySameOrigin } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { taskId, isActive } = await req.json();
  await connectDB();
  await Task.findOneAndUpdate({ _id: taskId, deletedAt: null }, { isActive: Boolean(isActive) });
  return NextResponse.json({ message: "Task updated" });
}
