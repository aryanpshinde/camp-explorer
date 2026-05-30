const User = require("../models/user");

// GET /register - Renders registration intake view
module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

// POST /register - Executes registration query logic and maps immediate user authentication session
module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    // Logs the user in directly following successful data storage pipeline execution
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

// GET /login - Provides authentication login gateway form
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

// POST /login - Handled by passport authentication strategy pipelines
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
};

// GET /logout - Cleanses authentication cookies and destroys memory sessions
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
