const mongoose = require("mongoose");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const blogService = require("../services/blog");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.renderAddBlog = (req, res) => {
  res.render("addBlog", { user: req.user });
};

exports.createBlog = async (req, res) => {
  try {
    const blog = await blogService.createBlog({
      title: req.body.title,
      body: req.body.body,
      description: req.body.description,
      userId: req.user._id,
      file: req.file,
    });

    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    if (err.message === "COVER_IMAGE_REQUIRED") {
      return res.status(400).send("Cover image required");
    }
    console.error(err);
    res.status(500).render("500");
  }
};

exports.addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidId(blogId)) return res.status(404).render("404");
    if (!req.body.content?.trim())
      return res.status(400).send("Empty comment");

    const { comment, user } = await blogService.addComment({
      content: req.body.content,
      blogId,
      userId: req.user._id,
    });

    const io = req.app.get("io");
    io.to(blogId).emit("new-comment", {
      content: comment.content,
      userId: req.user._id,
      userName: user.fullName,
      userAvatar: user.profileImageUrl,
    });

    res.redirect(`/blog/${blogId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("500");
  }
};

exports.renderEditPage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).render("404");

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).render("404");
    if (blog.createdBy.toString() !== req.user._id.toString())
      return res.status(403).send("Unauthorized");

    res.render("edit", { blog });
  } catch (err) {
    console.error(err);
    res.status(500).render("500");
  }
};

exports.updateBlog = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).render("404");

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).render("404");
    if (blog.createdBy.toString() !== req.user._id.toString())
      return res.status(403).send("Unauthorized");

    await blogService.updateBlog({
      blog,
      title: req.body.title,
      body: req.body.body,
      file: req.file,
    });

    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("500");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).render("404");

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).render("404");
    if (blog.createdBy.toString() !== req.user._id.toString())
      return res.status(403).send("Unauthorized");

    await blogService.deleteBlog(blog);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).render("500");
  }
};

exports.viewBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (id.includes(".") || !isValidId(id))
      return res.status(404).render("404");

    const blog = await Blog.findById(id).populate("createdBy").lean();
    if (!blog) return res.status(404).render("404");

    const comments = await Comment.find({ blogId: id })
      .populate("createdBy")
      .sort({ createdAt: -1 })
      .lean();

    res.render("blog", {
      user: req.user || null,
      blog,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("500");
  }
};
