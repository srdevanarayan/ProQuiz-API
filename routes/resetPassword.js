const express = require("express");
const router = express.Router();
const resetPasswordController = require("../controllers/resetPasswordController");

router.post("/", resetPasswordController.handlePasswordChange);

module.exports = router;
