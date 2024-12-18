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

  let parsedTypes = [];
  if (type) {
    try {
      if (typeof type === "string") {
        const parsed = JSON.parse(type);
        parsedTypes = Array.isArray(parsed) ? parsed : [parsed];
      } else if (typeof type === "object" && !Array.isArray(type)) {
        parsedTypes = [type]; // Jika object tunggal, bungkus jadi array
      } else if (Array.isArray(type)) {
        parsedTypes = type; // Jika sudah array, gunakan langsung
      } else {
        throw new Error(
          "Invalid type format. Expected JSON string, object, or array."
        );
      }
    } catch (error) {
      console.log("Failed to parse type:", type);
      res.status(400).json({
        message: `Failed to parse type. Ensure it is a valid JSON string, object, or array. Error: ${error.message}`,
      });
      return;
    }

    // Validasi elemen-elemen dalam `parsedTypes` jika ada
    parsedTypes.forEach((item, index) => {
      if (
        !item.key ||
        !Array.isArray(item.values) ||
        item.values.length === 0
      ) {
        res.status(400);
        throw new Error(
          `Invalid type data at index ${index}: ${JSON.stringify(item)}`
        );
      }
    });
  }

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
      type: parsedTypes, // type bisa berupa array kosong atau sesuai data yang dikirim
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
  const { page, limit, name, category } = req.query;

  const query = {};

  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category; // Jika category adalah ID, gunakan langsung
    } else {
      const categoryDoc = await Category.findOne({
        name: { $regex: category, $options: "i" }, // Pencarian kategori berdasarkan nama
      });

      if (categoryDoc) {
        query.category = categoryDoc._id; // Menggunakan ID kategori
      } else {
        return res.status(404).json({
          success: false,
          message: `Category with name '${category}' not found.`,
        });
      }
    }
  }

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  let productsQuery = Product.find(query).skip(skip).limit(limitNumber);

  const totalProduct = await Product.countDocuments(query);

  if (pageNumber > Math.ceil(totalProduct / limitNumber)) {
    return res.status(404).json({
      success: false,
      message: "This page does not exist.",
    });
  }

  productsQuery = await productsQuery.populate({
    path: "category",
    select: "name",
  });

  if (!productsQuery || productsQuery.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No products found",
    });
  }

  const totalPages = Math.ceil(totalProduct / limitNumber);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: productsQuery,
    pagination: {
      totalProduct,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    },
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
    // Mencari produk berdasarkan ID
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      throw new Error("Product not found");
    }

    // Validasi field yang diperlukan
    if (!name && !description && !price && !category && !type) {
      res.status(400);
      throw new Error(
        "At least one field (name, description, price, type, or category) must be provided to update"
      );
    }

    // Validasi category (jika dikirimkan)
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        res.status(400);
        throw new Error("Category not found");
      }
      product.category = categoryDoc._id; // Update category jika ada perubahan
    }

    // Mengelola gambar baru jika ada
    let imageNewUrls = [];
    if (req.files) {
      imageNewUrls = await uploadImagesToCloudinary(req.files);
      product.image = [...product.image, ...imageNewUrls]; // Menambahkan gambar baru
    }

    // Memperbarui field yang disediakan dalam request body
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;

    // Mengelola tipe produk (type)
    if (type) {
      // Menangani dan memvalidasi type yang dikirimkan (array, string, atau object)
      let parsedTypes = [];
      try {
        if (typeof type === "string") {
          const parsed = JSON.parse(type);
          parsedTypes = Array.isArray(parsed) ? parsed : [parsed];
        } else if (typeof type === "object" && !Array.isArray(type)) {
          parsedTypes = [type]; // Jika objek tunggal, bungkus ke dalam array
        } else if (Array.isArray(type)) {
          parsedTypes = type; // Jika sudah array, gunakan langsung
        } else {
          throw new Error(
            "Invalid type format. Expected JSON string, object, or array."
          );
        }

        // Validasi elemen dalam parsedTypes
        parsedTypes.forEach((item, index) => {
          if (
            !item.key ||
            !Array.isArray(item.values) ||
            item.values.length === 0
          ) {
            res.status(400);
            throw new Error(
              `Invalid type data at index ${index}: ${JSON.stringify(item)}`
            );
          }
        });

        // Menggabungkan type baru dengan type yang lama, menghindari duplikat berdasarkan key
        const existingTypes = product.type || [];
        const mergedTypes = [
          ...existingTypes.filter(
            (oldItem) =>
              !parsedTypes.some((newItem) => newItem.key === oldItem.key)
          ),
          ...parsedTypes,
        ];
        product.type = mergedTypes; // Update type produk
      } catch (error) {
        res
          .status(400)
          .json({ message: `Failed to parse type: ${error.message}` });
        return;
      }
    }

    // Menyimpan perubahan produk
    const updatedProduct = await product.save();

    // Mengembalikan response sukses
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    // Menangani error umum
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
