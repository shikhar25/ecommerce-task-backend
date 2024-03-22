const Cart = require("../Model/cartModel");
const Wallet = require("../../Wallet/Model/walletModel");
const Transaction = require("../../Transaction/Model/transactionModel");
const Product = require("../../Product/Model/productModel");

const successResponse = (res, data, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({ message, data });
};
const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  res.status(statusCode).json({ message });
};

//==================== Add Product to Cart =================//

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  try {
    const product = await Product.findById({ _id: productId });
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }
    const totalAmount = product.price * quantity;
    if (product.quantity < quantity) {
      return errorResponse(res, 400, "Not enough quantity available in stock");
    }
    product.quantity -= quantity;
    await product.save();
    let cart = await Cart.findOneAndUpdate(
      { userId: userId, productId: productId },
      {
        userId: userId,
        productId: productId,
        quantity: quantity,
        totalAmount: totalAmount,
      },
      { upsert: true, new: true }
    );
    successResponse(res, cart, 200, "Product added to Cart successfully");
  } catch (err) {
    console.error("Error adding product to cart:", err.message);
    errorResponse(res, 500, "Failed to add product to cart", err.message);
  }
};

//================= Get User Cart Details ================//

const getUserCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.find({ userId: userId });
    if (!cart) {
      return successResponse(res, { cart: [], message: "Your Cart is empty" });
    }
    successResponse(res, { cart });
  } catch (err) {
    console.error("Error retrieving user cart:", err.message);
    errorResponse(res, 500, err.message, "Failed to retrieve user cart");
  }
};

//========================= Remove From Cart =========================//

const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  try {
    const product = await Cart.findOne({ productId, userId });
    if (!product) {
      return next();
    } else {
      await product.remove();
      return res.json("Deleted");
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, "Failed to remove product from cart");
  }
};

//======================== Checkout =========================//

const checkout = async (req, res) => {
  const userId = req.user._id;
  try {
    const cartItems = await Cart.find({ userId: userId });
    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += item.totalAmount;
    });
    let wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      throw new Error("Wallet not found for the user");
    }
    if (wallet.amount < totalAmount) {
      return res.status(400).json({ message: "Insufficient funds in wallet" });
    }
    wallet.amount -= totalAmount;
    await wallet.save();
    const transaction = new Transaction({
      user: userId,
      amount: totalAmount,
      type: "debit",
      description: "Checkout",
      date: new Date(),
    });
    await transaction.save();
    await Cart.deleteMany({ userId: userId });
    return res
      .status(200)
      .json({ message: "Checkout successful", totalAmount: totalAmount });
  } catch (err) {
    console.error("Error during checkout:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to process checkout", error: err.message });
  }
};
module.exports = {
  getUserCart,
  addToCart,
  removeFromCart,
  checkout,
};