const express = require("express");
const router = express.Router();
const approveExpertsController = require("../../controllers/authentication/approveExpertsController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router.post(
  "/",
  verifyRoles(ROLES_LIST.admin),
  approveExpertsController.approveExperts
);

module.exports = router;
