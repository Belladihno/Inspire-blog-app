import Joi from "joi";

const nameSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "name must contain at least 3 characters",
});

const authorSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "author must contain at least 3 characters",
});

const titleSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "title must contain at least 3 words",
});

const contentSchema = Joi.string().required().trim().max(1000).messages({
  "string-max": "content must not exceed 1000 words",
});

const commentSchema = Joi.string().required().trim().max(1000).messages({
  "string-max": "content must not exceed 1000 words",
});

const VALID_ROLES = ["user", "admin", "editor", "author", "moderator"];

const roleSchema = Joi.string()
  .required()
  .valid(...VALID_ROLES)
  .default("user")
  .messages({
    "any.only":
      "Role must be one of: user, admin, editor, author, or moderator",
    "string.empty": "Role cannot be empty",
  });

const categorySchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .min(3)
  .messages({
    "string-min": "category must contain at least 3 letters",
  });
const usernameSchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .min(3)
  .messages({
    "string-min": "name must contain at least 3 letters",
  });

const emailCodeSchema = Joi.number().required();

// const userIdSchema = Joi.string().required();

const PASSWORD_PATTERN = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
);

const PASSWORD_MESSAGE =
  "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character";

const emailSchema = Joi.string()
  .min(6)
  .max(60)
  .required()
  .email({
    tlds: { allow: ["com", "net"] },
  });

const passwordSchema = Joi.string()
  .required()
  .pattern(PASSWORD_PATTERN)
  .messages({
    "string-pattern-base": PASSWORD_MESSAGE,
  });

const signupSchema = Joi.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.optional(),
});

const loginSchena = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const acceptCodeSchema = Joi.object({
  email: emailSchema,
  emailCode: emailCodeSchema,
});

const updatePasswordSchema = Joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
});

const acceptForgotCodeSchema = Joi.object({
  email: emailSchema,
  emailCode: emailCodeSchema,
  newPassword: passwordSchema,
});

const createPostSchema = Joi.object({
  title: titleSchema,
  content: contentSchema,
  author: authorSchema,
  category: categorySchema,
  // userId: userIdSchema,
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim(),
  content: Joi.string().min(10).max(1000).trim(),
  author: Joi.string().min(3).max(100).trim(),
  category: Joi.string().min(3).max(100).trim(),
  // userId: userIdSchema,
})
  .min(1)
  .message({
    "object.min": "At least one field must be provided",
  });

const updateUserDataSchema = Joi.object({
  name: Joi.string().trim(),
  username: Joi.string().trim(),
  // userId: userIdSchema,
});

const createCommentSchema = Joi.object({
  content: commentSchema,
  // userId: userIdSchema,
});

const updateCommentSchema = Joi.object({
  content: commentSchema,
  // userId: userIdSchema,
});

export default {
  signupSchema,
  loginSchena,
  acceptCodeSchema,
  updatePasswordSchema,
  acceptForgotCodeSchema,
  createPostSchema,
  updatePostSchema,
  updateUserDataSchema,
  createCommentSchema,
  updateCommentSchema,
};
