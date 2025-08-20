const assert = require('assert');
const request = require('supertest');
const express = require('express');
let app;

// Import the app or set up a fresh instance for testing
before(() => {
    app = require('../app'); // If app.js exports the app, otherwise see below
});

// If app.js does not export the app, use this workaround:
// if (!app.listen) {
//     // Re-create the app from app.js code for testing
//     app = express();
//     app.use(express.json());
//     app.use(require('cors')());
//     let users = [];
//     let userIdCounter = 1;
//     app.get('/users', (req, res) => res.status(200).json(users));
//     app.post('/users', (req, res) => {
//         if (req.headers.authorization !== 'Bearer mysecrettoken') return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
//         const newUser = { id: userIdCounter++, ...req.body };
//         users.push(newUser);
//         res.status(201).json(newUser);
//     });
//     app.put('/users/:id', (req, res) => {
//         if (req.headers.authorization !== 'Bearer mysecrettoken') return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
//         const userId = parseInt(req.params.id);
//         const userIndex = users.findIndex(user => user.id === userId);
//         if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
//         users[userIndex] = { ...users[userIndex], ...req.body };
//         res.status(200).json(users[userIndex]);
//     });
//     app.delete('/users/:id', (req, res) => {
//         if (req.headers.authorization !== 'Bearer mysecrettoken') return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
//         const userId = parseInt(req.params.id);
//         const userIndex = users.findIndex(user => user.id === userId);
//         if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
//         const deletedUser = users.splice(userIndex, 1);
//         res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
//     });
//     app.get('/', (req, res) => res.redirect('/users'));
//}

describe('User API Routes', () => {
    let createdUserId;

    it('GET /users should return an array', async () => {
        const res = await request(app).get('/users');
        assert.strictEqual(res.status, 200);
        assert(Array.isArray(res.body));
    });

    it('POST /users should require authentication', async () => {
        const res = await request(app).post('/users').send({ name: 'Alice' });
        assert.strictEqual(res.status, 401);
    });

    it('POST /users should create a user with valid token', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', 'Bearer mysecrettoken')
            .send({ name: 'Alice' });
        assert.strictEqual(res.status, 201);
        assert(res.body.id);
        assert.strictEqual(res.body.name, 'Alice');
        createdUserId = res.body.id;
    });

    it('PUT /users/:id should require authentication', async () => {
        const res = await request(app).put(`/users/${createdUserId}`).send({ name: 'Bob' });
        assert.strictEqual(res.status, 401);
    });

    it('PUT /users/:id should update user with valid token', async () => {
        const res = await request(app)
            .put(`/users/${createdUserId}`)
            .set('Authorization', 'Bearer mysecrettoken')
            .send({ name: 'Bob' });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.name, 'Bob');
    });

    it('DELETE /users/:id should require authentication', async () => {
        const res = await request(app).delete(`/users/${createdUserId}`);
        assert.strictEqual(res.status, 401);
    });

    it('DELETE /users/:id should delete user with valid token', async () => {
        const res = await request(app)
            .delete(`/users/${createdUserId}`)
            .set('Authorization', 'Bearer mysecrettoken');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.message, 'User deleted successfully');
    });

    it('PUT /users/:id should return 404 for non-existent user', async () => {
        const res = await request(app)
            .put('/users/9999')
            .set('Authorization', 'Bearer mysecrettoken')
            .send({ name: 'Nobody' });
        assert.strictEqual(res.status, 404);
    });

    it('DELETE /users/:id should return 404 for non-existent user', async () => {
        const res = await request(app)
            .delete('/users/9999')
            .set('Authorization', 'Bearer mysecrettoken');
        assert.strictEqual(res.status, 404);
    });
});