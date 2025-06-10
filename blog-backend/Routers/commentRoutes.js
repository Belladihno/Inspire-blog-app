import express from "express";
import CommentController from "../Controllers/commentController.js";
import protectRoute from "../Middlewares/protection.js";
import restrictTo from "../Middlewares/restrictTo.js";

const router = express.Router();
router.use(protectRoute);
router.get("/:postId/get-comment/:commentId", CommentController.getSingleComment);
router.post(
  "/:postId/create-comment",
  restrictTo("user"),
  CommentController.createComment
);
router.put(
  "/:postId/update-comment/:commentId",
  restrictTo("user"),
  CommentController.updateComment
);
router.delete(
  "/:postId/delete-comment/:commentId",
  restrictTo("user"),
  CommentController.deleteComment
);

export default router;
