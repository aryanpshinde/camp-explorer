if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const sanitizeV5 = require("./utils/mongoSanitizeV5.js");
const helmetConfig = require("./utils/helmetConfig");
const { MongoStore } = require("connect-mongo");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

//const db_uri = process.env.DB_URI;
const db_uri = process.env.DB_URI || "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(db_uri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.set("query parser", "extended");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(sanitizeV5({ replaceWith: "_" }));
app.use(helmetConfig);

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: db_uri,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log(e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// --- PASSPORT CONFIGURATION ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ------------------------------

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Route Handlers
app.use("/", userRoutes); // User routes don't need a prefix
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Oh No, Something Went Wrong!";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Page Not Found";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  const safeErr = {
    statusCode,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  res.status(statusCode).render("error", { err: safeErr });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
