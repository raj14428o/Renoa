const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user"); // adjust path

router.post("/invite", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const user = await User.findById(userId).select("email fullName");

    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found" });
    }

    await sendEmail({
      to: user.email,
      subject: "You have a chat invitation",
      text: `Hi ${user.fullName},

Someone wants to chat with you.

Open the app and visit the Messages page to activate chat.

— Blog App`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

module.exports = router;
