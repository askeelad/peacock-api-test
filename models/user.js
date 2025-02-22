const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscribedCategories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ContentCategory" },
  ],
  isPremium: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);

module.exports = mongoose.model("User", UserSchema);
