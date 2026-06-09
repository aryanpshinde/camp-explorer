const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
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
  },
  opts,
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <div class="p-2" style="min-width: 150px;">
      <strong class="d-block mb-1">
        <a href="/campgrounds/${this._id}" class="text-decoration-none text-dark">
          ${this.title}
        </a>
      </strong>
      <small class="text-muted d-block">${this.description.substring(0, 40)}...</small>
    </div>`;
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
