import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing"
    },
    amount: Number,
    type: String,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
