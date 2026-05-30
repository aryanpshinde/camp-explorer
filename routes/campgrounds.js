const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds"); // Import Campgrounds Controller
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
} = require("../middleware");

// Grouping endpoints targeted at the root endpoint collection path ('/')
router
  .route("/")
  .get(campgrounds.index)
  .post(isLoggedIn, validateCampground, campgrounds.createCampground);

// Dedicated layout retrieval path (Must reside above route parameters to bypass validation overlaps)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Grouping endpoints targeted at specific item parameter tracking keys ('/:id')
router
  .route("/:id")
  .get(campgrounds.showCampground)
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    validateCampground,
    campgrounds.updateCampground,
  )
  .delete(isLoggedIn, isCampgroundAuthor, campgrounds.deleteCampground);

// Isolated edit view retrieval endpoint
router.get(
  "/:id/edit",
  isLoggedIn,
  isCampgroundAuthor,
  campgrounds.renderEditForm,
);

module.exports = router;
