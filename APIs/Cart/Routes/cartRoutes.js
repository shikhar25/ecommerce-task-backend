const express = require("express");
const router = express.Router();
const cartController = require("../Controller/cartController");
const auth = require("../../../config/authJwt");
router.post("/addToCart", auth, cartController.addToCart);
router.get("/getUserCart/:userId", auth, cartController.getUserCart);
router.get("/checkout", auth, cartController.checkout);
router.delete(
  "/removeFromCart/:productId",
  auth,
  cartController.removeFromCart
);
module.exports = router;
