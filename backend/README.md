# Backend Service for MQTT Application

This is the backend service for the MQTT application. It handles user authentication, data processing from MQTT devices, and provides a RESTful API for the frontend.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB
- MQTT Broker

### Installation

1. Clone the repository.
2. Navigate to the `backend` directory: `cd backend`
3. Install the dependencies: `npm install`

### Environment Variables

Create a `.env` file in the `backend` directory and add the following environment variables. You can use the `.env.example` file as a template.

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
MQTT_BROKER_URL=mqtt://localhost:1883
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info

# Email Configuration (for password reset, etc.)
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

### Running the Application

- To run in development mode (with hot-reloading): `npm run dev`
- To run in production mode: `npm start`

The server will start on the port specified in your `.env` file (default is 5000).

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at `http://localhost:5000/api-docs`.

## Testing

To run the tests, use the following command:

```
npm test
```