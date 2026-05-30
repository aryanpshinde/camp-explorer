const Campground = require("../models/campgrounds");
const Review = require("../models/reviews");

// POST /campgrounds/:id/reviews - Links a structured review validation object to parent collection
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id; // Hard-stamps session owner as review author
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// DELETE /campgrounds/:id/reviews/:reviewId - Unlinks array references and runs target erasure
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // Use atomic array pull logic to completely clean up sub-document mapping traces
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};
