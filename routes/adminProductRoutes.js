const express = require("express");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/products
// @desc Get all products(Admin only)
// @access Private/Admin
router.get(
  "/",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
  })
);

module.exports = router;
