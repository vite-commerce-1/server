import mongoose from "mongoose";

const { Schema } = mongoose;

const cartSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Mengacu ke schema User, jika sistem menggunakan autentikasi pengguna
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Mengacu ke schema Product
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
        default: function () {
          return this.quantity * this.price;
        },
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: function () {
      return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre("save", function (next) {
  // Update totalAmount when cart is saved or modified
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
