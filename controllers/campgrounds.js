const Campground = require("../models/campgrounds");

// GET /campgrounds - Fetches all campgrounds and presents index view
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

// GET /campgrounds/new - Renders form to deploy a new campground
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

// POST /campgrounds - Saves newly generated campground into database
module.exports.createCampground = async (req, res) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id; // Bind logged-in session account as author
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// GET /campgrounds/:id - Displays comprehensive view of a single campground document
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // Populate individual reviewer metadata
      },
    })
    .populate("author"); // Populate structural campground creator profile

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

// GET /campgrounds/:id/edit - Renders population-ready update form document
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

// PUT /campgrounds/:id - Transmits edited data mutations into targeted database document
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// DELETE /campgrounds/:id - Triggers campground deletion and dependent query cascades
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
