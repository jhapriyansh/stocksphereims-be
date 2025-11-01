const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      console.log("🔐 [Middleware] Token found in Authorization header");
      token = req.headers.authorization.split(" ")[1];
      console.log("🔐 [Middleware] Token:", token.substring(0, 20) + "...");
      
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      console.log("✅ [Middleware] Token decoded successfully. User ID:", decoded.id);
      
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.error("❌ [Middleware] User not found in database for ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }
      
      console.log("✅ [Middleware] User loaded:", req.user._id, req.user.name);
      return next();
    } catch (error) {
      console.error("❌ [Middleware] Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  
  // Check for token in cookies
  if (req.cookies && req.cookies.token) {
    try {
      console.log("🍪 [Middleware] Token found in cookies");
      token = req.cookies.token;
      console.log("🍪 [Middleware] Token:", token.substring(0, 20) + "...");
      
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      console.log("✅ [Middleware] Cookie token decoded successfully. User ID:", decoded.id);
      
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.error("❌ [Middleware] User not found in database for ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }
      
      console.log("✅ [Middleware] User loaded from cookie:", req.user._id, req.user.name);
      return next();
    } catch (error) {
      console.error("❌ [Middleware] Cookie token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  
  console.error("❌ [Middleware] No token found in headers or cookies");
  return res.status(401).json({ message: "Not authorized, no token" });
};

const admin = (req, res, next) => {
  console.log("👮 [Admin Middleware] Checking admin access for:", req.user?.name, "Role:", req.user?.role);
  
  if (req.user && req.user.role === "admin") {
    console.log("✅ [Admin Middleware] Admin access granted");
    return next();
  } else {
    console.error("❌ [Admin Middleware] Access denied. User role:", req.user?.role);
    return res.status(401).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };