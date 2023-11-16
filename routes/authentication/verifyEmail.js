const express = require("express");
const router = express.Router();
const verifyEmailController = require("../../controllers/authentication/verifyEmailController");

router.post("/", (req, res) => {
  if (!req?.params?.user)
    return res.status(400).json({ message: "User and otp required" });
});
router.post("/:user", (req, res) => {
  if (!req?.params?.otp)
    return res.status(400).json({ message: "User and otp required" });
});
router.post("/:user/:otp", verifyEmailController.verify);

module.exports = router;
