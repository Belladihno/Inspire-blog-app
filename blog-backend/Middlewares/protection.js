import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import { promisify } from "util";

class Protection {
  constructor() {
    this.secret = process.env.TOKEN_SECRET;
  }

  protect = async (req, res, next) => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        return this.sendError(res, 401, "Please login to access this resource");
      }

      const decoded = await this.verifyToken(token);
      const currentUser = await this.findUser(decoded.userId);

      if (!currentUser) {
        return this.sendError(res, 401, "User no longer exists");
      }

      if (this.isPasswordChanged(currentUser, decoded.iat)) {
        return this.sendError(
          res,
          401,
          "Password was recently changed. Please login again"
        );
      }

      req.user = currentUser;
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return this.sendError(res, 401, error.message || "Authentication failed");
    }
  };

  extractToken(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  }

  async verifyToken(token) {
    try {
      return await promisify(jwt.verify)(token, this.secret);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      throw new Error("Authentication failed");
    }
  }

  async findUser(userId) {
    return await User.findById(userId);
  }

  isPasswordChanged(user, tokenIssuedAt) {
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      return tokenIssuedAt < changedTimestamp;
    }
    return false;
  }

  sendError(res, statusCode, message) {
    return res.status(statusCode).json({
      status: "fail",
      message,
    });
  }
}

export default new Protection().protect;
