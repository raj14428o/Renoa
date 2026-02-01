const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");

const blogController = require("../controllers/blog");

const requireAuth = (req, res, next) => {
  if (!req.user) return res.redirect("/login");
  next();
};

/* MULTER */
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ROUTES */
router.get("/add-new", requireAuth, blogController.renderAddBlog);
router.post("/", requireAuth, upload.single("coverImage"), blogController.createBlog);

router.post("/comment/:blogId", requireAuth, blogController.addComment);

router.get("/:id/edit", requireAuth, blogController.renderEditPage);
router.post(
  "/:id/edit",
  requireAuth,
  upload.single("coverImage"),
  blogController.updateBlog
);

router.delete("/:id", requireAuth, blogController.deleteBlog);

/* ALWAYS LAST */
router.get("/:id", blogController.viewBlog);

module.exports = router;
