import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    targetId: { type: String, default: "" },
    details: { type: String, default: "" }
  },
  { timestamps: true }
);

export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
