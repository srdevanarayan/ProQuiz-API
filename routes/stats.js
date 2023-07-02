const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

router.post("/", statsController.getStats);

module.exports = router;
