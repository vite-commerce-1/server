import express from "express";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/auth-middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  updateProduct,
} from "../controllers/product-controller.js";
import { upload } from "../utils/upload-file-handler.js";

const router = express.Router();

router.post(
  "/",
  protectedMiddleware,
  adminMiddleware,
  upload.array("image", 5),
  createProduct
);

router.get("/", getAllProduct);

router.get("/:id", getProductById);

router.put(
  "/:id",
  protectedMiddleware,
  adminMiddleware,
  upload.array("image", 5),
  updateProduct
);

router.delete("/:id", protectedMiddleware, adminMiddleware, deleteProduct);

export default router;
