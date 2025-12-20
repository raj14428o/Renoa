const express = require("express");
const router = express.Router();
const User = require("../Models/user");

// Messages list page
router.get("/", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  const user = await User.findById(req.user._id)
    .populate("following", "_id fullName profileImageUrl")
    .lean();

  res.render("messages", {
    following: user.following,   // ✅ IMPORTANT
    user: req.user
  });
});


// Individual chat page
router.get("/:userId", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  const otherUser = await User.findById(req.params.userId)
    .select("_id fullName profileImageUrl")
    .lean();

  if (!otherUser) return res.redirect("/messages");

  res.render("chat", {
    otherUser,
    user: req.user
  });
});

module.exports = router;
