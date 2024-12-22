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
    type: [Number], // Array untuk longitude dan latitude [longitude, latitude]
    required: false, // Koordinat geografis
    validate: {
      validator: function (value) {
        // Validasi untuk memastikan array berisi dua angka (longitude, latitude)
        return (
          value &&
          value.length === 2 &&
          typeof value[0] === "number" &&
          typeof value[1] === "number"
        );
      },
      message:
        "Coordinates must be an array with two numbers [longitude, latitude].",
    },
  },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
