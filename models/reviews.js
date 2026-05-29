const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Represents a single review document. Linked to Campgrounds via One-Way Referencing.
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  // 1-to-N Relationship: Links each individual review to its specific writer
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
