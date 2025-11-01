const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  getUsers,
  deleteUser,
  changePassword,
  registerNewStaff,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public/Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// CRITICAL FIX: Add 'protect' middleware to verify route
router.get("/verify", protect, verifyToken);

// Admin Management routes (Protected by Admin middleware)
router
  .route("/")
  .get(protect, admin, getUsers) // GET all users
  .post(protect, admin, registerNewStaff); // POST new staff user

router.delete("/:id", protect, admin, deleteUser); // DELETE user

// Change Password route (Protected by general 'protect' middleware)
router.put("/password", protect, changePassword);

module.exports = router;