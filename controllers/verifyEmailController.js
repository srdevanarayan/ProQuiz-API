const EmailVerification = require("../model/EmailVerification");
const User = require("../model/User");
const verify = async (req, res) => {
  const userEmailOTP = await EmailVerification.findOne({
    user: req.params.user,
  }).exec();
  if (!userEmailOTP) {
    return res.status(401).json({
      message: `User not found: ${req.params.user}. Retry.`,
    });
  }
  if (userEmailOTP.otp !== req.params.otp)
    return res.status(401).json({
      message: `OTP for user: ${req.params.user} doesn't match. Enter otp again.`,
    });
  const foundUser = await User.findOne({ user: req.params.user }).exec();
  if (!foundUser)
    return res.status(401).json({ message: "Cannot find user in database" }); //Unauthorized
  foundUser.status = "verified";
  await foundUser.save();
  await userEmailOTP.deleteOne();
  res.status(200).json({ message: "Successfully verified user" });
};

module.exports = { verify };
