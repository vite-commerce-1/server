import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
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
  });
  return Promise.all(uploadPromises);
};

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, type, category } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Product name is required");
  }

  if (!description) {
    res.status(400);
    throw new Error("Product description is required");
  }

  if (!price) {
    res.status(400);
    throw new Error("Product price is required");
  }

  if (!category) {
    res.status(400);
    throw new Error("Product category is required");
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("Product image is required");
  }

  const parsedTypes = type.map((item) => {
    try {
      return JSON.parse(item);
    } catch (error) {
      res.status(400);
      throw new Error(`Invalid type data: ${item}`);
    }
  });

  parsedTypes.forEach((item) => {
    if (!item.key || !Array.isArray(item.values) || item.values.length === 0) {
      res.status(400);
      throw new Error(`Invalid type data for ${item.key}`);
    }
  });

  try {
    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      res.status(400);
      throw new Error("Category not found");
    }

    const categoryId = categoryDoc._id;

    const imagesUrls = await uploadImagesToCloudinary(req.files);

    const productData = {
      name,
      description,
      price,
      type: parsedTypes,
      category: categoryId,
      image: imagesUrls,
    };

    const newProduct = await Product.create(productData);

    await newProduct.populate({
      path: "category",
      select: "name",
    });

    res.status(201).json({
      success: true,
      message: "Product successfully created",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    throw new Error(error.message);
  }
});

export const getAllProduct = asyncHandler(async (req, res) => {
  const products = await Product.find().populate({
    path: "category",
    select: "name",
  });

  if (!products) {
    res.status(401);
    throw new Error("Products not found");
  }

  res.status(200).json({
    message: "All products",
    data: products,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate({
    path: "category",
    select: "name",
  });

  if (!product) {
    res.status(401);
    throw new Error("Product not found");
  }

  res.status(200).json({
    message: "Product found",
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, type, category } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(401).json({ message: "Product not found" });
      throw new Error("Product not found");
    }

    let imageNewUrls = [];

    if (req.files) {
      imageNewUrls = await uploadImagesToCloudinary(req.files);
    }

    // Update fields with new values if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = [...product.image, ...imageNewUrls];

    if (type) {
      // Ensure type is an array of objects, even if it's a single object
      const typeArray = Array.isArray(type) ? type : [type];

      // Parse and validate each item in the 'type' array
      const parsedTypes = typeArray.map((item) => {
        try {
          // Check if the item is a valid object with a key and values
          if (typeof item === "string") {
            item = JSON.parse(item); // Try to parse if it's a string
          }

          // Validate that the item has a key and a values array
          if (
            !item.key ||
            !Array.isArray(item.values) ||
            item.values.length === 0
          ) {
            res.status(400);
            throw new Error(`Invalid type data for ${item.key}`);
          }

          return item; // Return the validated item
        } catch (error) {
          console.error("Error parsing type:", item); // Log the exact item causing the issue
          res.status(400);
          throw new Error(`Invalid type data: ${JSON.stringify(item)}`);
        }
      });

      // Merge the new type data with the old type data
      const existingTypes = product.type || [];

      // Combine existing and new types, avoiding duplicates based on 'key'
      const mergedTypes = [
        ...existingTypes.filter(
          (oldItem) =>
            !parsedTypes.some((newItem) => newItem.key === oldItem.key)
        ),
        ...parsedTypes,
      ];

      product.type = mergedTypes; // Update the product's type with the merged result
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    throw new Error(error.message);
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    message: "Product deleted successfully",
  });
});
