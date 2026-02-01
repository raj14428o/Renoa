const express = require("express");
const router = express.Router();

const {
  inviteUserController,
} = require("../controllers/invite");

router.post("/invite", inviteUserController);

module.exports = router;
