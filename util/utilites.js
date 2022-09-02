const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  secureConnection: false,
  port: 587,
  tls: {
    ciphers: 'SSLv3',
  },
  auth: {
    user: 'yourEmail@outlook.com', // Change this value to your own
    pass: 'yourEmailPassword', // Change this value to your own
  },
});

function generateVerificationCode(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function sendEmail(options) {
  const mailOptions = {
    from: 'You <yourEmailHere@outlook.com>', // Change this value
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    next(new AppError('Error sending email', 500));
  }
}

const dbConnectionString =
  'mongodb+srv://<USERNAME>:PASSWORD@cluster0.something.mongodb.net/yourDatabseNameHere'; // Change this to your own mongodb connection string.

const host = 'http://localhost:9001';

module.exports = {
  generateVerificationCode,
  sendEmail,
  dbConnectionString,
  host,
};
