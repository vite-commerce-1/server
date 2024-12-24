import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    unique: [true, "Product name is already taken"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
  },
  image: [String],
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
