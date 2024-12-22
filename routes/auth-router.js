import express from "express";
import {
  currentUser,
  generateOtpCode,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  verificationUser,
} from "../controllers/auth-controller.js";
import { protectedMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", protectedMiddleware, logoutUser);

router.get("/current-user", protectedMiddleware, currentUser);

router.post("/generate-otp-code", protectedMiddleware, generateOtpCode);

router.post("/verification-account", protectedMiddleware, verificationUser);

router.post("/refresh-token", protectedMiddleware, refreshToken);

export default router;
