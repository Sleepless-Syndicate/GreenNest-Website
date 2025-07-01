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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});