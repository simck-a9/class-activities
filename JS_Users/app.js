// Prompt Used:
// Generate the GET, POST, PUT, DELETE routes for /users without use of Mongodb database

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON requests

// CORS middleware: Allow requests from any origin (customize as needed)
app.use(cors());

// In-memory array to store user data
let users = [];
let userIdCounter = 1; // Simple ID counter

// Default route to redirect to /users
app.get('/', (req, res) => {
  res.redirect('/users');
});

// GET route to fetch all users
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Simple token-based authentication middleware
function authenticateToken(req, res, next) {
  // For demonstration, expect token in 'Authorization' header as 'Bearer <token>'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Replace 'mysecrettoken' with your actual secret/token logic
  if (token === 'mysecrettoken') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
}

// Protect sensitive endpoints with authentication middleware
app.post('/users', authenticateToken, (req, res) => {
  const newUser = { id: userIdCounter++, ...req.body }; // Assign a unique ID using the counter
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT route to update a user by ID
app.put('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body }; // Update user data
  res.status(200).json(users[userIndex]);
});

// DELETE route to delete a user by ID
app.delete('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = users.splice(userIndex, 1); // Remove user from array
  res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




