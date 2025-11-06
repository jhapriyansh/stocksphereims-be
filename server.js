require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const billRoutes = require("./routes/billRoutes");
const stockRequestRoutes = require("./routes/stockRequestRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

// Get origins from environment variables
const frontendLink = process.env.FRONT_END_LINK;
const allowedOrigins = ["http://localhost:5173", frontendLink];

console.log("🔍 Allowed CORS origins:", allowedOrigins);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to routes if needed
app.set("io", io);

// CORS configuration - SPECIFIC origins (not wildcard with credentials)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/stock-requests", stockRequestRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("📱 Client connected:", socket.id);

  // Listen for barcode scans from mobile
  socket.on("barcode-scanned", (data) => {
    console.log("📊 Barcode received:", data);
    // Broadcast to all connected clients (billing counter)
    io.emit("add-to-cart", data);
  });

  socket.on("disconnect", () => {
    console.log("📱 Client disconnected:", socket.id);
  });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
});
