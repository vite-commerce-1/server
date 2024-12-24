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

  const isFirstAddress = (await Address.countDocuments()) === 0 ? true : false;

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
    defaultAddress: isFirstAddress,
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
    defaultAddress,
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
      defaultAddress,
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

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Cari alamat berdasarkan ID
  const address = await Address.findById(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  // Nonaktifkan defaultAddress lama
  await Address.updateMany(
    { userId: address.userId, defaultAddress: true },
    { $set: { defaultAddress: false } }
  );

  // Set defaultAddress baru
  address.defaultAddress = true;
  await address.save();

  res.status(200).json({
    success: true,
    message: "Default address set successfully",
    data: address,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Cari alamat berdasarkan ID
  const address = await Address.findById(addressId);

  // Jika alamat tidak ditemukan
  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  // Cek apakah address adalah defaultAddress
  if (address.defaultAddress) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete the default address.",
    });
  }

  // Hapus alamat
  await Address.findByIdAndDelete(addressId);

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
