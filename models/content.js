const mongoose = require("mongoose");

const ContentCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sampleArticles: [{ type: String }],
  isPremium: { type: Boolean, default: false },
});

const ContentCategory = mongoose.model(
  "ContentCategory",
  ContentCategorySchema
);

module.exports = { ContentCategory };
