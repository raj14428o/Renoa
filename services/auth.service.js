const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { createTokenForUser } = require("./authentication");

exports.signin = async ({ email, password }, req) => {
  email = email.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not registered");

  const token = await User.matchPassword(email, password);

  if (!user.isEmailVerified) {
    req.session.verifyEmail = user.email;
    req.session.verifyPurpose = "signup";
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return token;
};

exports.signup = async ({ fullName, email, password }, req) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const user = await User.create({
    fullName,
    email,
    password,
    isEmailVerified: false,
  });

  req.session.verifyEmail = user.email;
  req.session.verifyPurpose = "signup";
};

exports.logout = async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { activeSessionId: null });
  }
  req.session.destroy(() => {
    res.clearCookie("token");
    res.redirect("/user/signin");
  });
};
