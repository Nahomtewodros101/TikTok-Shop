import { Schema, model, models } from "mongoose";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: String, enum: ["normal", "special"], default: "normal" },
    reward: { type: Number, required: true },
    requiredDeposit: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Task = models.Task || model("Task", TaskSchema);
