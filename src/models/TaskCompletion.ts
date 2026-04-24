import { Schema, model, models } from "mongoose";

const TaskCompletionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    answer: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

TaskCompletionSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export const TaskCompletion = models.TaskCompletion || model("TaskCompletion", TaskCompletionSchema);
