const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/QuestionController");

router.post("/add", questionController.addQuestion);
router.put("/edit", questionController.editQuestion);
router.delete("/delete", questionController.deleteQuestion);

module.exports = router;
