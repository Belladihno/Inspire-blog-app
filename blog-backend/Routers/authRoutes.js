import express from "express";
import AuthControllers from "../Controllers/authControllers.js";
import protect from "../Middlewares/protection.js";

const router = express.Router();

router.post("/signup", AuthControllers.signup);
router.post("/login", AuthControllers.login);
router.patch(
  "/send-forgot-password-code",
  AuthControllers.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code",
  AuthControllers.verifyForgotPasswordCode
);

router.use(protect);

router.post("/logout", AuthControllers.logout);
router.patch("/send-verification-code", AuthControllers.sendVerificationCode);
router.patch(
  "/verify-verification-code",
  AuthControllers.verifyVerificationCode
);



export default router;
