const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/add", authMiddleware, cartController.addToCart);
router.get("/my-cart", authMiddleware, cartController.getMyCart);
router.delete("/:cart_id", authMiddleware, cartController.removeFromCart);
router.delete("/", authMiddleware, cartController.clearCart);

module.exports = router;