import User from "../Models/userModel.js";
import validator from "../Middlewares/validator.js";
import hashing from "../Utils/hashing.js";
import jwt from "jsonwebtoken";
import emailService from "../Utils/emailService.js";
import AppError from "../Utils/appError.js";

const signToken = (id, email) => {
  return jwt.sign(
    {
      userId: id,
      email,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

class AuthControllers {
  async signup(req, res, next) {
    try {
      const { email, password, name, username, role } = req.body;
      const { error } = validator.signupSchema.validate({
        email,
        password,
        name,
        username,
        role,
      });

      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new AppError("User already exists", 409));
      }
      const hashedPassword = await hashing.doHash(password, 12);
      const newUser = await User.create({
        email,
        password: hashedPassword,
        name,
        username,
        role: role || "user",
      });

      const token = signToken(newUser._id, newUser.email);
      res.cookie("Authorization", `Bearer ${token}`, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      const userWithoutPassword = { ...newUser.toObject() };
      delete userWithoutPassword.password;
      return res.status(201).json({
        status: "success",
        message: "Account created successfully!",
        token,
        data: userWithoutPassword,
      });
    } catch (error) {
      return next(
        new AppError(`Account creation failed: ${error.message}`, 500)
      );
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { error } = validator.loginSchena.validate({
        email,
        password,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const existingUser = await User.findOne({ email }).select("+password");

      if (
        !existingUser ||
        !(await hashing.doHashValidation(password, existingUser.password))
      ) {
        return next(new AppError("Invalid email or password!!", 401));
      }

      const token = signToken(existingUser._id, existingUser.email);
      res.cookie("Authorization", `Bearer ${token}`, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      const userWithoutPassword = { ...existingUser.toObject() };
      delete userWithoutPassword.password;

      res.status(200).json({
        status: "success",
        message: "Login successful",
        token,
        data: userWithoutPassword,
      });
    } catch (error) {
      return next(new AppError(`Log in failed: ${error.message}`, 500));
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("Authorization").status(200).json({
        status: "success",
        message: "Log out successful",
      });
    } catch (error) {
      return next(new AppError(`Log out failed: ${error.message}`, 500));
    }
  }

  async sendVerificationCode(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(new AppError("user does not exists!!", 404));
      }
      if (existingUser.verified) {
        return next(new AppError("User already verified", 409));
      }
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      let info = await emailService.sendEmail(
        email,
        "Email Verification",
        `<h1>Verify Your Email</h1>
       <p>Your verification code is: <strong>${emailCode}</strong></p>
       <p>This code will expire in 5 minutes.</p>`
      );
      if (info.accepted[0] === existingUser.email) {
        const hashedEmailCode = hashing.hmacProcess(
          emailCode,
          process.env.HMAC_VerIFICATION_CODE_SECRET
        );
        existingUser.verificationCode = hashedEmailCode;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({
          status: "success",
          message: "Code sent",
        });
      }
      return next(new AppError("Code sent failed", 400));
    } catch (error) {
      return next(
        new AppError(`Verification code send failed: ${error.message}`, 500)
      );
    }
  }
  async verifyVerificationCode(req, res, next) {
    try {
      const { email, emailCode } = req.body;
      const { error } = validator.acceptCodeSchema.validate({
        email,
        emailCode,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const codeValue = emailCode.toString();
      const existingUser = await User.findOne({ email }).select(
        "+verificationCode +verificationCodeValidation"
      );
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      if (existingUser.verified) {
        return next(new AppError("user already verified", 409));
      }
      if (
        !existingUser.verificationCode ||
        !existingUser.verificationCodeValidation
      ) {
        return next(
          new AppError("Please request a new verification code", 400)
        );
      }
      if (
        Date.now() - existingUser.verificationCodeValidation >
        5 * 60 * 1000
      ) {
        return next(
          new AppError(
            "Verification code has expired. Please request a new one",
            400
          )
        );
      }
      const hashedEmailCode = hashing.hmacProcess(
        codeValue,
        process.env.HMAC_VerIFICATION_CODE_SECRET
      );
      if (hashedEmailCode === existingUser.verificationCode) {
        existingUser.verified = true;
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeValidation = undefined;
        await existingUser.save();
        return res.status(200).json({
          status: "success",
          message: "Your acount has been verified",
        });
      }
      return next(new AppError("unexpected error occured!", 400));
    } catch (error) {
      return next(new AppError(`Verification failed: ${error.message}`, 500));
    }
  }

  async sendForgotPasswordCode(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      let info = await emailService.sendEmail(
        email,
        "Password Reset Code",
        `<h1>Password Reset</h1>
       <p>Your password reset code is: <strong>${emailCode}</strong></p>
       <p>This code will expire in 5 minutes.</p>
       <p>If you didn't request this, please ignore this email.</p>
       `
      );
      if (info.accepted[0] === existingUser.email) {
        const hashedEmailCode = hashing.hmacProcess(
          emailCode,
          process.env.HMAC_VerIFICATION_CODE_SECRET
        );
        existingUser.forgotPasswordCode = hashedEmailCode;
        existingUser.forgotPasswordCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({
          status: "success",
          message: "Code sent",
        });
      }
      return next(new AppError("code send failed", 400));
    } catch (error) {
      return next(
        new AppError(`Forgot password code send failed: ${error.message}`, 500)
      );
    }
  }

  async verifyForgotPasswordCode(req, res, next) {
    try {
      const { email, emailCode, newPassword } = req.body;
      const { error } = validator.acceptForgotCodeSchema.validate({
        email,
        emailCode,
        newPassword,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const codeValue = emailCode.toString();
      const existingUser = await User.findOne({ email }).select(
        "+forgotPasswordCode +forgotPasswordCodeValidation"
      );
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      if (
        !existingUser.forgotPasswordCode ||
        !existingUser.forgotPasswordCodeValidation
      ) {
        return next(
          new AppError("verification code not found or expired!", 400)
        );
      }
      if (
        Date.now() - existingUser.forgotPasswordCodeValidation >
        5 * 60 * 1000
      ) {
        return next(new AppError("code validation expired", 400));
      }
      const hashedEmailCode = hashing.hmacProcess(
        codeValue,
        process.env.HMAC_VerIFICATION_CODE_SECRET
      );
      if (hashedEmailCode === existingUser.forgotPasswordCode) {
        const hashedPassword = await hashing.doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        existingUser.forgotPasswordCode = undefined;
        existingUser.forgotPasswordCodeValidation = undefined;
        await existingUser.save();
        return res.status(200).json({
          status: "success",
          message: "Password updated!",
        });
      }
      return next(new AppError("unexpected error occured", 400));
    } catch (error) {
      return next(
        new AppError(
          `Verify forgot password code failed: ${error.message}`,
          500
        )
      );
    }
  }
}

export default new AuthControllers();
