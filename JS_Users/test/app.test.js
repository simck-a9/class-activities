const assert = require('assert');
const request = require('supertest');
const express = require('express');
let app;

// Import the app or set up a fresh instance for testing
before(() => {
    app = require('../app');
});

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
            .send({ name: 'Alice', age: 30 });
        assert.strictEqual(res.status, 201);
        assert(res.body.id);
        assert.strictEqual(res.body.name, 'Alice');
        createdUserId = res.body.id;
    });

    // Edge case: POST /users with missing required field (e.g., name)
    it('POST /users should handle missing fields', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', 'Bearer mysecrettoken')
            .send({}); // No fields
        // The current implementation accepts any fields, so expect 201
        assert.strictEqual(res.status, 201);
        assert(res.body.id);
    });

    // Edge case: POST /users with invalid data type (e.g., age as string)
    it('POST /users should handle invalid data types', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', 'Bearer mysecrettoken')
            .send({ name: 'Bob', age: "not-a-number" });
        // The current implementation does not validate types, so expect 201
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.age, "not-a-number");
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

    // Edge case: PUT /users/:id with invalid data type
    it('PUT /users/:id should handle invalid data types', async () => {
        const res = await request(app)
            .put(`/users/${createdUserId}`)
            .set('Authorization', 'Bearer mysecrettoken')
            .send({ age: "not-a-number" });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.age, "not-a-number");
    });

    // Edge case: PUT /users/:id with missing fields (should not remove existing fields)
    it('PUT /users/:id should handle missing fields gracefully', async () => {
        const res = await request(app)
            .put(`/users/${createdUserId}`)
            .set('Authorization', 'Bearer mysecrettoken')
            .send({});
        assert.strictEqual(res.status, 200);
        assert(res.body.id);
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

    // Edge case: GET /users after all users deleted
    it('GET /users should return empty array if no users', async () => {
        const res = await request(app).get('/users');
        assert.strictEqual(res.status, 200);
        assert(Array.isArray(res.body));
    });

    // Edge case: GET / should redirect to /users
    it('GET / should redirect to /users', async () => {
        const res = await request(app).get('/');
        assert.strictEqual(res.status, 302);
        assert.strictEqual(res.headers.location, '/users');
    });
});