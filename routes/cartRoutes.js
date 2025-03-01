const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to get the cart for a user or guest
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// @route POST /api/carts
// @desc Add a product to the cart for a guest or logged in user
// @access Public
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { productId, quantity, size, color, userId, guestId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Determine if the user is a guest or authenticated
    let cart = await getCart(userId, guestId);

    // If the cart exists, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId.toString() &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        // if the product already exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // if the product doesn't exist, add it to the cart
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0],
          price: product.price,
          color,
          size,
          quantity,
        });
      }

      //   Recalculate the total price of the cart
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();

      res.status(200).json(cart);
    } else {
      // Create a new cart for the guest or user
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0],
            price: product.price,
            color,
            size,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });

      res.status(201).json(newCart);
    }
  })
);

// @route PUT /api/cart
// @desc Update the quantity of a product in the cart for a guest or logged in user
// @access Public
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const { productId, quantity, size, color, userId, guestId } = req.body;

    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      // update quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); // remove the product
      }

      // Recalculate the total price of the cart
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();

      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  })
);

// @route DELETE /api/cart
// @desc Remove a product from the cart
// @access Public
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const { productId, size, color, userId, guestId } = req.body;

    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1); // remove the product

      // Recalculate the total price of the cart
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();

      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  })
);

// @route GET /api/carts
// @desc Get logged-in user's or guest's cart
// @access Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { userId, guestId } = req.query;

    const cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  })
);

// @route POST /api/carts/merge
// @desc Merge guest's cart with logged-in user's cart
// @access Private
router.post(
  "/merge",
  protect,
  asyncHandler(async (req, res) => {
    const { guestId } = req.body;

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    // if (!guestCart || !userCart) {
    //   return res.status(404).json({ message: "Cart not found" });
    // }

    if (guestCart) {
      if (guestCart.products.length === 0) {
        return res.status(400).json({ message: "Guest cart is empty" });
      }

      if (userCart) {
        // Merge guest's cart into user's cart
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );

          if (productIndex > -1) {
            // if the items exists in the user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            // if the item doesn't exist in the user cart, add it
            userCart.products.push(guestItem);
          }
        });

        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );

        await userCart.save();

        // Delete guest's cart after merging
        await Cart.findOneAndDelete({ guestId });

        res.status(200).json(userCart);
      } else {
        // If the user has no existing cart, assign the guest cart to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();

        res.status(200).json(guestCart);
      }
    } else {
      if (userCart) {
        // Guest cart has already been merged, return the user's cart
        return res.status(200).json(userCart);
      }
      return res.status(404).json({ message: "Guest cart not found" });
    }
  })
);

module.exports = router;
