import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdrawal", "special-proof"], required: true },
    amount: { type: Number, required: true },
    walletAddress: { type: String, required: true },
    screenshotUrl: { type: String, default: "" },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
  },
  { timestamps: true }
);

export const Transaction = models.Transaction || model("Transaction", TransactionSchema);
