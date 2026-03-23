const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["sde1", "sde2", "sde3", "pm"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
