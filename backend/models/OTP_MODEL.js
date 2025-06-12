import mongoose from "mongoose";
/**
 * Model for One Time Passwords (OTPs)
 * This model stores the OTPs sent to users and the associated email
 * The createdAt field is automatically set to the current date and time
 * The expires field is set to 600 seconds (10 minutes) after the OTP is created
 * After 10 minutes the OTP is automatically deleted
 */
const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // Automatically gets deleted from DB after 15 minutes
});

const OtpModel = mongoose.model("OTP", OtpSchema);
export default OtpModel;
