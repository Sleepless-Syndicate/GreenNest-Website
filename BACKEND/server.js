const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve all static files from FRONTEND
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Route for homepage
app.get('/GreenNest', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/index.html'));
});

// Route for buyer-login page
app.get('/buyer-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/buyer-login.html'));
});

// Route for seller-login page
app.get('/seller-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/seller-login.html'));
});

// Route for forgot-password page
app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/forgot-password.html'));
});

// Route for otp-verification page
app.get('/otp-verification.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/otp-verification.html'));
});

// Route for reset-password page
app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/reset-password.html'));
});

// Route for homepage again
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});