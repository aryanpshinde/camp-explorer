const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  price: Number,
  description: String,
  location: String,
  // 1-to-N Relationship: Links campgrounds to their specific creator
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // 1-to-N relationship. Stores ObjectIDs to keep the parent document within MongoDB's 16MB limit.
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Query Middleware: Cascading Delete
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
