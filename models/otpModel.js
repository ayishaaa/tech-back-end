const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required:true,
  },
   otp: String,
   createdAt: {
    type: Date,
    default: Date.now, 
  },
});

const otp = new mongoose.model("OTP", otpSchema);
module.exports = otp;