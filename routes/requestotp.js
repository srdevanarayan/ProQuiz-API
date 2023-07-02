const express = require("express");
const router = express.Router();
const request = require("../controllers/requestOtpController");

router.post("/:user", request.sendOtp);
router.post("/", (req, res) => {
  if (!req?.params?.user)
    return res.status(400).json({ message: "User required" });
});

module.exports = router;
