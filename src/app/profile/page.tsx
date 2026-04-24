import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { ProfileForm } from "./profileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await connectDB();
  const user = await User.findById(session.userId).lean();
  const notifications = await Notification.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(20).lean();

  return (
    <main className="container grid two" style={{ marginTop: 24 }}>
      <div className="card">
        <h2>Profile</h2>
        <ProfileForm user={JSON.parse(JSON.stringify(user))} />
      </div>
      <div className="card">
        <h3>Notifications</h3>
        {notifications.map((n) => (
          <p key={String(n._id)}>{n.message}</p>
        ))}
      </div>
    </main>
  );
}
