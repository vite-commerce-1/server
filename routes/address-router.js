import express from "express";
import {
  getAllAddresses,
  createAddress,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address-controller.js";
import {
  adminMiddleware,
  protectedMiddleware,
} from "../middlewares/auth-middleware.js";

const router = express.Router();

// Create new address
router.post("/", protectedMiddleware, createAddress);

// Get address by userId
router.get("/userId", protectedMiddleware, getAddressByUserId);

// Update address by addressId
router.put("/:addressId", protectedMiddleware, updateAddress);

router.put("/setDefault/:addressId", protectedMiddleware, setDefaultAddress);

// Delete address by addressId
router.delete("/:addressId", protectedMiddleware, deleteAddress);

// Get all addresses (optional)
router.get("/", protectedMiddleware, adminMiddleware, getAllAddresses);

export default router;
