import mongoose from "mongoose";

const { Schema } = mongoose;

const otpSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  otpCode: {
    type: String,
    required: [true, "Otp code is required"],
  },
  validUntil: {
    type: Date,
    required: true,
    expires: 300,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
