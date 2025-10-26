const Bill = require("../models/Bill");
const Product = require("../models/Product");

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  try {
    const { products, customerName, customerPhone } = req.body;

    // Calculate total and update product quantities
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.product} not found` });
      }
      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient quantity for ${product.name}` });
      }

      total += item.price * item.quantity;
      product.quantity -= item.quantity;
      await product.save();
    }

    const bill = await Bill.create({
      products,
      total,
      generatedBy: req.user._id,
      customerName,
      customerPhone,
    });

    await bill.populate("products.product generatedBy", "name email");
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Admin
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({})
      .populate("products.product generatedBy", "name email")
      .sort("-createdAt");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills by date range
// @route   GET /api/bills/range
// @access  Admin
const getBillsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const bills = await Bill.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("products.product generatedBy", "name email")
      .sort("-createdAt");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillsByDateRange,
};
