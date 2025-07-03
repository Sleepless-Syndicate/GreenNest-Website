const express = require('express');
const path = require('path');
const session = require('express-session'); // ✅ Added
const { connectDB } = require('./mongodb');
const routes = require('./routes');

const app = express();
const PORT = 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// ✅ Session middleware (must be before routes)
app.use(session({
  secret: 'your-super-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});