const mongoose = require("mongoose");
const { Schema, model } = require("../db/connection");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  salt: { type: Buffer, required: true },
  subscribedCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContentCategory",
      default: [], // Default to an empty array
    },
  ],
  isPremium: { type: Boolean, default: false },
});

const User = model("User", UserSchema);

module.exports = User;
