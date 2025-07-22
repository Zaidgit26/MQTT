const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // You'll need to export app from index.js

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/mqtt_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        deviceId: 'TEST001',
        password: 'password123',
        consumerName: 'Test User',
        consumerAddress: '123 Test St',
        consumerNo: 'TEST001'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
    });

    it('should reject registration with missing fields', async () => {
      const userData = {
        deviceId: 'TEST002',
        password: 'password123'
        // Missing required fields
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        deviceId: 'TEST003',
        password: '123', // Too short
        consumerName: 'Test User',
        consumerAddress: '123 Test St',
        consumerNo: 'TEST003'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        deviceId: 'LOGIN001',
        password: 'password123',
        consumerName: 'Login Test User',
        consumerAddress: '123 Login St',
        consumerNo: 'LOGIN001'
      };

      await request(app)
        .post('/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        consumerNo: 'LOGIN001',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        consumerNo: 'LOGIN001',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.message).toBe('OK');
      expect(response.body.uptime).toBeDefined();
    });
  });
});
