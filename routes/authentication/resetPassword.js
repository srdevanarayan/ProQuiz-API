const express = require("express");
const router = express.Router();
const resetPasswordController = require("../../controllers/authentication/resetPasswordController");

router.post("/", resetPasswordController.handlePasswordChange);

module.exports = router;
