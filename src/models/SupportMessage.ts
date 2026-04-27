import { Schema, model, models } from "mongoose";

const SupportMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    message: { type: String, required: true },
    autoReply: { type: String, required: true },
    deletedByAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SupportMessage = models.SupportMessage || model("SupportMessage", SupportMessageSchema);
