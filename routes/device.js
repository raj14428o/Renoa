const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/device");

router.get("/public/:userId", deviceController.getPublicKey);
router.post("/register", deviceController.registerDevice);

module.exports = router;