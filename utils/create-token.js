import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const createResToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: refreshToken,
  });

  // Set cookie options
  const cookieOptionToken = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const cookieOptionRefreshToken = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", accessToken, cookieOptionToken);
  res.cookie("refreshToken", refreshToken, cookieOptionRefreshToken);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: user,
  });
};
