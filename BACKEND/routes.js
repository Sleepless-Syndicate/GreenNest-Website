const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const router = express.Router();
const { Users, Otp } = require('./mongodb');
const nodemailer = require('nodemailer');

// 🌐 Serve static HTML pages
const pages = [
  'index', 'profile', 'buyer', 'seller', 'login',
  'forgot-password', 'otp-verification', 'reset-password', 'sign-up'
];

pages.forEach(page => {
  router.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(__dirname, `../FRONTEND/HTML/${page}.html`));
  });
});

router.get('/GreenNest', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/HTML/index.html'));
});

// 📝 Register
router.post('/register', async (req, res) => {
  const { FullName, UserName, PhoneNumber, Email, Password } = req.body;

  try {
    if (await Users.findOne({ Email })) {
      return res.status(400).send('User already exists with this email.');
    }

    if (await Users.findOne({ UserName })) {
      return res.status(400).send('Username already exists!');
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = new Users({
      FullName,
      UserName,
      PhoneNumber,
      Email,
      Password: hashedPassword
    });

    await user.save();
    console.log('✅ User registered:', { FullName, UserName, PhoneNumber, Email });
    res.redirect('/index.html');
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  const { UserName, Password } = req.body;

  try {
    const user = await Users.findOne({ UserName });
    if (!user || !(await bcrypt.compare(Password, user.Password))) {
      return res.status(400).send('❌ Invalid username or password');
    }

    req.session.username = UserName;
    console.log('✅ Login successful for:', UserName);
    res.redirect('/index.html');
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✉️ Send OTP
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
    await Otp.deleteMany({ email: normalizedContact });

    await Otp.create({
      email: normalizedContact,
      code: otp,
      expiresAt: new Date(Date.now() + 60 * 1000)
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'saikatusesnu@gmail.com',
        pass: 'tvoo vfem slod ncca'
      }
    });

    await transporter.sendMail({
      from: '"GreenNest OTP" <saikatusesnu@gmail.com>',
      to: normalizedContact,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`
    });

    console.log(`✅ OTP sent to email: ${normalizedContact}`);
    res.redirect('/otp-verification.html');
  } catch (err) {
    console.error('❌ OTP send error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { contact, otp } = req.body;
  const normalizedContact = contact.trim().toLowerCase();

  try {
    const record = await Otp.findOne({ email: normalizedContact });

    if (!record) return res.status(400).send('❌ No OTP found for this contact');
    if (Date.now() > record.expiresAt.getTime()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(410).send('❌ OTP has expired');
    }
    if (record.code !== otp) return res.status(401).send('❌ Invalid OTP');

    await Otp.deleteOne({ _id: record._id });
    req.session.verifiedEmail = normalizedContact;

    console.log(`✅ OTP verified for ${normalizedContact}`);
    res.redirect('/reset-password.html');
  } catch (err) {
    console.error('❌ OTP verification error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 🔁 Reset Password
router.post('/reset-password', async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const email = req.session.verifiedEmail;

  if (!email) return res.status(403).send('❌ Unauthorized: verification required');
  if (!newPassword || newPassword !== confirmPassword) {
    return res.status(400).send('❌ Passwords do not match or are empty');
  }

  try {
    const user = await Users.findOne({ Email: email });
    if (!user) return res.status(404).send('❌ User not found');

    user.Password = await bcrypt.hash(newPassword.trim(), 10);
    await user.save();

    req.session.verifiedEmail = null;
    console.log(`✅ Password reset for ${email}`);
    res.redirect('/index.html');
  } catch (err) {
    console.error('❌ Password reset error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 👤 Get Profile Data
router.get('/api/profile', async (req, res) => {
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ error: 'Unauthorized: No user logged in' });
  }

  try {
    const user = await Users.findOne({ UserName: username });

    if (user) {
      res.json({
        FullName: user.FullName,
        UserName: user.UserName,
        Address: user.Address || "",
        DOB: user.DOB ? user.DOB.toISOString().split('T')[0] : "",
        CurrentLocation: user.CurrentLocation || "",
        Bio: user.Bio || "",
        ProfileImage: user.ProfileImage?.trim()
          ? user.ProfileImage
          : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7EiBcuORVZmYoKA0JeIqXTnoSvArdLXhA3w&s"
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✏️ Update Profile
router.post('/api/profile/update', async (req, res) => {
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ error: 'Unauthorized: No user logged in' });
  }

  const {
    Address = "",
    DOB = "",
    CurrentLocation = "",
    Bio = "",
    ProfileImage = ""
  } = req.body || {};

  try {
    const user = await Users.findOne({ UserName: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.Address = Address;
    user.DOB = DOB;
    user.CurrentLocation = CurrentLocation;
    user.Bio = Bio;
    user.ProfileImage = ProfileImage;

    await user.save();

    console.log(`✅ Profile updated for ${username}`);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🚪 Log Out Route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/index.html');
  });
});

module.exports = router;