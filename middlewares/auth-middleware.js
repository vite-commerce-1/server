import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { asyncHandler } from "./async-handler.js";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
});

export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified && req.user.emailVerifiedAt) {
    next();
  } else {
    res.status(401);
    throw new Error("Please verification first");
  }
});
