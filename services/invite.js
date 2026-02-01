const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

async function sendChatInvite(userId) {
  if (!userId) {
    const error = new Error("userId required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("email fullName");

  if (!user || !user.email) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await sendEmail({
    to: user.email,
    subject: "You have a chat invitation",
    text: `Hi ${user.fullName},

Someone wants to chat with you.

Open the app and visit the Messages page to activate chat.

— Blog App`,
  });

  return true;
}

module.exports = {
  sendChatInvite,
};
