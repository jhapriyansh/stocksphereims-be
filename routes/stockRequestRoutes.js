const express = require("express");
const router = express.Router();
const {
  createStockRequest,
  getStockRequests,
  updateStockRequest,
} = require("../controllers/stockRequestController");
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, createStockRequest)
  .get(protect, admin, getStockRequests);

router.put("/:id", protect, admin, updateStockRequest);

module.exports = router;
