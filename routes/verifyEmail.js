const express = require("express");
const router = express.Router();
const verifyEmailController = require("../controllers/verifyEmailController");

router.post("/:user/:otp", verifyEmailController.verify);
router.post("/", (req, res) => {
  if (!req?.params?.user || !req?.params?.otp)
    return res.status(400).json({ message: "User and otp required" });
});

module.exports = router;
