const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();
const webController = require('../controllers/webController');
const { routeProtection } = require('../middleware/customMiddleware');

// Index
router.route('/').get(webController.renderHomePage);

// Authentication
router.route('/login').get(webController.renderLoginPage);
router.route('/login').post(webController.postLogin);
router.route('/logout').get(webController.getLogout);

// Create accounts
router.route('/createAccount').get(webController.renderCreateAccountPage);
router.route('/createAccount').post(
  check('email').isEmail().withMessage('Please enter a valid email.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  }),
  webController.postCreateAccountPage
);

// Verify accounts
router.route('/verifyEmail').get(webController.renderVerifyEmailPage);
router.route('/verifyEmail').post(webController.postVerifyEmailPage);

// Profile
router.route('/profile').get(routeProtection, webController.renderProfilePage);

// Reset password
router.get('/reset', webController.getReset);
router.post('/reset', webController.postReset);
router.get('/reset/:token', webController.getNewPassword);
router.post('/new-password', webController.postNewPassword);

// Resend email verification code
router.get('/resend', webController.getResend);
router.post('/resend', webController.postResend);

module.exports = router;
