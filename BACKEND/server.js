const express = require('express');
const path = require('path');
const { connectDB } = require('./mongodb');
const routes = require('./routes'); // Import routes

const app = express();
const PORT = 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Use routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});