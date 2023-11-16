const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/questionController");

router.post("/add", questionController.addQuestion);
router.put("/edit", questionController.editQuestion);
router.post("/delete", questionController.deleteQuestion);

module.exports = router;
