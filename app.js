import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";

import "express-async-errors";

import { errorHandler, notFoundPath } from "./middlewares/error-handler.js";

import authRouter from "./routes/auth-router.js";
import userRouter from "./routes/user-router.js";
import addressRouter from "./routes/address-router.js";
import categoryRouter from "./routes/category-router.js";
import productRouter from "./routes/product-router.js";
import cartRouter from "./routes/cart-router.js";

dotenv.config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const corsOptions = {
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

connectToMongo();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);

app.use(notFoundPath);
app.use(errorHandler);
