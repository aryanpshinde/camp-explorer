const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
// Updated destructuring to import the explicitly named isCampgroundAuthor guard
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
} = require("../middleware");

// Index Route: Renders all campgrounds
router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Protected Form Render
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// Protected Creation Operation: Automatically binds authenticated user as the document author
router.post("/", isLoggedIn, validateCampground, async (req, res) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id; // Attach active user session footprint to resource
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
});

// Show Route: Deep nest populates the review array AND each review's respective author object
router.get("/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // Populate the author of each individual review
      },
    })
    .populate("author"); // Populate the standalone author of the main campground

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
});

// Protected Edit Form Render: Guarded via active login session and resource authorization validation
router.get("/:id/edit", isLoggedIn, isCampgroundAuthor, async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
});

// Protected Update Execution: Guarded via active login session and resource authorization validation
router.put(
  "/:id",
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
  async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  },
);

// Protected Delete Execution: Guarded via active login session and resource authorization validation
router.delete("/:id", isLoggedIn, isCampgroundAuthor, async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
});

module.exports = router;
