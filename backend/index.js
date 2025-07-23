require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mqtt = require('mqtt');

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.error('JWT_SECRET not set in environment variables');
  process.exit(1);
})();
const MONGO_URI = process.env.MONGO_URI || (() => {
  console.error('MONGO_URI not set in environment variables');
  process.exit(1);
})();
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mqtt-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// MQTT client
const client = mqtt.connect(MQTT_BROKER_URL);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MQTT Backend API',
      version: '1.0.0',
      description: 'A secure MQTT device monitoring system API',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://api.example.com' : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./index.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Database connection with proper error handling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Validation schemas
const registerValidation = [
  body('deviceId').isLength({ min: 1 }).trim().escape().withMessage('Device ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('consumerName').isLength({ min: 1 }).trim().escape().withMessage('Consumer name is required'),
  body('consumerAddress').isLength({ min: 1 }).trim().escape().withMessage('Consumer address is required'),
  body('consumerNo').isLength({ min: 1 }).trim().escape().withMessage('Consumer number is required'),
];

const loginValidation = [
  body('consumerNo').isLength({ min: 1 }).trim().escape().withMessage('Consumer number is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

const passwordResetValidation = [
  body('consumerNo').isLength({ min: 1 }).trim().escape().withMessage('Consumer number is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// MQTT connection with better error handling
client.on('connect', () => {
    logger.info('Connected to MQTT broker');
    client.subscribe('device/data', (err) => {
        if (!err) {
            logger.info('Subscribed to device/data topic');
        } else {
            logger.error('Subscription error:', err);
        }
    });
});

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    logger.info(`Received MQTT message on topic ${topic}:`, data);
    await handleIncomingDeviceData(data);
  } catch (error) {
    logger.error('Error processing MQTT message:', error);
  }
});

client.on('error', (error) => {
  logger.error('MQTT connection error:', error);
});

client.on('offline', () => {
  logger.warn('MQTT client went offline');
});

client.on('reconnect', () => {
  logger.info('MQTT client reconnecting...');
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *       503:
 *         description: API is unhealthy
 */
app.get('/health', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    };

    try {
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.message = error;
        res.status(503).json(healthCheck);
    }
});

app.get('/health/ready', async (req, res) => {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();

        // Check MQTT connection
        const mqttStatus = client.connected ? 'connected' : 'disconnected';

        res.status(200).json({
            status: 'ready',
            database: 'connected',
            mqtt: mqttStatus,
            timestamp: Date.now()
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'not ready',
            error: error.message,
            timestamp: Date.now()
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'MQTT Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            ready: '/health/ready',
            docs: '/api-docs'
        }
    });
});

const Users = mongoose.model("Users", {
  deviceId: {
    type: [String],
    required: true,
    unique: false,
  },
  password: {
    type: String,
    required: true,
  },
  consumerName: {
    type: String,
    required: true,
  },
  consumerAddress: {
    type: String,
    required: true,
  },
  consumerNo: {
    type: String,
    required: true,
  },
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user or add device to existing user
 *     description: Creates a new user account or adds a device to an existing user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - password
 *               - consumerName
 *               - consumerAddress
 *               - consumerNo
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: Unique device identifier
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password (minimum 6 characters)
 *               consumerName:
 *                 type: string
 *                 description: Full name of the consumer
 *               consumerAddress:
 *                 type: string
 *                 description: Consumer's address
 *               consumerNo:
 *                 type: string
 *                 description: Unique consumer number
 *     responses:
 *       201:
 *         description: User created successfully
 *       200:
 *         description: Device added to existing user
 *       400:
 *         description: Validation error or device already exists
 *       401:
 *         description: Wrong password for existing user
 */
app.post('/register', registerValidation, handleValidationErrors, async (req, res, next) => {
    try {
        const { deviceId, password, consumerName, consumerAddress, consumerNo } = req.body;

        logger.info(`Registration attempt for consumer: ${consumerNo}`);

        // Check if device already exists
        const deviceExists = await Users.findOne({ deviceId });
        if (deviceExists) {
            logger.warn(`Device ID already exists: ${deviceId}`);
            return res.status(400).json({ message: "Device ID already exists" });
        }

        // Check if user already exists
        const existingUser = await Users.findOne({ consumerName, consumerAddress, consumerNo });

        if (existingUser) {
            const isMatch = await bcrypt.compare(password, existingUser.password);
            if (!isMatch) {
                logger.warn(`Wrong password attempt for consumer: ${consumerNo}`);
                return res.status(401).json({ message: "Wrong Password, Try Again" });
            }

            if (!existingUser.deviceId.includes(deviceId)) {
                existingUser.deviceId.push(deviceId);
                await existingUser.save();
                logger.info(`Device added to existing user: ${consumerNo}`);
            }
            return res.status(200).json({
                message: "User already exists, device added successfully",
                deviceId: deviceId
            });
        }

        // Create new user
        const salt = await bcrypt.genSalt(12); // Increased salt rounds
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Users({
            deviceId: [deviceId], // Ensure it's an array
            password: hashedPassword,
            consumerName,
            consumerAddress,
            consumerNo
        });

        await newUser.save();
        logger.info(`New user created successfully: ${consumerNo}`);

        res.status(201).json({
            message: "User created successfully",
            deviceId: deviceId
        });
    } catch (err) {
        logger.error('Registration error:', err);
        next(err);
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consumerNo
 *               - password
 *             properties:
 *               consumerNo:
 *                 type: string
 *                 description: Consumer number
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                 expiresIn:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
app.post('/login', authLimiter, loginValidation, handleValidationErrors, async (req, res, next) => {
    try {
        const { consumerNo, password } = req.body;

        logger.info(`Login attempt for consumer: ${consumerNo}`);

        const user = await Users.findOne({ consumerNo }).select('+password');

        if (!user) {
            logger.warn(`Login failed - user not found: ${consumerNo}`);
            return res.status(401).json({ message: "Invalid credentials" }); // Don't reveal if user exists
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.warn(`Login failed - wrong password: ${consumerNo}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                deviceId: user.deviceId,
                consumerNo: user.consumerNo
            },
            JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
                issuer: 'mqtt-backend',
                audience: 'mqtt-frontend'
            }
        );

        logger.info(`Login successful for consumer: ${consumerNo}`);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                deviceId: user.deviceId,
                consumerName: user.consumerName,
                consumerAddress: user.consumerAddress,
                consumerNo: user.consumerNo
            },
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

    } catch (err) {
        logger.error('Login error:', err);
        next(err);
    }
});

app.get('/users', authenticateToken, async (req, res, next) => {
    try {
        logger.info(`Users list requested by user: ${req.user.userId}`);

        const users = await Users.find()
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 });

        res.status(200).json({
            users,
            count: users.length,
            timestamp: Date.now()
        });
    } catch (err) {
        logger.error('Error fetching users:', err);
        next(err);
    }
});

app.post('/resetpassword', authLimiter, passwordResetValidation, handleValidationErrors, async (req, res, next) => {
    try {
        const { consumerNo, newPassword } = req.body;

        logger.info(`Password reset attempt for consumer: ${consumerNo}`);

        const user = await Users.findOne({ consumerNo });

        if (!user) {
            logger.warn(`Password reset failed - user not found: ${consumerNo}`);
            // Don't reveal if user exists - return success anyway for security
            return res.status(200).json({ message: "If the user exists, password reset instructions have been sent" });
        }

        // In a real application, you would:
        // 1. Generate a secure reset token
        // 2. Send it via email
        // 3. Verify the token before allowing password reset
        // For now, we'll implement a basic version with authentication required

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        logger.info(`Password reset successful for consumer: ${consumerNo}`);

        res.status(200).json({ message: "Password reset successfully" });

    } catch (err) {
        logger.error('Password reset error:', err);
        next(err);
    }
});

const Devices = mongoose.model("Devices", new Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}));

const handleIncomingDeviceData = async (data) => {
    const { deviceId, ...otherData } = data;

    if (!deviceId) {
        logger.error("Device ID is required in MQTT message");
        return;
    }

    try {
        // Validate that the device is registered
        const userWithDevice = await Users.findOne({ deviceId });
        if (!userWithDevice) {
            logger.warn(`Received data from unregistered device: ${deviceId}`);
            return;
        }

        const existingDevice = await Devices.findOne({ deviceId });

        if (existingDevice) {
            existingDevice.data = {
                ...existingDevice.data,
                ...otherData,
                receivedAt: new Date()
            };
            existingDevice.lastUpdated = Date.now();
            await existingDevice.save();
            logger.info(`Device ${deviceId} data updated successfully`);
        } else {
            const newDevice = new Devices({
                deviceId,
                data: {
                    ...otherData,
                    receivedAt: new Date()
                },
            });
            await newDevice.save();
            logger.info(`Device ${deviceId} created successfully`);
        }
    } catch (error) {
        logger.error(`Error handling device data for ${deviceId}:`, error);
    }
};

app.get('/devices/:deviceId', authenticateToken, async (req, res, next) => {
    try {
        const { deviceId } = req.params;

        // Check if user has access to this device
        if (!req.user.deviceId.includes(deviceId)) {
            logger.warn(`Unauthorized device access attempt by user ${req.user.userId} for device ${deviceId}`);
            return res.status(403).json({ message: "Access denied to this device" });
        }

        const device = await Devices.findOne({ deviceId });

        if (!device) {
            logger.info(`Device not found: ${deviceId}`);
            return res.status(404).json({ message: "Device not found" });
        }

        logger.info(`Device data retrieved for: ${deviceId}`);

        res.status(200).json({
            device,
            timestamp: Date.now()
        });
    } catch (error) {
        logger.error('Error fetching device data:', error);
        next(error);
    }
});

// Get all devices for authenticated user
app.get('/devices', authenticateToken, async (req, res, next) => {
    try {
        const userDevices = req.user.deviceId;

        const devices = await Devices.find({
            deviceId: { $in: userDevices }
        }).sort({ lastUpdated: -1 });

        logger.info(`Retrieved ${devices.length} devices for user ${req.user.userId}`);

        res.status(200).json({
            devices,
            count: devices.length,
            timestamp: Date.now()
        });
    } catch (error) {
        logger.error('Error fetching user devices:', error);
        next(error);
    }
});

// Apply error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(() => {
        logger.info('HTTP server closed');

        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');

            client.end(() => {
                logger.info('MQTT client disconnected');
                process.exit(0);
            });
        });
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, (error) => {
    if (!error) {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check available at: http://localhost:${PORT}/health`);
    } else {
        logger.error("Server startup error:", error);
        process.exit(1);
    }
});