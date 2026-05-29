const Campground = require("./models/campgrounds");
const Review = require("./models/reviews");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");

// Authentication Guard: Verifies if a user session is active
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Store the URL they were trying to access before being kicked out
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// Post-Login Redirect Relay: Persists session returnTo values into res.locals before Passport resets session IDs
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// Input Validation Middleware: Validates Campground requests payload against the Joi structural rules
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Input Validation Middleware: Validates Review request payload against the Joi structural rules
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Authorization Guard: Verifies if the authenticated session user owns the target Campground document
module.exports.isCampgroundAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Mongoose ObjectIDs cannot be compared using strictly '==='. Mongoose built-in '.equals()' handles deep matching.
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Authorization Guard: Verifies if the authenticated session user owns the target Review document
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params; // 'id' represents parent campground, 'reviewId' represents targeted review
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Cannot find that review!");
    return res.redirect(`/campgrounds/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
