const followService = require("../services/follow");

exports.toggleFollow = async (req, res) => {
  try {
    const result = await followService.toggleFollow(
      req.user._id.toString(),
      req.params.id
    );

    res.json({ success: true, ...result });
  } catch (err) {
    if (err.message === "SELF_FOLLOW") {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Toggle follow error:", err);
    res.status(500).json({ success: false });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const users = await followService.getFollowers(
      req.params.id,
      req.user._id.toString()
    );

    res.json({ success: true, users });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false });
    }

    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const users = await followService.getFollowing(
      req.params.id,
      req.user._id.toString()
    );

    res.json({ success: true, users });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false });
    }

    console.error(err);
    res.status(500).json({ success: false });
  }
};



