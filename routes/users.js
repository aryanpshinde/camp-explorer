const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users"); // Import Users Controller
const { storeReturnTo } = require("../middleware");

// Grouping registration endpoint layers
router.route("/register").get(users.renderRegister).post(users.register);

// Grouping login authentication processing paths
router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo, // Clone target destination to prevent Passport memory session resets
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login,
  );

// Single verb decoupled logout endpoint
router.get("/logout", users.logout);

module.exports = router;
