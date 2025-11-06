require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

connectDB();

const app = express();
const server = http.createServer(app);

// Get frontend origin from environment
const frontendLink = process.env.FRONT_END_LINK;

const allowedOrigins = [
  "http://localhost:5173",
  frontendLink,
];

console.log("🔍 Allowed CORS origins:", allowedOrigins);

// CORS configuration - NO wildcard with credentials
const corsOptions = {
  origin: allowedOrigins, // ✅ Specific origins only (no *)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight requests - specific origins only
app.options("*", cors(corsOptions));

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/stock-requests", require("./routes/stockRequestRoutes"));

io.on("connection", (socket) => {
  console.log("📱 Client connected:", socket.id);
  socket.on("barcode-scanned", (data) => {
    console.log("📊 Barcode received:", data);
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
