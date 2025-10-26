const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const StockRequest = require("../models/StockRequest");
const Bill = require("../models/Bill");
const connectDB = require("../config/db");

// Helper function to generate random dates within a range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const products = [
  {
    name: "HP Pavilion 15-inch Laptop",
    description: "Intel Core i5, 8GB RAM, 512GB SSD, Windows 11",
    price: 799.99,
    quantity: 30,
    category: "Laptops",
    minStockLevel: 5,
  },
  {
    name: "Dell XPS 13",
    description: "Intel Core i7, 16GB RAM, 1TB SSD, Windows 11 Pro",
    price: 1299.99,
    quantity: 20,
    category: "Laptops",
    minStockLevel: 4,
  },
  {
    name: "Logitech MX Master 3",
    description: "Advanced Wireless Mouse with Ultrafast Scrolling",
    price: 99.99,
    quantity: 50,
    category: "Accessories",
    minStockLevel: 10,
  },
  {
    name: "Keychron K2 Mechanical Keyboard",
    description: "Wireless Mechanical Keyboard with Brown Switches",
    price: 89.99,
    quantity: 40,
    category: "Accessories",
    minStockLevel: 8,
  },
  {
    name: "LG 27-inch 4K Monitor",
    description: '27" UHD (3840 x 2160) IPS Display',
    price: 449.99,
    quantity: 25,
    category: "Monitors",
    minStockLevel: 5,
  },
  {
    name: "Samsung 32-inch Curved Monitor",
    description: '32" WQHD (2560 x 1440) VA Curved Display',
    price: 329.99,
    quantity: 20,
    category: "Monitors",
    minStockLevel: 4,
  },
  {
    name: "Logitech C920x HD Webcam",
    description: "1080p HD Webcam with Dual Microphones",
    price: 69.99,
    quantity: 35,
    category: "Accessories",
    minStockLevel: 7,
  },
  {
    name: "Sony WH-1000XM4",
    description: "Wireless Noise-Cancelling Headphones",
    price: 349.99,
    quantity: 30,
    category: "Audio",
    minStockLevel: 6,
  },
  {
    name: "Apple AirPods Pro",
    description: "Active Noise Cancellation Wireless Earbuds",
    price: 249.99,
    quantity: 45,
    category: "Audio",
    minStockLevel: 8,
  },
  {
    name: "Seagate 2TB External HDD",
    description: "Portable External Hard Drive USB 3.0",
    price: 79.99,
    quantity: 40,
    category: "Storage",
    minStockLevel: 8,
  },
];

const stockRequests = [
  {
    product: null, // Will be set after products are created
    quantity: 15,
    status: "pending",
    requestedBy: null, // Will be set after users are created
    remarks: "Stock running low, need immediate replenishment",
  },
  {
    product: null,
    quantity: 10,
    status: "approved",
    requestedBy: null,
    remarks: "Regular stock replenishment",
  },
  {
    product: null,
    quantity: 20,
    status: "pending",
    requestedBy: null,
    remarks: "Preparing for holiday season demand",
  },
];

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await StockRequest.deleteMany({});
    await Bill.deleteMany({});

    // Create users with proper roles
    const admin = await User.create({
      name: "System Administrator",
      email: "admin@stocksphere.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const staffMembers = await User.create([
      {
        name: "John Smith",
        email: "john@stocksphere.com",
        password: "staff123",
        role: "staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Wilson",
        email: "sarah@stocksphere.com",
        password: "staff123",
        role: "staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create products with timestamps
    const createdProducts = await Product.insertMany(
      products.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log("✅ Products seeded successfully");

    // Create realistic stock requests over the past month
    const stockRequestsToCreate = [];
    const pastMonth = new Date();
    pastMonth.setMonth(pastMonth.getMonth() - 1);

    // Generate multiple stock requests for different products
    for (let product of createdProducts) {
      if (product.quantity < product.minStockLevel * 2) {
        stockRequestsToCreate.push({
          product: product._id,
          quantity: product.minStockLevel * 3,
          status: "approved",
          requestedBy: staffMembers[0]._id,
          remarks: `Low stock replenishment for ${product.name}`,
          createdAt: randomDate(pastMonth, new Date()),
          updatedAt: new Date(),
        });
      }
    }

    // Add some pending requests
    stockRequestsToCreate.push({
      product: createdProducts[0]._id,
      quantity: 10,
      status: "pending",
      requestedBy: staffMembers[1]._id,
      remarks: "Anticipating increased demand",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await StockRequest.insertMany(stockRequestsToCreate);
    console.log("✅ Stock requests seeded successfully");

    // Create bills with proper validation and product quantity updates
    const billsToCreate = [];
    const pastThreeMonths = new Date();
    pastThreeMonths.setMonth(pastThreeMonths.getMonth() - 3);

    // Create 20 sample bills over the past 3 months
    for (let i = 0; i < 20; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per bill
      const items = [];
      let total = 0;

      for (let j = 0; j < numItems; j++) {
        const randomProduct =
          createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity per item

        // Skip if not enough quantity available
        if (randomProduct.quantity < quantity) continue;

        items.push({
          product: randomProduct._id,
          quantity: quantity,
          priceAtSale: randomProduct.price,
        });

        total += randomProduct.price * quantity;

        // Update product quantity
        randomProduct.quantity -= quantity;
        await randomProduct.save();
      }

      if (items.length > 0) {
        // Generate a random customer name
        const customerNames = [
          "John Doe",
          "Jane Smith",
          "Robert Johnson",
          "Mary Williams",
          "David Brown",
          "Linda Davis",
          "Michael Wilson",
          "Sarah Taylor",
          "James Anderson",
          "Patricia Thomas",
        ];

        billsToCreate.push({
          items,
          total,
          customerName:
            customerNames[Math.floor(Math.random() * customerNames.length)],
          generatedBy:
            staffMembers[Math.floor(Math.random() * staffMembers.length)]._id,
          createdAt: randomDate(pastThreeMonths, new Date()),
          updatedAt: new Date(),
        });
      }
    }

    await Bill.insertMany(billsToCreate);
    console.log("✅ Bills seeded successfully");

    console.log("✅ Database seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin - email: admin@stocksphere.com, password: admin123");
    console.log("Staff - email: john@stocksphere.com, password: staff123");
    console.log("Staff - email: sarah@stocksphere.com, password: staff123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
