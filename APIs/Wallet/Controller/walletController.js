const Transaction = require("../../Transaction/Model/transactionModel");
const Wallet = require("../Model/walletModel");
const Cart = require("../../Cart/Model/cartModel");
const { default: mongoose } = require("mongoose");

const successResponse = (res, data, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({ message, data });
};
const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  res.status(statusCode).json({ message });
};

//====================== Top Up ========================//

const topUp = async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  try {
    session.startTransaction();
    const { description, amount } = req.body;
    const user = req.user._id;
    console.log("user", user);
    let wallet = await Wallet.findOneAndUpdate(
      { userId: user },
      { $inc: { amount } },
      { new: true },
      { session }
    );
    if (!wallet) {
      return errorResponse(res, 404, "Wallet not found");
    }
    const transaction = new Transaction({
      user: user,
      amount,
      type: "credit",
      description,
    });
    transaction.save();
    console.log("transaction", transaction);
    await session.commitTransaction();
    session.endSession();
    successResponse(
      res,
      { newBalance: wallet.amount },
      200,
      "Your Wallet is Top-up successful"
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error during top-up:", err);
    errorResponse(res, err.messag);
  }
};

//===================== Amount Withdraw From Wallet ======================//

const withdraw = async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId: userId, amount: { $gte: amount } },
      { $inc: { amount: -amount } },
      { new: true }
    );
    if (!wallet) {
      return errorResponse(res, 400, "Insufficient funds or wallet not found");
    }
    const transaction = new Transaction({
      user: userId,
      amount,
      type: "debit",
    });
    transaction.save();
    successResponse(
      res,
      { newBalance: wallet.amount },
      200,
      "Withdrawal successful"
    );
  } catch (err) {
    console.error("Error occurred during withdrawal:", err.message);
    errorResponse(res, 500, "Withdrawal failed");
  }
};

//==================== Transaction =========================//

const makeTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      return errorResponse(res, 404, "Cart not found");
    }
    if (cart.totalAmount <= 0) {
      return errorResponse(
        res,
        400,
        "Total amount is not valid for transaction"
      );
    }
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      return errorResponse(res, 404, "Wallet not found");
    }
    if (wallet.amount < cart.totalAmount) {
      return errorResponse(res, 400, "Insufficient funds");
    }
    wallet.amount -= cart.totalAmount;
    const transaction = new Transaction({
      userId: userId,
      amount: cart.totalAmount,
      description: "Payment for products",
      type: "debit",
    });
    await transaction.save({ session });
    wallet.transactions.push(transaction._id);
    await wallet.save({ session });
    cart.productId = [];
    cart.totalAmount = 0;
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();
    successResponse(res, transaction, 200, "Transaction successful");
  } catch (err) {
    console.error("Error making transaction:", err.message);
    await session.abortTransaction();
    session.endSession();
    errorResponse(res, 500, "Internal Server Error");
  }
};

//=========================== Remaining Balance =======================//

const balance = async (req, res) => {
  const id = req.params.user;
  try {
    const wallet = await Wallet.findOne({ userId: id });
    if (!wallet) {
      return errorResponse(res, 404, "Wallet not found");
    }
    return successResponse(
      res,
      { wallet },
      200,
      "Balance retrieval successful"
    );
  } catch (err) {
    console.error("Error retrieving balance:", err.message);
    return errorResponse(res, 500, "Failed to retrieve balance");
  }
};
//========================== Transaction ==========================//
const transactions = async (req, res) => {
  try {
    console.log("Req", req.user);
    const transactions = await Transaction.find({ user: req.user._id });
    successResponse(
      res,
      { transactions: transactions },
      200,
      "Transactions retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving transactions:", error.message);
    errorResponse(res, 500, "Failed to retrieve transactions");
  }
};
module.exports = {
  topUp,
  withdraw,
  makeTransaction,
  balance,
  transactions,
};
