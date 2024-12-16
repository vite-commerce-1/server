import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getDetailCategory,
  updateCategory,
} from "../controllers/category-controller.js";
import {
  adminMiddleware,
  protectedMiddleware,
} from "../middlewares/auth-middleware.js";
import { upload } from "../utils/upload-file-handler.js";

const router = express.Router();

router.post(
  "/",
  protectedMiddleware,
  adminMiddleware,
  upload.single("image"),
  createCategory
);

router.get("/", getAllCategory);

router.get("/:id", getDetailCategory);

router.put(
  "/:id",
  protectedMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateCategory
);

router.delete("/:id", protectedMiddleware, adminMiddleware, deleteCategory);

export default router;
