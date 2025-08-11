import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    workorder: { type: mongoose.Schema.Types.ObjectId, ref: "Workorder", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    currency: { type: String, default: "usd" },
    amountCents: { type: Number, required: true },
    applicationFeeCents: { type: Number, required: true },
    destinationAccountId: { type: String, required: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    status: { type: String, enum: [
      "requires_payment_method",
      "requires_confirmation",
      "processing",
      "succeeded",
      "canceled",
      "requires_action",
      "requires_capture",
      "payment_failed"
    ], default: "requires_payment_method" },
    events: [
      {
        type: { type: String },
        at: { type: Date, default: Date.now },
        payload: { type: Object },
      }
    ]
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);


