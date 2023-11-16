const EmailVerification = require("../../model/EmailVerification");
const User = require("../../model/User");
const verify = async (req, res) => {
  //check for valid parameters

  const userEmailOTP = await EmailVerification.findOne({
    user: req.params.user,
  }).exec();
  //check if there is a valid otp generated for the user
  if (!userEmailOTP) {
    return res.status(401).json({
      message: `OTP for user not found: ${req.params.user}. Retry.`,
    });
  }
  //check if otp is valid
  if (userEmailOTP.otp !== req.params.otp)
    return res.status(401).json({
      message: `OTP for user: ${req.params.user} doesn't match. Enter otp again.`,
    });
  await userEmailOTP.deleteOne();
  //check if the user exists in the database
  const foundUser = await User.findOne({ user: req.params.user }).exec();
  if (!foundUser)
    return res.status(401).json({ message: "Cannot find user in database" }); //Unauthorized
  foundUser.status = "verified";
  await foundUser.save();

  res.status(200).json({ message: "Successfully verified user" });
};

module.exports = { verify };
