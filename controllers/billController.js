const Bill = require("../models/Bill");
const Product = require("../models/Product");
// Removed: const mongoose = require("mongoose"); 

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  // Removed: Transaction initialization

  try {
    const { products, customerName, customerPhone } = req.body;
    let total = 0;
    const updates = []; // Array to store updates for batch processing later

    // 1. Pre-check: Verify stock availability for all items first
    for (const item of products) {
        const product = await Product.findById(item.product);

        if (!product) {
            return res.status(404).json({ message: `Product ${item.product} not found.` });
        }
        if (product.quantity < item.quantity) {
            return res.status(400).json({ 
                message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
            });
        }
        total += item.price * item.quantity;
        
        // Store the update logic
        updates.push({
            id: item.product,
            newQuantity: product.quantity - item.quantity,
        });
    }

    // 2. Execute Updates: Update product quantities sequentially
    for (const update of updates) {
        // Use findByIdAndUpdate for a direct, atomic write for that single document
        await Product.findByIdAndUpdate(update.id, { 
            quantity: update.newQuantity 
        });
    }

    // 3. Create the Bill
    const bill = await Bill.create({
      products,
      total,
      generatedBy: req.user._id,
      customerName,
      customerPhone,
    });
    
    // 4. Populate and respond
    await bill.populate("products.product generatedBy", "name email");
    res.status(201).json(bill);

  } catch (error) {
    // No abort needed since we removed transactions
    console.error("Bill creation failed:", error);
    res.status(500).json({ message: error.message || "Failed to create bill due to a server error." });
  }
};

// @desc    Fetch all bills
// @route   GET /api/bills
// @access  Private/Admin
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({})
      .populate("products.product", "name price")
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch bills by date range
// @route   GET /api/bills/range?startDate=...&endDate=...
// @access  Private/Admin
const getBillsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const bills = await Bill.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("products.product", "name price")
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });
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