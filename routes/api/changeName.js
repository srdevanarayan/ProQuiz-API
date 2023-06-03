const express = require("express");
const router = express.Router();
const changeNameController = require("../../controllers/changeNameController");

router.post("/", changeNameController.handleNameChange);

module.exports = router;
