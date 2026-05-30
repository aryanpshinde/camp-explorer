const express = require("express");
const router = express.Router({ mergeParams: true }); // Retains root string parameter data mapping access
const reviews = require("../controllers/reviews"); // Import Reviews Controller
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Protected review document generation entry point
router.post("/", isLoggedIn, validateReview, reviews.createReview);

// Protected review processing and resource purging entry point
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviews.deleteReview);

module.exports = router;
