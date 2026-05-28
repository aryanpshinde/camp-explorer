module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Store the URL they were trying to access before being kicked out
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    // Save it to res.locals before Passport flushes the old session
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
