import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js";
import { asyncHandler } from "../middlewares/async-handler.js";

// Create or Update Cart
export const createOrUpdateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validasi jika quantity dan productId ada
  if (!productId || !quantity) {
    res.status(400);
    throw new Error("Product ID and quantity are required");
  }

  // Cari produk berdasarkan ID
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Temukan atau buat cart untuk user
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // Cek apakah produk sudah ada di dalam cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Jika produk ada, update quantity
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].totalPrice =
        cart.items[itemIndex].quantity * product.price;
    } else {
      // Jika produk belum ada di cart, tambahkan produk baru
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        totalPrice: quantity * product.price,
      });
    }

    // Update totalAmount
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    await cart.save();
  } else {
    // Jika cart belum ada, buat cart baru
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity,
          price: product.price,
          totalPrice: quantity * product.price,
        },
      ],
      totalAmount: quantity * product.price,
    });
  }

  res.status(200).json(cart);
});

// Get Cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price"
  );

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  res.status(200).json(cart);
});

// Update Cart Item Quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    res.status(400);
    throw new Error("Product ID and quantity are required");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update quantity and total price
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].totalPrice = quantity * product.price;

  // Update totalAmount
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  await cart.save();

  res.status(200).json(cart);
});

// Remove Item from Cart
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  // Remove item from cart
  cart.items.splice(itemIndex, 1);

  // Update totalAmount
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  await cart.save();

  res.status(200).json(cart);
});

// Clear Cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Hapus semua item dari cart
  cart.items = [];
  cart.totalAmount = 0;

  await cart.save();

  res.status(200).json({ message: "Cart cleared" });
});
