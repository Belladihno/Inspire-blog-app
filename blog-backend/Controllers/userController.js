import User from "../Models/userModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import validator from "../Middlewares/validator.js";
import AppError from "../Utils/appError.js";
import hashing from "../Utils/hashing.js";

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const features = new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const users = await features.query;
      const totalUsers = await User.countDocuments();

      // Check if there are any users
      if (!users || users.length === 0) {
        return next(new AppError("No users found", 404));
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalPages = Math.ceil(totalUsers / limit);

      return res.status(200).json({
        status: "success",
        results: users.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: totalUsers,
          resultsPerPage: limit,
        },
        data: {
          users,
        },
      });
    } catch (error) {
      return next(new AppError(`Fetch users failed: ${error.message}`, 500));
    }
  }
  async updateUserData(req, res, next) {
    try {
      //only allow updates to this fields
      const allowedFields = ["name", "username", "email"];
      const updates = {};

      // Check for invalid fields first
      const invalidFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return next(
          new AppError(
            `Invalid field(s): ${invalidFields.join(
              ", "
            )}. Only ${allowedFields.join(", ")} are allowed.`,
            400
          )
        );
      }

      // filter only allowed fields from request body
      Object.keys(req.body).forEach((field) => {
        if (allowedFields.includes(field)) {
          updates[field] = req.body[field];
        }
      });

      // If no fields is updated
      if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields to update", 400));
      }

      // If email is already taken
      if (updates.email) {
        const existingUserWithEmail = await User.findOne({
          email: updates.email,
          _id: { $ne: req.user._id }, // Exclude current user
        });

        if (existingUserWithEmail) {
          return next(new AppError("email already in use", 400));
        }
      }

      // If username is already taken
      if (updates.username) {
        const existingUserWithUsername = await User.findOne({
          username: updates.username,
          _id: { $ne: req.user._id }, // Exclude current user
        });

        if (existingUserWithUsername) {
          return next(new AppError("username already in use", 400));
        }
      }

      const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        status: "success",
        message: "User data updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return next(new AppError(`Update user failed: ${error.message}`, 500));
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const { error } = validator.updatePasswordSchema.validate({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const userId = req.user._id;

      if (!userId) {
        return next(new AppError("user not authenticated", 401));
      }
      if (!req.user.verified) {
        return next(new AppError("user not verified", 400));
      }
      const existingUser = await User.findById(userId).select("+password");
      const isPassword = await hashing.doHashValidation(
        oldPassword,
        existingUser.password
      );
      if (!isPassword) {
        return next(new AppError("Invalid credentials", 401));
      }
      if (oldPassword === newPassword) {
        return next(
          new AppError("New password must be different from old password", 400)
        );
      }
      if (newPassword !== confirmPassword) {
        return next(new AppError("Password does not match", 400));
      }
      const hashedPassword = await hashing.doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.passwordChangedAt = new Date();
      await existingUser.save();
      // Clear any existing token
      res.clearCookie("Authorization");
      return res.status(200).json({
        success: true,
        message: "Password updated successfully!. Please login again.",
      });
    } catch (error) {
      return next(
        new AppError(`Update password failed: ${error.message}`, 500)
      );
    }
  }

  async deleteUserData(req, res) {
    try {
      await User.findByIdAndUpdate(req.user.id, { select: false });
      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      return next(new AppError(`delete user failed: ${error.message}`, 500));
    }
  }
}

export default new UserController();
