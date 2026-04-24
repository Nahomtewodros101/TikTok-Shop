import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    withdrawalPasswordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    inviteKey: { type: String, required: true, unique: true },
    walletAddress: { type: String, default: "" },
    balance: { type: Number, default: 10 },
    dailyTaskCompleted: { type: Number, default: 0 },
    taskWindowStart: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
