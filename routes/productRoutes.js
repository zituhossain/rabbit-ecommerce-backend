const express = require("express");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/products
// @desc Create a new product
// @access Private/Admin
router.post(
  "/",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      metarial,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      metarial,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, //Reference to the user who created the product
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  })
);

// @route PUT /api/products/:id
// @desc Update an existing product
// @access Private/Admin
router.put(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      metarial,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    //   Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discountPrice = discountPrice || product.discountPrice;
    product.countInStock = countInStock || product.countInStock;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.sizes = sizes || product.sizes;
    product.colors = colors || product.colors;
    product.collections = collections || product.collections;
    product.metarial = metarial || product.metarial;
    product.gender = gender || product.gender;
    product.images = images || product.images;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isPublished =
      isPublished !== undefined ? isPublished : product.isPublished;
    product.tags = tags || product.tags;
    product.dimensions = dimensions || product.dimensions;
    product.weight = weight || product.weight;
    product.sku = sku || product.sku;

    // Save the updated product
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  })
);

// @route DELETE /api/products/:id
// @desc Delete a product by ID
// @access Private/Admin
router.delete(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    //   Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  })
);

module.exports = router;
