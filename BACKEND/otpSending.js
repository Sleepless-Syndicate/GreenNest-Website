const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', async (req, res) => {
  const contact = req.body.contact;
  const otp = generateOTP();

  // Save OTP in session or database for later verification

  // Send OTP via email (example using Nodemailer)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  let mailOptions = {
    from: 'your-email@gmail.com',
    to: contact,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('OTP sent successfully!');
  } catch (error) {
    res.status(500).send('Error sending OTP');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));