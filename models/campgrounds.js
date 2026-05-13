const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  // 1-to-N relationship. Stores ObjectIDs to keep the parent document within MongoDB's 16MB limit.
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Query Middleware: Cascading Delete
// Hooked to 'findOneAndDelete' to intercept `findByIdAndDelete` calls in app.js
// Uses 'post' to access the document *after* the query executes, ensuring we have the target's reviews array
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Purges any Review document whose ID was stored in the deleted Campground's array
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
