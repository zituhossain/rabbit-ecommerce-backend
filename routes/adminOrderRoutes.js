const express = require("express");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders(Admin only)
// @access Private/Admin
router.get(
  "/",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  })
);

// @route PUT /api/admin/orders/:id
// @desc Update order status
// @access Private/Admin
router.put(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = req.body.status || order.status;
    order.isDelivered = req.body.status === "Delivered" ? true : false;
    order.deliveredAt =
      req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

    await order.save();
    res.json(order);
  })
);

// @route DELETE /api/admin/orders/:id
// @desc Delete an order(Admin only)
// @access Private/Admin
router.delete(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.json({ message: "Order removed" });
  })
);

module.exports = router;
