import Post from "../Models/postModel.js"; 

const restrictTo = (...roles) => {
    return async (req, res, next) => {
        const postId = req.params.id;
        if (postId) {
            try {
                const post = await Post.findById(postId);
                if (post && post.userId.toString() === req.user._id.toString()) {
                    return next();
                }
            } catch (error) {
                console.error('Error checking post ownership:', error);
            }
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action"
            });
        }
        next();
    };
};

export default restrictTo;
