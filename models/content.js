const mongoose = require("mongoose");
const { Schema, model } = require("../db/connection");

const ContentCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sampleArticles: [{ id: { type: String } }],
  isPremium: { type: Boolean, default: false },
});

const ContentCategory = model("ContentCategory", ContentCategorySchema);

module.exports = ContentCategory;
