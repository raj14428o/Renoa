const inviteService = require("../services/invite");

async function inviteUserController(req, res) {
  try {
    const { userId } = req.body;

    await inviteService.sendChatInvite(userId);

    res.json({ success: true });
  } catch (err) {
    console.error("Invite error:", err);

    res.status(err.statusCode || 500).json({
      error: err.message || "Failed to send invite",
    });
  }
}

module.exports = {
  inviteUserController,
};
