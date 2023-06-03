const EmailVerification = require("../model/EmailVerification");
const User = require("../model/User");
const nodemailer = require("nodemailer");
const sendOtp = async (req, res) => {
  const foundUser = await User.findOne({ user: req.params.user }).exec();
  if (!foundUser) return res.status(401).json({ message: "User not found" });
  if (foundUser.status === "verified" && !req.body.pwdchange)
    return res.status(422).json({ message: "User already verified" });
  const foundOtpRequest = await EmailVerification.findOne({
    user: req.params.user,
  }).exec();
  if (foundOtpRequest)
    return res
      .status(400)
      .json({
        message: "OTP already requested. Wait for 3 mins before trying again",
      });
  try {
    await EmailVerification.deleteMany({ user: req.params.user });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

  const otp = Math.floor(Math.random() * (100000 - 999999 + 1) + 999999);
  const text = req.body.pwdchange
    ? `OTP for verifying your account is ${otp}. This is only valid for 3 minutes.`
    : `OTP for resetting your password is ${otp}. This is only valid for 3 minutes.`;
  try {
    const result = await EmailVerification.create({
      user: req.params.user,
      otp: otp,
    });
  } catch (err) {
    res.status(500).json(err);
    console.error(err);
  }

  try {
    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_SMTP_KEY,
      },
      from: "srdevcode@gmail.com",
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "ProQuiz srdevcode@gmail.com", // sender address
      to: foundUser.user, // list of receivers
      subject: "OTP Verification", // subject line
      text: text,
    });
    res.status(201).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json(err);
    console.error(err);
  }
};
module.exports = { sendOtp };
