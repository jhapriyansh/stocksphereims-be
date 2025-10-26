const express = require("express");
const router = express.Router();
const {
  createBill,
  getBills,
  getBillsByDateRange,
} = require("../controllers/billController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, createBill).get(protect, admin, getBills);

router.get("/range", protect, admin, getBillsByDateRange);

module.exports = router;
