const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware"); // Import the interceptor

router.get("/register", (req, res) => {
  res.render("users/register");
});

// POST /register - Now logs the user in immediately after database creation
router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    // Explicitly establish login session for the newly registered user
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

// POST /login - Uses relay middleware to dodge the Session Fixation wipe
router.post(
  "/login",
  storeReturnTo, // Step 1: Clone target URL to res.locals
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }), // Step 2: Passport clears session container and authenticates
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // Step 3: Redirect cleanly
    res.redirect(redirectUrl);
  },
);

// GET /logout - Upgraded with modern async callback required by Passport
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
