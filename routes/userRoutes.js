const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Registration logic
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    // jwt payload
    const payload = { user: { id: user._id, role: user.role } };

    // sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        // send the token and user in response
        res.status(200).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  })
);

// @route POST /api/users/login
// @desc Authenticate User
// @access Public
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    // jwt payload
    const payload = { user: { id: user._id, role: user.role } };

    // sign and return the token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;

        // send the token and user in response
        res.json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  })
);

// @route GET /api/users/profile
// @desc GET logged-in user's profile (Protected Route)
// @access Private
router.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

module.exports = router;
