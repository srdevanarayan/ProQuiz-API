const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmailVerificationSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    expires: 180,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmailVerification", EmailVerificationSchema);
