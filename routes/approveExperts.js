const express = require("express");
const router = express.Router();
const approveExpertsController = require("../controllers/approveExpertsController");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router.post(
  "/",
  verifyRoles(ROLES_LIST.Admin),
  approveExpertsController.approveExperts
);

module.exports = router;
