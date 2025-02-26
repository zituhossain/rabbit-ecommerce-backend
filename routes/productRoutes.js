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

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      collection,
      category,
      material,
      brand,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      limit,
    } = req.query;

    let query = {};

    // Filter logic
    if (collection && collection.toLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }
    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting logic
    let sort = {};

    if (sortBy) {
      if (sortBy === "priceAsc") {
        sort.price = 1;
      } else if (sortBy === "priceDesc") {
        sort.price = -1;
      } else if (sortBy === "popularity") {
        sort.rating = -1;
      }
    }

    // Fetch products and apply sorting and limit
    let products = await Product.find(query).sort(sort).limit(limit);

    res.json(products);
  })
);

// @route GET /api/products/best-seller
//@desc Retrieve the product with highest rating
// @access Public
router.get(
  "/best-seller",
  asyncHandler(async (req, res) => {
    const bestSeller = await Product.findOne().sort({ rating: -1 });

    if (!bestSeller) {
      return res.status(404).json({ message: "No best seller found" });
    }

    res.json(bestSeller);
  })
);

// @route GET /api/products/new-arrivals
// @desc Retrieve the latest 8 products - creation date
// @access Public
router.get(
  "/new-arrivals",
  asyncHandler(async (req, res) => {
    // Fetch the latest 8 products based on creation date
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);

    res.json(newArrivals);
  })
);

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  })
);

// @route GET /api/products/similar/:id
// @desc Get similar products based on category and gender
// @access Public
router.get(
  "/similar/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      gender: product.gender,
    }).limit(4);

    res.json(similarProducts);
  })
);

module.exports = router;
