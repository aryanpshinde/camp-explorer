const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Represents a single review document. Linked to Campgrounds via One-Way Referencing.
const reviewSchema = new Schema({
  body: String,
  rating: Number,
});

module.exports = mongoose.model("Review", reviewSchema);
