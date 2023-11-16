const EmailVerification = require("../model/EmailVerification");
const User = require("../model/User");
const bcrypt = require("bcrypt");

const handlePasswordChange = async (req, res) => {
  const { user, otp, pwd } = req.body;
  if (!user || !otp || !pwd)
    return res
      .status(400)
      .json({ message: "User, otp and password are required." });

  const userEmailOTP = await EmailVerification.findOne({
    user: user,
  }).exec();
  if (!userEmailOTP) {
    return res.status(401).json({
      message: `User not found: ${user}. Retry.`,
    });
  }
  //console.log(userEmailOTP.user);
  //console.log(userEmailOTP.otp);
  if (userEmailOTP.otp !== otp)
    return res.status(401).json({
      message: `OTP for user: ${user} doesn't match.`,
    });
  const foundUser = await User.findOne({ user: user }).exec();
  if (!foundUser)
    return res.status(401).json({ message: "Cannot find user in database" }); //Unauthorized
  const hashedPwd = await bcrypt.hash(pwd, 10);
  foundUser.password = hashedPwd;
  await foundUser.save();
  await userEmailOTP.deleteOne();
  res.status(200).json({ message: "Successfully changed password" });
};

module.exports = { handlePasswordChange };
