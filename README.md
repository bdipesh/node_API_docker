# Node.js REST API with Docker

A production-ready RESTful API built with Node.js and Express, containerised with Docker for seamless deployment and scalability.



## ✨ Features

- **RESTful API Architecture**: Clean and intuitive API endpoints
- **Docker Containerization**: Consistent development and production environments
- **Environment Configuration**: Secure configuration management with environment variables
- **Error Handling**: Comprehensive error handling middleware
- **Logging**: Structured logging for debugging and monitoring
- **CORS Enabled**: Cross-Origin Resource Sharing support
- **Health Checks**: Built-in health check endpoints for monitoring
- **Hot Reload**: Development environment with automatic server restart

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Containerization**: Docker & Docker Compose
- **Package Manager**: npm
- **Process Manager**: PM2 (optional for production)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker Desktop
- Git

### Local Development (Without Docker)

```bash
# Clone the repository
git clone https://github.com/bdipesh/node_API_docker.git
cd node_API_docker

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Docker Development

```bash
# Build and start containers
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -t node-api:prod -f Dockerfile.prod .

# Run production container
docker run -p 3000:3000 --env-file .env node-api:prod
```

## 🐳 Docker Implementation

### Multi-Stage Docker Build

This project uses Docker multi-stage builds to optimise image size and security:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Benefits:**
- **Smaller Image Size**: Only production dependencies are included
- **Security**: Alpine Linux base reduces attack surface
- **Layer Caching**: Faster rebuilds by caching dependencies
- **Clean Production Build**: No development tools in final image

### Docker Compose Architecture

The `docker-compose.yml` orchestrates multiple services:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

**Key Features:**
- **Service Isolation**: Each component runs in its own container
- **Volume Persistence**: Data persists across container restarts
- **Network Isolation**: Services communicate through Docker networks
- **Auto-Restart**: Containers automatically restart on failure

### Docker Best Practices Implemented

1. **Alpine Linux Base Image**: Reduces image size from ~900MB to ~150MB
2. **Non-Root User**: Containers run with limited privileges for security
3. **Multi-Stage Builds**: Separates build and runtime environments
4. **Layer Optimization**: Dependencies copied before application code
5. **.dockerignore**: Excludes unnecessary files from the image
6. **Health Checks**: Docker monitors application health
7. **Environment Variables**: Secrets managed externally
8. **Minimal Dependencies**: Only production packages included

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T12:00:00.000Z",
  "uptime": 3600
}
```

#### Get All Items
```http
GET /api/v1/items
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Item 1",
      "createdAt": "2025-10-07T12:00:00.000Z"
    }
  ]
}
```

## 🏗 Project Structure

```
node_API_docker/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── utils/           # Helper functions
│   └── config/          # Configuration files
├── tests/               # Test files
├── logs/                # Application logs
├── .dockerignore        # Docker ignore file
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore file
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker build instructions
├── package.json         # Node.js dependencies
└── server.js            # Application entry point
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# Database (if applicable)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secret

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

## 🎯 Best Practices

### Code Quality
- **ESLint**: Code linting for consistency
- **Prettier**: Automatic code formatting
- **Error Handling**: Centralized error handling middleware
- **Validation**: Input validation using express-validator
- **Security Headers**: Helmet.js for HTTP security

### Docker Best Practices
- **Image Size Optimization**: Multi-stage builds reduce final image size
- **Security Scanning**: Regular vulnerability scans with `docker scan`
- **Resource Limits**: Memory and CPU constraints defined
- **Health Checks**: Container health monitoring
- **Logging**: Proper log management and rotation

### API Design
- **RESTful Conventions**: Standard HTTP methods and status codes
- **Versioning**: API versioning for backward compatibility
- **Pagination**: Large datasets paginated
- **Rate Limiting**: Prevents API abuse
- **Documentation**: Clear API documentation

### Development Workflow
- **Git Flow**: Feature branches and pull requests
- **Commit Conventions**: Conventional commits format
- **Code Reviews**: Mandatory PR reviews
- **CI/CD**: Automated testing and deployment


## 📊 Monitoring & Logging

### Application Logs
Logs are stored in the `logs/` directory and include:
- Access logs (HTTP requests)
- Error logs (application errors)
- Combined logs (all activity)

### Docker Logs
```bash
# View container logs
docker-compose logs api

# Follow logs in real-time
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100 api
```

## 🚀 Deployment

### Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag node-api:latest yourusername/node-api:latest

# Push to Docker Hub
docker push yourusername/node-api:latest
```

### Cloud Deployment

**AWS ECS / Azure Container Instances / Google Cloud Run**
```bash
# Build for production
docker build -t node-api:prod -f Dockerfile.prod .

# Deploy using cloud-specific CLI
# (Follow cloud provider documentation)
```

### Environment-Specific Configurations

- **Development**: Hot reload, verbose logging
- **Staging**: Production-like, with debugging enabled
- **Production**: Optimized, minimal logging, security hardened

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👤 Author

**Dipesh Basnet**

- GitHub: [@bdipesh](https://github.com/bdipesh)
- LinkedIn: [Connect in LinkedIn](https://linkedin.com/in/bdipesh)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Docker community for containerization best practices
- Node.js community for continuous support



**⭐ If you find this project helpful, please consider giving it a star!**
