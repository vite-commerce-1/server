import Category from "../models/category.model.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadImagesToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "categories",
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

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  let imageUrl;

  if (req.file) {
    try {
      imageUrl = await uploadImagesToCloudinary(req.file);
      req.body.image = imageUrl;
    } catch (error) {
      res.status(500);
      throw new Error("Failed to upload image");
    }
  }

  const category = await Category.create({ name, image: imageUrl });

  res.status(201).json({
    message: "Category created successfully",
    data: category,
  });
});

export const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.status(200).json({
    message: "All categories",
    data: categories,
  });
});

export const getDetailCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  res.status(200).json({
    message: "Detail category",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let imageUrl;
  let oldImageUrl;

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (req.file) {
    if (category.image) {
      oldImageUrl = category.image;
      const publicId = oldImageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    try {
      imageUrl = await uploadImagesToCloudinary(req.file);
      req.body.image = imageUrl;
    } catch (error) {
      res.status(500);
      throw new Error("Failed to upload image");
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.status(200).json({
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    message: "Category deleted successfully",
  });
});
