import { asyncHandler } from "../middlewares/async-handler.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadImagesToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "users",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ fetch_format: "webp" }],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error); // Log the exact error from Cloudinary
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    res.status(401);
    throw new Error("Users not found");
  }

  res.status(200).json({
    message: "All users fetched successfully",
    data: users,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username, email, phone } = req.body;

  let imageUrl = req.user.image;

  if (req.file) {
    try {
      imageUrl = await uploadImagesToCloudinary(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      username,
      email,
      phone,
      image: imageUrl,
    },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User deleted successfully",
  });
});
