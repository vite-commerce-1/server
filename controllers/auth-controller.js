import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/async-handler.js";
import { Otp } from "../models/otp.model.js";
import User from "../models/user.model.js";
import { createResToken, generateRefreshToken } from "../utils/create-token.js";
import { sendEmail } from "../utils/send-email.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    throw new Error("Username is required");
  }

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    throw new Error("Email is required");
  }

  if (!password) {
    res.status(400).json({ message: "Password is required" });
    throw new Error("Password is required");
  }

  if (!phone) {
    res.status(400).json({ message: "Phone is required" });
    throw new Error("Phone is required");
  }

  const isFirstUser = (await User.countDocuments()) === 0 ? "admin" : "user";

  const user = await User.create({
    username,
    email,
    password,
    phone,
    role: isFirstUser,
  });

  const otpData = await user.generateOtpCode();

  await sendEmail({
    to: user.email,
    subject: "Register success",
    html: `
    <html>
      <head>
        <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8">
      </head>
      <body style=3D"font-family: sans-serif;">
        <div style=3D"display: block; margin: auto; max-width: 600px;" class=3D"main">
          <h1 style=3D"font-size: 18px; font-weight: bold; margin-top: 20px">Congrats ${user.username} have been registered</h1>
          <p>Please use OTP Code below for verified account, OTP Code will be expires in 5 minutes.</p>
          <p style="text-align:center;background-color:yellow;font-weight:bold;font-size:24px;">${otpData.otpCode}</p>
        </div>
      </body>
    </html>
`,
  });

  createResToken(user, 201, res);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new Error("Email is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email unregistered");
  }

  if (!(await user.comparePassword(password))) {
    throw new Error("Incorrect password");
  }

  createResToken(user, 200, res);
});

export const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (user) {
    res.status(200).json({
      data: user,
    });
  } else {
    res.status(401);
    throw new Error("User not found");
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expire: new Date(Date.now()),
  });

  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null,
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    expire: new Date(Date.now()),
  });

  res.status(200).json({
    message: "Logout Success",
  });
});

export const generateOtpCode = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  const otpData = await currentUser.generateOtpCode();

  await sendEmail({
    to: currentUser.email,
    subject: "Generate OTP Code",
    html: `
    <html>
      <head>
        <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8">
      </head>
      <body style=3D"font-family: sans-serif;">
        <div style=3D"display: block; margin: auto; max-width: 600px;" class=3D"main">
          <h1 style=3D"font-size: 18px; font-weight: bold; margin-top: 20px">Congrats ${currentUser.username} success get new OTP Code</h1>
          <p>Please use OTP Code below for verified account.</p>
          <p style="text-align:center;background-color:yellow;font-weight:bold;font-size:24px;">${otpData.otpCode}</p>
          <p>OTP Code will be expires in 5 minutes from now.</p>
        </div>
      </body>
    </html>
`,
  });

  res.status(201).json({
    message: "Generate OTP Code success please check your email",
  });
});

export const verificationUser = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error("Otp is required");
  }

  const otp_code = await Otp.findOne({
    otpCode: otp,
    user: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!otp_code) {
    res.status(400);
    throw new Error("OTP Code not found or wrong");
  }

  const userData = await User.findById(req.user._id);

  await User.findOneAndUpdate(userData._id, {
    isVerified: true,
    emailVerifiedAt: Date.now(),
  });

  await Otp.deleteOne({ _id: otp_code._id });

  return res.status(200).json({
    message: "Verification account success",
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token is unavailable");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_TOKEN_REFRESH_SECRET,
    (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Invalid refresh token");
      }

      const newToken = generateRefreshToken(decoded.id);
      createResToken(user, 200, res);
    }
  );
});
