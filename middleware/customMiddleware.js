exports.authStore = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  res.locals.csrfToken = req.csrfToken();
  next();
};

exports.routeProtection = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  return res.status(err.statusCode).render('error', {
    errorMessage: err.message,
    statusCode: err.statusCode,
  });
  next();
};
