const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const utilities = require('../util/utilites');
const { validationResult } = require('express-validator');
const AppError = require('../util/appError');

exports.renderHomePage = (req, res) => {
  res.render('index');
};

exports.renderProfilePage = (req, res, next) => {
  if (!req.session.user) {
    next(new AppError('No user found.', 500));
  }
  res.render('profile');
};

exports.renderLoginPage = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }

  res.render('login', {
    errorMessage: '',
  });
};

exports.postLogin = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.render('login', {
        errorMessage: 'Invalid email or password',
      });
    }
    bcrypt
      .compare(password, user.password)
      .then((match) => {
        if (match) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            return res.redirect('/');
          });
        }
        return res.render('login', {
          errorMessage: 'Invalid email or password',
        });
      })
      .catch((err) => {
        next(new AppError('Login Error', 500));
      });
  });
};

exports.getLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.renderCreateAccountPage = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('createAccount', { errorMessage: '' });
};

exports.renderVerifyEmailPage = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.render('verifyEmail', {
    errorMessage: '',
    verificationEmail: req.session.verificationEmail,
  });
};

exports.postVerifyEmailPage = (req, res, next) => {
  let code = req.body.verificationCode;

  User.findOne({ verificationCode: code })
    .then((userDoc) => {
      if (userDoc) {
        userDoc.verified = true;
        userDoc.verificationCode = undefined;
        userDoc.save();
        return res.redirect('/login');
      }
      return res.render('verifyEmail', {
        errorMessage: 'That token is not valid.',
      });
    })
    .catch((err) => {
      next(new AppError('Email verification error', 500));
    });
};

exports.postCreateAccountPage = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  req.session.verificationEmail = '';

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('createAccount', {
      errorMessage: errors.array()[0].msg,
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.render('createAccount', {
          errorMessage: 'Email address is already taken.',
        });
      }
      let code = utilities.generateVerificationCode(6);
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            verified: false,
            verificationCode: code,
          });
          return user.save();
        })
        .then((result) => {
          try {
            utilities.sendEmail({
              email: email,
              subject: 'Verify your email.',
              message: 'Verification code: ' + code,
            });
          } catch (err) {
            next(new AppError('Error sending email', 500));
          }

          req.session.verificationEmail = email;
          res.redirect('/verifyEmail');
        });
    })
    .catch((err) => {
      next(new AppError('Create account error', 500));
    });
};

exports.getReset = (req, res, next) => {
  res.render('reset', {
    errorMessage: '',
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      next(new AppError('Token generation', 500));
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.render('reset', {
            errorMessage: 'No account with that email found.',
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        try {
          utilities.sendEmail({
            email: req.body.email,
            subject: 'Password reset',
            message: `Password reset link: ${utilities.host}/reset/${token}`, // Replace this with your own house
          });
        } catch (err) {
          next(new AppError('Send email error', 500));
        }

        user.save();
        res.redirect('/');
      })
      .catch((err) => {
        next(new AppError('Reset password error', 500));
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.render('reset', {
          errorMessage: 'Invalid token.  Check your email and try again.',
        });
      }

      res.render('new-password', {
        errorMessage: '',
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      next(new AppError('Error creating new password', 500));
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      next(new AppError('Error creating new password', 500));
    });
};

exports.getResend = (req, res, next) => {
  res.render('resend', {
    errorMessage: '',
  });
};

exports.postResend = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((userDoc) => {
      if (userDoc) {
        const code = utilities.generateVerificationCode(6);
        userDoc.verificationCode = code;
        userDoc.save();

        try {
          utilities.sendEmail({
            email: req.body.email,
            subject: 'Verify your email.',
            message: 'Verification code: ' + code,
          });
        } catch (err) {
          next(new AppError('Error sending email', 500));
        }

        return res.redirect('/verifyEmail');
      }
      return res.render('resend', {
        errorMessage: 'No account with that email found.',
      });
    })
    .catch((err) => {
      next(new AppError('Error resending verification code.', 500));
    });
};
