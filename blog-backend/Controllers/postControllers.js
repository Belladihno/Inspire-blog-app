import Post from "../Models/postModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import validator from "../Middlewares/validator.js";
import AppError from "../Utils/appError.js";

class PostControllers {
  async getPosts(req, res, next) {
    try {
      const features = new APIFeatures(Post.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const posts = await features.query.populate("author", "name email");
      const count = await Post.countDocuments();

      // Check if there are any users
      if (!posts || posts.length === 0) {
        return next(new AppError("No posts found!", 400));
      }

      const totalPages = Math.ceil(count / features.query.limit || 10);
      const currentPage = parseInt(req.query.page, 10) || 1;
      res.status(200).json({
        status: "success",
        results: posts.length,
        totalPages,
        currentPage,
        data: posts,
      });
    } catch (error) {
      return next(new AppError(`Get posts failed: ${error.message}`, 500));
    }
  }

  async getPost(req, res, next) {
    try {
      const postId = req.params.id;
      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      const post = await Post.findById(postId).populate({
        path: "userId",
        select: "email",
      });
      if (!post) {
        return next(new AppError("Post not found", 404));
      }
      return res.status(200).json({
        status: "success",
        message: "Post fetched successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      return next(new AppError(`Fetch post failed: ${error.message}`, 500));
    }
  }

  async createPost(req, res, next) {
    try {
      const { title, content, author, category } = req.body;
      const userId = req.user._id.toString();
      const { error } = validator.createPostSchema.validate({
        title,
        content,
        author,
        category,
        userId,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const post = await Post.create({
        title,
        content,
        author,
        category,
        userId: req.user._id,
      });
      return res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      return next(new AppError(`Create post failed: ${error.message}`, 500));
    }
  }

  async updatePost(req, res, next) {
    try {
      const { title, content, author, category } = req.body;
      const { userId } = req.user;
      const postId = req.params.id;
      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }
      const existingPost = await Post.findById(postId);
      if (!existingPost) {
        return next(new AppError("Post not found", 404));
      }
      if (existingPost.userId.toString() !== userId) {
        return next(new AppError("Unauthorized", 403));
      }
      const { error } = validator.updatePostSchema.validate({
        title,
        content,
        author,
        category,
        userId,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const post = await Post.findByIdAndUpdate(
        postId,
        { title, content, author, category },
        {
          new: true,
          runValidators: true,
        }
      ).populate({
        path: "userId",
        select: "email",
      });
      return res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        data: {
          post,
        },
      });
    } catch (error) {
      return next(new AppError(`Update post failed: ${error.message}`, 500));
    }
  }

  async deletePost(req, res, next) {
    try {
      // checks if user data is in the token
      if (!req.user || !req.user._id) {
        return next(new AppError("Authentication required!", 401));
      }

      const postId = req.params.id;
      // checks postId format
      if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid post ID format", 400));
      }

      const post = await Post.findById(postId);
      //checks if post exists
      if (!post) {
        return next(new AppError("Post does not exist", 404));
      }

      // Get user details from token
      const { _id: userId, role } = req.user;

      const isAdmin = role === "admin";
      const isModerator = role === "moderator";
      const isPostOwner = post.userId.toString() === userId.toString();

      // Checks authorization
      if (isAdmin || isModerator || isPostOwner) {
        await Post.findByIdAndDelete(postId);
        return res.status(200).json({
          status: "success",
          message: "Post deleted successfully",
        });
      }

      return next(new AppError("Not authorized to delete this post", 403));
    } catch (error) {
      return next(new AppError(`Delete post failed: ${error.message}`, 500));
    }
  }
}

export default new PostControllers();
