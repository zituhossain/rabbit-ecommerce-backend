const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

// Function to seed the database
const seedData = async () => {
  try {
    // clear existing data
    await Product.deleteMany();
    await User.deleteMany();

    // create a default admin user
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    });

    // Assign the default admin user to all products
    const userId = createdUser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: userId };
    });

    // Insert the sample products into the database
    await Product.insertMany(sampleProducts);

    console.log("Data seeded successfully");
    process.exit(1);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
