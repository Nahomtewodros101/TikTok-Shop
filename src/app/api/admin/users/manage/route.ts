import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { User } from "@/models/User";
import { TaskCompletion } from "@/models/TaskCompletion";
import { Notification } from "@/models/Notification";
import { Transaction } from "@/models/Transaction";
import { SupportMessage } from "@/models/SupportMessage";
import { AuditLog } from "@/models/AuditLog";

type ManageAction = "delete-user" | "delete-all-users" | "clear-user-history" | "clear-all-users-history";

function isValidAction(value: unknown): value is ManageAction {
  return (
    value === "delete-user" ||
    value === "delete-all-users" ||
    value === "clear-user-history" ||
    value === "clear-all-users-history"
  );
}

async function clearHistoryForUserIds(userIds: string[]) {
  await Promise.all([
    TaskCompletion.deleteMany({ userId: { $in: userIds } }),
    Notification.deleteMany({ userId: { $in: userIds } }),
    Transaction.deleteMany({ userId: { $in: userIds } }),
    SupportMessage.deleteMany({ userId: { $in: userIds } }),
    User.updateMany({ _id: { $in: userIds } }, { dailyTaskCompleted: 0 })
  ]);
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json();
  const action = body?.action;
  const userId = typeof body?.userId === "string" ? body.userId : "";

  if (!isValidAction(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectDB();

  if (action === "delete-user") {
    if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    if (userId === guard.session.userId) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    }
    const targetUser = await User.findById(userId);
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    await clearHistoryForUserIds([userId]);
    await User.findByIdAndDelete(userId);
    await AuditLog.create({
      actorUserId: guard.session.userId,
      action: "ADMIN_DELETE_USER",
      targetId: userId,
      details: targetUser.name || ""
    });
    return NextResponse.json({ message: "User removed from database." });
  }

  if (action === "delete-all-users") {
    const usersToDelete = await User.find({ _id: { $ne: guard.session.userId } }).select("_id").lean();
    const userIds = usersToDelete.map((u: any) => String(u._id));
    if (!userIds.length) {
      return NextResponse.json({ message: "No users available to delete." });
    }
    await clearHistoryForUserIds(userIds);
    await User.deleteMany({ _id: { $in: userIds } });
    await AuditLog.create({
      actorUserId: guard.session.userId,
      action: "ADMIN_DELETE_ALL_USERS",
      details: `deleted=${userIds.length}`
    });
    return NextResponse.json({ message: `Deleted ${userIds.length} user(s) from the database.` });
  }

  if (action === "clear-user-history") {
    if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    const targetUser = await User.findById(userId);
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    await clearHistoryForUserIds([userId]);
    await AuditLog.create({
      actorUserId: guard.session.userId,
      action: "ADMIN_CLEAR_USER_HISTORY",
      targetId: userId,
      details: targetUser.name || ""
    });
    return NextResponse.json({ message: "User history cleared." });
  }

  const usersToClear = await User.find({ _id: { $ne: guard.session.userId } }).select("_id").lean();
  const clearIds = usersToClear.map((u: any) => String(u._id));
  if (!clearIds.length) {
    return NextResponse.json({ message: "No user histories available to clear." });
  }
  await clearHistoryForUserIds(clearIds);
  await AuditLog.create({
    actorUserId: guard.session.userId,
    action: "ADMIN_CLEAR_ALL_USERS_HISTORY",
    details: `cleared=${clearIds.length}`
  });
  return NextResponse.json({ message: `Cleared history for ${clearIds.length} user(s).` });
}
