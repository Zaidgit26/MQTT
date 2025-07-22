# MQTT Device Monitoring System

A secure, industry-ready IoT device monitoring system built with Node.js, React, and MQTT. This system allows users to register IoT devices, monitor real-time data, and manage device access through a web interface.

## 🚀 Features

### Security
- ✅ JWT-based authentication with secure token storage
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Input validation and sanitization
- ✅ Rate limiting to prevent brute force attacks
- ✅ CORS protection and security headers
- ✅ Environment-based configuration
- ✅ Protected routes and API endpoints

### Reliability
- ✅ Comprehensive error handling and logging
- ✅ Health check endpoints for monitoring
- ✅ Graceful shutdown handling
- ✅ Database connection pooling
- ✅ MQTT connection resilience
- ✅ React Error Boundaries

### Scalability
- ✅ Docker containerization
- ✅ Docker Compose for multi-service deployment
- ✅ MongoDB with proper indexing
- ✅ Redis caching support
- ✅ Load balancer ready
- ✅ Horizontal scaling support

### Developer Experience
- ✅ Comprehensive API documentation (Swagger)
- ✅ Unit and integration tests
- ✅ ESLint configuration
- ✅ Development and production environments
- ✅ Hot reload in development

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Node.js API   │    │   MongoDB       │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MQTT Broker   │
                       │   (Port 1883)   │
                       └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │   IoT Devices   │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **MQTT.js** - MQTT client
- **JWT** - Authentication
- **Winston** - Logging
- **Jest** - Testing

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container deployment
- **Nginx** - Web server (production)
- **Eclipse Mosquitto** - MQTT broker

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- MongoDB (if running locally)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd mqtt-project
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Docker Deployment

1. **Using Docker Compose**
```bash
# Copy environment file
cp .env.docker .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

2. **Individual Docker builds**
```bash
# Backend
cd backend
docker build -t mqtt-backend .
docker run -p 5000:5000 mqtt-backend

# Frontend
cd frontend
docker build -t mqtt-frontend .
docker run -p 3000:3000 mqtt-frontend
```

## 📊 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:
- Development: http://localhost:5000/api-docs
- Production: https://your-domain.com/api-docs

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/register` | User registration | No |
| POST | `/login` | User authentication | No |
| GET | `/users` | List all users | Yes |
| GET | `/devices` | Get user devices | Yes |
| GET | `/devices/:id` | Get specific device | Yes |
| POST | `/resetpassword` | Reset password | No |

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test                # Run tests
npm run test:coverage   # Run with coverage
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mqtt_db
JWT_SECRET=your-super-secure-secret
JWT_EXPIRES_IN=1h
MQTT_BROKER_URL=mqtt://localhost:1883
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 📈 Monitoring & Logging

### Health Checks
- `/health` - Basic health status
- `/health/ready` - Readiness probe (checks DB and MQTT connections)

### Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- File rotation and console output
- Production-ready log format

### Metrics
- Request/response times
- Error rates
- Database connection status
- MQTT connection status

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Secure password hashing (bcrypt with 12 rounds)
- Protected routes and middleware
- Session management

### Input Validation
- Request body validation with express-validator
- SQL injection prevention
- XSS protection
- CSRF protection

### Rate Limiting
- Global rate limiting (100 requests/15 minutes)
- Authentication rate limiting (5 attempts/15 minutes)
- Configurable limits per endpoint

## 🚀 Production Deployment

### Checklist
- [ ] Update all environment variables
- [ ] Use strong JWT secrets
- [ ] Configure HTTPS/TLS
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Configure firewall rules
- [ ] Enable security headers
- [ ] Set up CI/CD pipeline

### Recommended Infrastructure
- **Load Balancer**: Nginx or AWS ALB
- **Database**: MongoDB Atlas or self-hosted replica set
- **Caching**: Redis cluster
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or similar
- **Container Orchestration**: Kubernetes or Docker Swarm

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the logs for error details

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with full security implementation
- Docker containerization
- Comprehensive API documentation
- Test suite implementation
- Production-ready configuration
