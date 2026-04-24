import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";

export async function POST() {
  await connectDB();
  const count = await Task.countDocuments();
  if (count > 0) return NextResponse.json({ message: "Tasks already seeded" });
  await Task.insertMany([
    {
      title: "Boost order click #1",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      question: "What is the main product theme shown in this image?",
      type: "normal",
      reward: 1,
      requiredDeposit: 0,
      isActive: true
    },
    {
      title: "Boost order click #2",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      question: "Which color is most dominant in the product display?",
      type: "normal",
      reward: 2,
      requiredDeposit: 0,
      isActive: true
    },
    {
      title: "Special promo task #1",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      question: "Name one item you can identify in this promo image.",
      type: "special",
      reward: 8,
      requiredDeposit: 20,
      isActive: true
    }
  ]);
  return NextResponse.json({ message: "Tasks seeded" });
}
