const express = require("express");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/users
// @desc Get all users(Admin only)
// @access Private/Admin
router.get(
  "/",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

// @route POST /api/admin/users
// @desc Add a new user(Admin only)
// @access Private/Admin
router.post(
  "/",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  })
);

// @route PUT /api/admin/users/:id
// @desc Update user info(Admin only)
// @access Private/Admin
router.put(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    await user.save();
    res.json({ message: "User updated successfully", user });
  })
);

// @route DELETE /api/admin/users/:id
// @desc Delete a user(Admin only)
// @access Private/Admin
router.delete(
  "/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  })
);

module.exports = router;
