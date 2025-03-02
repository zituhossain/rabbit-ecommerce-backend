const express = require("express");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc Get logged in user orders
// @access Private
router.get(
  "/my-orders",
  protect,
  asyncHandler(async (req, res) => {
    // Find all orders for the logged in user
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    }); // Sort by creation date in descending order

    res.json(orders);
  })
);

// @route GET /api/orders/:id
// @desc Get order details by ID
// @access Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the order by ID
    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Return the order details
    res.json(order);
  })
);

module.exports = router;
