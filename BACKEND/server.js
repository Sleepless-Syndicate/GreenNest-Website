const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// In-memory stores (for demo)
const otpStore = {};
const verifiedUsers = new Set();

// Serve forgot password page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/forgot-password.html'));
});

// Step 1: Send OTP
app.post('/send-otp', (req, res) => {
  const contact = req.body.contact;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[contact] = otp;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: contact,
    subject: 'GreenNest OTP Verification',
    text: `Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.send('Failed to send OTP.');
    } else {
      console.log('OTP sent:', info.response);
      return res.redirect('/verify-otp.html');
    }
  });
});

// Step 2: Verify OTP
app.post('/verify-otp', (req, res) => {
  const { contact, otp } = req.body;

  if (otpStore[contact] && otpStore[contact] == otp) {
    delete otpStore[contact];
    verifiedUsers.add(contact);
    return res.redirect(`/reset-password.html?contact=${encodeURIComponent(contact)}`);
  } else {
    return res.send('<h2>❌ Invalid OTP</h2><a href="/verify-otp.html">Try Again</a>');
  }
});

// Step 3: Reset Password
app.post('/reset-password', (req, res) => {
  const { contact, newPassword, confirmPassword } = req.body;

  if (!verifiedUsers.has(contact)) {
    return res.send('Unauthorized access. Please verify OTP first.');
  }

  if (newPassword !== confirmPassword) {
    return res.send('Passwords do not match.');
  }

  // Simulate saving password
  console.log(`Password for ${contact} has been reset to: ${newPassword}`);
  verifiedUsers.delete(contact);

  res.send('<h2>✅ Password reset successful!</h2><a href="/user-login.html">Go to Login</a>');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});