import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import { promisify } from "util";


const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null; 
};


const validateToken = async (token) => {
  const secret = process.env.TOKEN_SECRET;
  const decoded = await promisify(jwt.verify)(token, secret);
  return decoded;
};

const getUser = async (userId) => {
  return await User.findById(userId);
};

// checks if user changed password after token was created
const changedPasswordAfterToken = (user, tokenCreatedTime) => {
  if (user.passwordChangedAt) {
    const passwordChangeTime = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    return tokenCreatedTime < passwordChangeTime;
  }
  return false;
};

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "fail",
    message: message,
  });
};

const protectRoute = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return sendErrorResponse(res, 401, "Please login to access this resource");
    }

    const decodedToken = await validateToken(token);
    const currentUser = await getUser(decodedToken.userId);
    
    if (!currentUser) {
      return sendErrorResponse(res, 401, "User no longer exists");
    }

    if (changedPasswordAfterToken(currentUser, decodedToken.iat)) {
      return sendErrorResponse(res, 401, "Password was recently changed. Please login again");
    }

    req.user = currentUser;
    next(); 
    
  } catch (error) {
    console.error("Auth error:", error.message);
    return sendErrorResponse(res, 401, error.message || "Authentication failed");
  }
}

export default protectRoute;