const express = require("express");
const router = express.Router();
const answerController = require("../../controllers/answerController");

router.get("/", answerController.getAnswers);
module.exports = router;
