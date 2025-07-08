# Inventory Management System

A full-stack inventory management system built with Express.js, MongoDB, and React.

## Features

- User authentication with JWT
- CRUD operations for inventory items
- Protected routes
- Rate limiting
- Logging
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_db
MONGODB_USER=
MONGODB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined
```

## Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh JWT token

### Inventory
- GET /api/inventory - Get all inventory items
- GET /api/inventory/:id - Get a single inventory item
- POST /api/inventory - Create a new inventory item
- PUT /api/inventory/:id - Update an inventory item
- DELETE /api/inventory/:id - Delete an inventory item

## Testing

Run tests:
```bash
npm test
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Environment-based configuration
- Input validation
- Error handling
- Logging

## License

MIT 