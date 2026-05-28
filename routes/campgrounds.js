const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
const { campgroundSchema } = require("../schemas.js");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require("../middleware"); // Import your bouncer

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Protected Form Render
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// Protected Creation Operation
router.post("/", isLoggedIn, validateCampground, async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
});

router.get("/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate(
    "reviews",
  );
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
});

// Protected Edit Form Render
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
});

// Protected Update Execution
router.put("/:id", isLoggedIn, validateCampground, async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
});

// Protected Delete Execution
router.delete("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
});

module.exports = router;
