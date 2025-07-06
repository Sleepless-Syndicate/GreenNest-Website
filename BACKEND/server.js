const express = require('express');
const path = require('path');
const session = require('express-session');
const { connectDB } = require('./mongodb');
const routes = require('./routes');

const app = express();
const PORT = 8000;

// 🔌 Connect to MongoDB
connectDB();

// 🛡️ Middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Handles form data
app.use(express.json({ limit: '10mb' })); // Handles JSON payloads (e.g. Base64 images)
app.use(express.static(path.join(__dirname, '../FRONTEND'))); // Serve static files

// 🔐 Session middleware
app.use(session({
  secret: 'your-super-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// 🚦 Routes
app.use('/', routes);

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});