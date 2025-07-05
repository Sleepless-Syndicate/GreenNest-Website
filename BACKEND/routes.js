const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Users, Otp } = require('./mongodb');
const nodemailer = require('nodemailer');

// Serve static HTML pages
router.get('/GreenNest', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/index.html'));
});

router.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/profile.html'));
});

router.get('/buyer.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/buyer.html'));
});

router.get('/seller.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/seller.html'));
});

router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/login.html'));
});

router.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/forgot-password.html'));
});

router.get('/otp-verification.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/otp-verification.html'));
});

router.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/reset-password.html'));
});

router.get('/sign-up.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/sign-up.html'));
});

router.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/index.html'));
});

// Register route
router.post('/register', async (req, res) => {
  const { UserName, PhoneNumber, Email, Password } = req.body;

  try {
    const existingUser = await Users.findOne({ Email });
    if (existingUser) {
      return res.status(400).send('User already exists with this email.');
    }

    const existingUserName = await Users.findOne({ UserName });
    if (existingUserName) {
      return res.status(400).send('Username already exist!!');
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = new Users({
      UserName,
      PhoneNumber,
      Email,
      Password: hashedPassword,
    });

    await user.save();

    console.log('User registered:', { UserName, PhoneNumber, Email });
    res.redirect('/index.html');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { UserName, Password } = req.body;

  try {
    const user = await Users.findOne({ UserName });
    if (!user) {
      return res.status(400).send('❌ Invalid username or password');
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).send('❌ Invalid username or password');
    }

    console.log('✅ Login successful for:', UserName);
    res.redirect('/index.html');
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// OTP sending route
router.post('/send-otp', async (req, res) => {
  const { contact } = req.body;
  const normalizedContact = contact.trim().toLowerCase();
  
  try {
    if (!normalizedContact.includes('@')) {
      return res.status(400).send('❌ Only email addresses are supported for OTP');
    }

    const user = await Users.findOne({ Email: normalizedContact });
    if (!user) {
      return res.status(404).send('❌ No user found with this email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: normalizedContact });

    // Save new OTP with 60-second expiration
    await Otp.create({
      email: normalizedContact,
      code: otp,
      expiresAt: new Date(Date.now() + 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'saikatusesnu@gmail.com',
        pass: 'tvoo vfem slod ncca',
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection failed:', error);
      } else {
        console.log('✅ SMTP server is ready to send messages');
      }
    });

    await transporter.sendMail({
      from: '"GreenNest OTP" <saikatusesnu@gmail.com>',
      to: normalizedContact,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });

    console.log(`✅ OTP sent to email: ${normalizedContact}`);
    res.redirect('/otp-verification.html');
  } catch (err) {
    console.error('❌ OTP send error:', err);
    res.status(500).send('Internal Server Error');
  }
});


// OTP verification route
router.post('/verify-otp', async (req, res) => {
  const { contact, otp } = req.body;
  const normalizedContact = contact.trim().toLowerCase();

  try {
    console.log('🔍 Verifying OTP for:', normalizedContact);

    // 🔎 Search for matching OTP
    const record = await Otp.findOne({ email: normalizedContact });

    if (!record) {
      return res.status(400).send('❌ No OTP found for this contact');
    }

    // ⏰ Check expiration
    if (Date.now() > record.expiresAt.getTime()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(410).send('❌ OTP has expired');
    }

    // ❌ Incorrect code
    if (record.code !== otp) {
      return res.status(401).send('❌ Invalid OTP');
    }

    // ✅ Success: delete used OTP, save email in session
    await Otp.deleteOne({ _id: record._id });
    req.session.verifiedEmail = normalizedContact;

    console.log(`✅ OTP verified for ${normalizedContact}`);
    return res.redirect('/reset-password.html');
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Get verified email from session
  const email = req.session.verifiedEmail;

  if (!email) {
    return res.status(403).send('❌ Unauthorized: verification required');
  }

  // Optional: sanitize input
  const trimmedNewPassword = newPassword?.trim();
  const trimmedConfirmPassword = confirmPassword?.trim();

  if (!trimmedNewPassword || trimmedNewPassword !== trimmedConfirmPassword) {
    return res.status(400).send('❌ Passwords do not match or are empty');
  }

  try {
    const user = await Users.findOne({ Email: email }); // field name case-sensitive?
    if (!user) {
      return res.status(404).send('❌ User not found');
    }

    const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);
    user.Password = hashedPassword;
    await user.save();

    // Optional: destroy session
    req.session.verifiedEmail = null;

    console.log(`✅ Password reset for ${email}`);
    res.redirect('/index.html');
  } catch (err) {
    console.error('❌ Password reset error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;