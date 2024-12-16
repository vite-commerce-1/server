import express from "express";
import {
  getAllAddresses,
  createAddress,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
} from "../controllers/address-controller.js";
import { protectedMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Create new address
router.post("/", protectedMiddleware, createAddress);

// Get address by userId
router.get("/userId", protectedMiddleware, getAddressByUserId);

// Update address by addressId
router.put("/:addressId", updateAddress);

// Delete address by addressId
router.delete("/:addressId", deleteAddress);

// Get all addresses (optional)
router.get("/", getAllAddresses);

export default router;
