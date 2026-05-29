const express = require("express");
// mergeParams ensures parent route structural IDs (e.g., :id) are accessible inside this nested router extension
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campgrounds");
const Review = require("../models/reviews");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Protected Review Creation: Automatically attaches session account identity to submitted comments
router.post("/", isLoggedIn, validateReview, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id; // Attach active session ID as review writer
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
});

// Protected Review Destruction: Fully guarded against cross-site automated endpoint attacks
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, async (req, res) => {
  const { id, reviewId } = req.params;
  // Use Mongoose $pull atomic operation to purge the target object identifier from the parent collection array
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
});

module.exports = router;
