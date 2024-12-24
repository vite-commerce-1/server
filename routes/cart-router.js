import express from "express";
import { protectedMiddleware } from "../middlewares/auth-middleware.js";
import {
  createOrUpdateCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart-controller.js";

const router = express.Router();

// Route untuk membuat atau memperbarui cart
router.post("/", protectedMiddleware, createOrUpdateCart);

// Route untuk mendapatkan cart pengguna
router.get("/", protectedMiddleware, getCart);

// Route untuk memperbarui item dalam cart
router.put("/item", protectedMiddleware, updateCartItem);

// Route untuk menghapus item dari cart
router.delete("/item/:productId", protectedMiddleware, removeCartItem);

// Route untuk menghapus seluruh cart
router.delete("/", protectedMiddleware, clearCart);

export default router;
