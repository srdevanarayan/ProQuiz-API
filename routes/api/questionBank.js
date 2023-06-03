const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const questionBankController = require("../../controllers/questionBankController");

router.post("/add", questionBankController.addQuestion);
router.put("/rate", questionBankController.rateQuestion);
router.delete("/remove", questionBankController.removeQuestion);
router.put("/report", questionBankController.reportQuestion);
router.get("/questions", questionBankController.getQuestions);
router.get("/categories", questionBankController.getCategories);
router.get("/subcategories", questionBankController.getSubCategories);
router.put("/edit", questionBankController.editQuestion);
router.put(
  "/verify",
  verifyRoles(ROLES_LIST.Expert),
  questionBankController.verifyQuestion
);

module.exports = router;
