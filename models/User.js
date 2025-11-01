const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // CRITICAL FIX 1: Use 'return next()' when skipping the hash
  if (!this.isModified("password")) {
    return next();
  }

  // No need for try/catch here since we are using 'asyncHandler' on the controller side,
  // but it's good practice to wrap Mongoose middleware if you want robust error handling.

  if (!this.password) {
    // This should never happen if 'password' is required, but it's a safety net.
    return next(new Error("Password cannot be empty during save."));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // CRITICAL FIX 2: Call next() only after hashing is complete
    next();
  } catch (error) {
    // If hashing fails for any reason, pass the error to Mongoose/Express
    console.error("Bcrypt Hashing/Salt Generation Failed:", error);
    next(error);
  }
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
