const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cookieConfig = require("../config/cookieConfig");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.cookie("token", token, cookieConfig);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Admin
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Verify user token and return user data
// @route   GET /api/users/verify
// @access  Private
const verifyToken = asyncHandler(async (req, res) => {
  console.log("🔍 [verifyToken] Starting verification...");
  console.log("🔍 [verifyToken] req.user:", req.user);
  console.log("🔍 [verifyToken] req.user._id:", req.user?._id);
  
  if (!req.user) {
    console.error("❌ [verifyToken] req.user is undefined!");
    res.status(401);
    throw new Error("User not authenticated");
  }
  
  // CRITICAL FIX: req.user comes from protect middleware, use req.user._id not req.user.id
  const user = await User.findById(req.user._id).select("-password");
  
  if (user) {
    console.log("✅ [verifyToken] User found:", user._id, user.name);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    console.error("❌ [verifyToken] User not found in database");
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users (for Admin management)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Add a new Staff User (used by Admin)
// @route   POST /api/users
// @access  Private/Admin
const registerNewStaff = asyncHandler(async (req, res) => {
  const { name, adminPassword } = req.body;

  if (!name || !adminPassword) {
    res.status(400);
    throw new Error("Please provide user name and admin password.");
  }

  // Fetch the full admin user with password from database
  const adminUser = await User.findById(req.user._id);
  if (!adminUser || !(await adminUser.matchPassword(adminPassword))) {
    res.status(401);
    throw new Error("Invalid admin password.");
  }

  // Create Staff User
  const sanitizedName = name.toLowerCase().replace(/\s/g, "");
  const email = `${sanitizedName}@stocksphere.com`;
  const defaultPassword = "staff123";

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this name/email.");
  }

  const user = await User.create({
    name,
    email,
    password: defaultPassword,
    role: "staff",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: `User created. Default Password: ${defaultPassword}`,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { adminPassword } = req.body;
  const userIdToDelete = req.params.id;

  // Fetch the full admin user with password from database
  const adminUser = await User.findById(req.user._id);
  if (!adminUser || !(await adminUser.matchPassword(adminPassword))) {
    res.status(401);
    throw new Error("Invalid admin password. Deletion failed.");
  }

  // Prevent Admin from deleting themselves
  if (userIdToDelete === adminUser._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own account via this panel.");
  }

  // Perform Deletion
  const user = await User.findById(userIdToDelete);

  if (user) {
    await User.deleteOne({ _id: userIdToDelete });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  // Fetch the full user with password from database
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters long.");
  }

  // Verify Old Password
  if (!(await user.matchPassword(oldPassword))) {
    res.status(401);
    throw new Error("Invalid old password.");
  }

  // Update Password
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully." });
});

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
  getUsers,
  deleteUser,
  changePassword,
  registerNewStaff,
};