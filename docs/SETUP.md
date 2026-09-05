# Setup Guide

Detailed instructions to set up the AI Tourist Safety Assistant locally.

## Prerequisites

- Node.js v18+
- PostgreSQL 13+
- Redis 6+
- Git
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/surajsinghbhadouiya/ai-tourist-safety-assistant.git
cd ai-tourist-safety-assistant
```

### 2. Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Wait for services to be healthy
sleep 10

# Run migrations
docker exec tourist_safety_api npm run migrate

# Seed sample data
docker exec tourist_safety_api npm run seed
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

### 3. Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create .env file
cp .env.example .env

# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

Backend will be available at http://localhost:5000

#### Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Create .env file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at http://localhost:3000

## Configuration

### Environment Variables

**Backend** (backend/.env):
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=tourist_safety_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend** (frontend/.env):
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENV=development
```

## Database Setup

### With Docker
```bash
docker exec tourist_safety_db psql -U postgres -d tourist_safety_db -f /path/to/migrations.sql
```

### Manual PostgreSQL Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tourist_safety_db;

# Connect to database
\c tourist_safety_db

# Enable PostGIS extension
CREATE EXTENSION postgis;

# Create tables (run from migrations file)
```

## Verification

### Health Check

```bash
# API health
curl http://localhost:5000/health

# Expected response
{"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}
```

### Test Login

1. Go to http://localhost:3000
2. Register a new account
3. Login with your credentials
4. You should see the dashboard

## Stopping Services

### Docker
```bash
docker-compose down
```

### Manual
Stop each service in the terminal:
- Frontend: `Ctrl + C`
- Backend: `Ctrl + C`
- PostgreSQL: Depends on installation
- Redis: Depends on installation

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solution:
- Ensure PostgreSQL is running
- Check connection parameters in .env
- Verify database exists

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

Solution:
- Ensure Redis is running
- Check Redis host and port
- Verify Redis is accessible

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

Solution:
- Kill the process using the port
- Change the port in .env
- Use a different machine/VM

### Module Not Found

Solution:
- Run `npm install` in the affected directory
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`

## Next Steps

1. Read the [API Documentation](API.md)
2. Check the [Architecture](ARCHITECTURE.md)
3. Review the [Contributing Guidelines](CONTRIBUTING.md)
4. Join the community and start contributing!

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Join our discussions channel

Happy developing! 🚀
