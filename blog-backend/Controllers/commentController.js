import validator from "../Middlewares/validator.js";
import AppError from "../Utils/appError.js";
import Comment from "../Models/commentModel.js";
import Post from "../Models/postModel.js";

class CommentControllers {
  async getSingleComment(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid comment ID format", 400));
      }

      const comment = await Comment.findOne({
        _id: commentId,
        post: postId,
      }).populate("user");
      if (!comment) {
        return next(new AppError("comment not found!", 404));
      }

      res.status(200).json({
        status: "success",
        message: "comment fetch successful",
        data: {
          comment,
        },
      });
    } catch (error) {
      return next(new AppError(`Fetch comment failed: ${error.message}`, 500));
    }
  }

  async createComment(req, res, next) {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const userId = req.user._id.toString();

      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      const { error } = validator.createCommentSchema.validate({
        content,
        userId,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const post = await Post.findById(postId);

      if (!post) {
        return next(new AppError("Post not found", 404));
      }
      const newComment = await Comment.create({
        content,
        user: req.user._id,
        post: postId,
      });

      const updatedCommentCount = post.commentCount + 1;
      await Post.findByIdAndUpdate(postId, {
        commentCount: updatedCommentCount,
      });

      await newComment.populate("user", "name email");

      res.status(201).json({
        status: "success",
        message: "comment created successfully",
        data: {
          comment: newComment,
        },
      });
    } catch (error) {
      return next(new AppError(`Create comment failed: ${error.message}`, 500));
    }
  }
  async updateComment(req, res, next) {
    try {
      const { content } = req.body;
      const { postId, commentId } = req.params;
      const userId = req.user._id.toString();

      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid comment ID format", 400));
      }

      const { error } = validator.updateCommentSchema.validate({
        content,
        userId,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const post = await Post.findById(postId);
      if (!post) {
        return next(new AppError("post not found", 404));
      }

      const comment = await Comment.findOne({
        _id: commentId,
        post: postId,
      });
      if (!comment) {
        return next(new AppError("comment not found", 404));
      }
      if (comment.user.toString() !== userId) {
        return next(new AppError("You can only update your own comment!", 403));
      }
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          content,
          isEdited: true,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        data: {
          comment: updatedComment,
        },
      });
    } catch (error) {
      return next(new AppError(`Update comment failed: ${error.message}`, 500));
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user._id.toString();

      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }

      const post = await Post.findById(postId);
      if (!post) {
        return next(new AppError("post not found", 404));
      }
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return next(new AppError("comment not found", 404));
      }

      if (comment.user.toString() !== userId) {
        return next(new AppError("You can only delete your own comment!", 403));
      }
      await Comment.findByIdAndDelete(commentId);
      comment.isDeleted = true;

      const updatedCommentCount = post.commentCount - 1;
      await Post.findByIdAndUpdate(postId, {
        commentCount: updatedCommentCount,
      });

      res.status(204).json({
        status: "success",
        message: "comment deleted!",
      });
    } catch (error) {
      return next(new AppError(`Delete comment failed: ${error.message}`, 500));
    }
  }
}

export default new CommentControllers();
