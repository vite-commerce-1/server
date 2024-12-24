import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  detail: {
    type: String,
    required: false, // Stores additional details such as house number, street name, etc.
  },
  subDistrict: {
    type: String,
    required: false, // Name of the kelurahan (sub-district)
  },
  district: {
    type: String,
    required: false, // Name of the kecamatan (district)
  },
  city: {
    type: String,
    required: false, // Name of the city
  },
  province: {
    type: String,
    required: false, // Name of the province
  },
  country: {
    type: String,
    required: false, // Country name (e.g., Indonesia)
    default: "Indonesia", // Default country is Indonesia
  },
  postalCode: {
    type: String,
    required: false, // Postal code
  },
  defaultAddress: {
    type: Boolean,
    default: false,
  },
  coordinates: {
    type: {
      latitude: {
        type: Number,
        required: true, // Latitude coordinate
      },
      longitude: {
        type: Number,
        required: true, // Longitude coordinate
      },
    },
    required: false, // Koordinat geografis
  },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
