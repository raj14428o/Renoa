const path = require("path");
const fs = require("fs");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const User = require("../models/user");

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete failed:", err);
    });
  }
};

const createBlog = async ({ title, body, description, userId, file }) => {
  if (!file) throw new Error("COVER_IMAGE_REQUIRED");

  return Blog.create({
    title,
    body,
    description,
    createdBy: userId,
    coverImageURL: `/uploads/${file.filename}`,
  });
};

const addComment = async ({ content, blogId, userId }) => {
  const comment = await Comment.create({
    content,
    blogId,
    createdBy: userId,
  });

  const user = await User.findById(userId).select("fullName profileImageUrl");
  return { comment, user };
};

const updateBlog = async ({ blog, body, title, file }) => {
  if (file) {
    const oldImage = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      path.basename(blog.coverImageURL || "")
    );
    safeUnlink(oldImage);
    blog.coverImageURL = `/uploads/${file.filename}`;
  }

  blog.title = title;
  blog.body = body;
  return blog.save();
};

const deleteBlog = async (blog) => {
  const imagePath = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    path.basename(blog.coverImageURL || "")
  );

  safeUnlink(imagePath);
  await Comment.deleteMany({ blogId: blog._id });
  await Blog.findByIdAndDelete(blog._id);
};

module.exports = {
  createBlog,
  addComment,
  updateBlog,
  deleteBlog,
};
