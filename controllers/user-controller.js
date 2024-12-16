import { asyncHandler } from "../middlewares/async-handler.js";
import User from "../models/user.model.js";

const uploadImagesToCloudinary = async (files) => {
  const file = files[0];
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "users",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ fetch_format: "webp" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users) {
    res.status(401);
    throw new Error("Users not found");
  }

  res.status(200).json({
    message: "All users",
    data: users,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username, email, phone, address } = req.body;

  let user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let imageUrl = user.image;
  if (req.file) {
    try {
      imageUrl = await uploadImagesToCloudinary(req.file);
    } catch (error) {
      res.status(500);
      throw new Error("Error uploading image to Cloudinary");
    }
  }

  // Update data user
  if (username) user.username = username;
  if (email) {
    if (!validator.isEmail(email)) {
      res.status(400);
      throw new Error("Invalid email format");
    }
    const emailExist = await User.findOne({ email });
    if (emailExist && emailExist._id.toString() !== userId) {
      res.status(400);
      throw new Error("Email is already taken");
    }
    user.email = email;
  }
  if (phone) user.phone = phone;
  if (address) user.address = address;

  user.image = imageUrl;

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {});
