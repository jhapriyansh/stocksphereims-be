const mongoose = require("mongoose");
// script is in backend/scripts, models and config are in parent folder
const User = require("../models/User");
const connectDB = require("../config/db");

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: "admin@stocksphere.com" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    const admin = await User.create({
      name: "Admin",
      email: "admin@stocksphere.com",
      password: "admin123",
      role: "admin",
    });

    console.log("Admin user created:", admin);
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdminUser();
