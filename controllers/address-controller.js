import { asyncHandler } from "../middlewares/async-handler.js";
import Address from "../models/address.model.js";

// Create new address
export const createAddress = asyncHandler(async (req, res) => {
  const {
    detail,
    subDistrict,
    district,
    city,
    province,
    country,
    postalCode,
    coordinates,
  } = req.body;

  const userId = req.user._id;

  const newAddress = await Address.create({
    userId,
    detail,
    subDistrict,
    district,
    city,
    province,
    country,
    postalCode,
    coordinates,
  });

  res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: newAddress,
  });
});

// Get address by userId
export const getAddressByUserId = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const address = await Address.find({ userId });

  if (!address || address.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No address found for this user",
    });
  }

  res.status(200).json({
    success: true,
    data: address,
  });
});

// Update address by id
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    detail,
    subDistrict,
    district,
    city,
    province,
    country,
    postalCode,
    coordinates,
  } = req.body;

  const updatedAddress = await Address.findByIdAndUpdate(
    addressId,
    {
      detail,
      subDistrict,
      district,
      city,
      province,
      country,
      postalCode,
      coordinates,
    },
    { new: true }
  );

  if (!updatedAddress) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: updatedAddress,
  });
});

// Delete address by id
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findByIdAndDelete(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

// Get all addresses (optional)
export const getAllAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find();

  res.status(200).json({
    success: true,
    data: addresses,
  });
});
