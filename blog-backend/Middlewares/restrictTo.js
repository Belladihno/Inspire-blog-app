import Post from "../Models/postModel.js";
import AppError from "../Utils/appError.js";


const checkPostOwnership = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (post && post.user.equals(userId)) {
    return true;
  }
  return false;
};

const hasRequiredRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};


const restrictTo = (...roles) => {
  return async (req, res, next) => {
    const postId = req.params.id;
    const currentUser = req.user;
    
    if (postId) {
      const userOwnsPost = await checkPostOwnership(postId, currentUser._id);
      if (userOwnsPost) {
        return next(); 
      }
    }
    
    if (currentUser.role === "user") {
      return next();
    }
    
    if (!hasRequiredRole(currentUser.role, roles)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    
    next();
  };
};

export default restrictTo;