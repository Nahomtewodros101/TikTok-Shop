import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { TaskCompletion } from "@/models/TaskCompletion";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;

  const { completionId } = await req.json();
  if (!isNonEmptyString(completionId)) {
    return NextResponse.json({ error: "Invalid completion id" }, { status: 400 });
  }

  await connectDB();
  const deleted = await TaskCompletion.findOneAndDelete({ _id: completionId, userId: guard.session.userId });
  if (!deleted) return NextResponse.json({ error: "Completed task not found" }, { status: 404 });
  return NextResponse.json({ message: "Completed task removed" });
}
