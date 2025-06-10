import express from "express";
import PostControllers from "../Controllers/postControllers.js";
import protectRoute from "../Middlewares/protection.js";
import restrictTo from "../Middlewares/restrictTo.js";

const router = express.Router();

router.get("/all-posts", PostControllers.getPosts);

router.use(protectRoute);
router.get("/single-post/:id", PostControllers.getPost);
router.post("/create-post", PostControllers.createPost);
router.put("/update-post/:id", PostControllers.updatePost);
router.delete(
  "/delete-post/:id",
  restrictTo("admin", "moderator"),
  PostControllers.deletePost
);

export default router;
