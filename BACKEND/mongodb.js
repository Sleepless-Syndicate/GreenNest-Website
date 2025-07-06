const mongoose = require('mongoose');

// 🔌 MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/users-green-nest');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// 👤 User Schema & Model
const userSchema = new mongoose.Schema(
  {
    FullName: { type: String, required: true},
    UserName: { type: String, required: true, unique: true },
    PhoneNumber: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Address: { type: String, required: false},
    DOB: { type: Date, required: false },
    CurrentLocation: { type: String, required: false},
    Bio: { type: String, required: false},
    ProfileImage: { type: String, required: false},
  },
  { timestamps: true }
);

const Users = mongoose.model('data', userSchema);

// 🔐 OTP Schema & Model
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

// 📦 Export all models and connection
module.exports = {
  connectDB,
  Users,
  Otp,
};