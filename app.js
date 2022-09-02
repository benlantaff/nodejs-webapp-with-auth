const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');
const csrfProtection = csrf();
const app = express();
const AppError = require('./util/appError');
const bodyParser = require('body-parser');
const webRouter = require('./routes/webRouter');
const MongoDBStore = require('connect-mongodb-session')(session);
const util = require('./util/utilites');
const { authStore, errorHandler } = require('./middleware/customMiddleware');
const store = new MongoDBStore({
  uri: util.dbConnectionString,
  collection: 'sessions',
});

// Security middleware to help protect from xss and other attacks.
app.use(helmet());

// Allows for parsing incoming post requests.
app.use(bodyParser.urlencoded({ extended: false }));

// EJS is the view engine (.ejs files).
app.set('view engine', 'ejs');

// Provides access to static content, like css, images, and js.
app.use(express.static(`public`));

// Session usage will be tracked via MongoDB 'sessions' table.
app.use(
  session({
    secret: 'putyoursuperduperlongsecrethere',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Protect post routes with csrf
app.use(csrfProtection);

// Creates a shortcut to bootstrap distribution folder.
app.use(
  '/bootstrap',
  express.static(__dirname + '/node_modules/bootstrap/dist/')
);

// Store authentication for all rendered views.
app.use(authStore);

// Express router to handle all web related urls.
app.use(webRouter);

// If no url is matched in the webRouter, 404 will be shown.
app.use((req, res, next) => {
  next(new AppError('Page not found!', 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
