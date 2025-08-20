// Prompt Used:
// Generate the GET, POST, PUT, DELETE routes for /users without use of Mongodb database

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON requests

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

// POST route to create a new user
app.post('/users', (req, res) => {
  const newUser = { id: userIdCounter++, ...req.body }; // Assign a unique ID using the counter
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT route to update a user by ID
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body }; // Update user data
  res.status(200).json(users[userIndex]);
});

// DELETE route to delete a user by ID
app.delete('/users/:id', (req, res) => {
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




