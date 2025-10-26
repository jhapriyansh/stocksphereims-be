const StockRequest = require("../models/StockRequest");

// @desc    Create stock request
// @route   POST /api/stock-requests
// @access  Private
const createStockRequest = async (req, res) => {
  try {
    const { product, quantity, remarks } = req.body;
    const stockRequest = await StockRequest.create({
      product,
      quantity,
      remarks,
      requestedBy: req.user._id,
    });

    await stockRequest.populate("product requestedBy", "name email");
    res.status(201).json(stockRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all stock requests
// @route   GET /api/stock-requests
// @access  Admin
const getStockRequests = async (req, res) => {
  try {
    const stockRequests = await StockRequest.find({})
      .populate("product requestedBy", "name email")
      .sort("-createdAt");
    res.json(stockRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update stock request status
// @route   PUT /api/stock-requests/:id
// @access  Admin
const updateStockRequest = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const stockRequest = await StockRequest.findById(req.params.id);

    if (stockRequest) {
      stockRequest.status = status;
      if (remarks) stockRequest.remarks = remarks;

      const updatedRequest = await stockRequest.save();
      await updatedRequest.populate("product requestedBy", "name email");
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: "Stock request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStockRequest,
  getStockRequests,
  updateStockRequest,
};
