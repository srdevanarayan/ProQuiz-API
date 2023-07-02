const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

const questionBankController = require("../../controllers/questionBankController");

router.post("/add", questionBankController.addQuestion);
router.put("/rate", questionBankController.rateQuestion);
router.post("/remove", questionBankController.removeQuestion);
router.put("/report", questionBankController.reportQuestion);
router.post("/questions", questionBankController.getQuestions);
router.get("/categories", questionBankController.getCategories);
router.post("/subcategories", questionBankController.getSubCategories);
router.post(
  "/catandsubcat",
  questionBankController.getCategoriesAndSubCategories
);
router.put("/edit", questionBankController.editQuestion);
router.put(
  "/verify",
  verifyRoles(ROLES_LIST.Expert),
  questionBankController.verifyQuestion
);
router.put(
  "/unverify",
  verifyRoles(ROLES_LIST.Expert),
  questionBankController.unVerifyQuestion
);

module.exports = router;
