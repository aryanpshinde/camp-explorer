const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");

// --- NEW IMPORTS ---
const { campgroundSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");

const db_uri = "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(db_uri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse form data and fake PUT/DELETE requests
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// --- NEW VALIDATION MIDDLEWARE ---
// Intercepts the request and checks it against our Joi schema
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // Map over Joi's error details array to create a single comma-separated string
    const msg = error.details.map((el) => el.message).join(",");
    // Express 5 will natively catch this thrown error and send it down to the generic handler!
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// --- ROUTES ---

app.get("/", (req, res) => {
  res.render("home");
});

// INDEX
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// NEW
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// CREATE (Protected with validateCampground)
app.post("/campgrounds", validateCampground, async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

// SHOW
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
});

// EDIT
app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
});

// UPDATE (Protected with validateCampground)
app.put("/campgrounds/:id", validateCampground, async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

// DELETE
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

// --- NEW ERROR HANDLING LOGIC ---

// 404 Catch-All (Using the safe path-to-regexp syntax)
app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Generic Error Handler (Renders the custom error template)
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";

  res.status(statusCode).render("error", { err });
});

app.listen(5000, () => {
  console.log("Serving on port 5000");
});
