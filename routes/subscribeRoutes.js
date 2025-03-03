const express = require("express");
const Subscriber = require("../models/Subscriber");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// @route POST /api/subscribers
// @desc Add a new subscriber
// @access Public
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if subscriber already exists
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber)
      return res.status(400).json({ message: "Subscriber already exists" });

    subscriber = new Subscriber({ email });
    await subscriber.save();

    res
      .status(201)
      .json({ message: "Successfully subscribed to the newsletter!" });
  })
);

module.exports = router;
