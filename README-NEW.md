# Mini Jira Clone - Backend API

A modern task management API built with NestJS, Prisma, and PostgreSQL. This is the backend for a Mini Jira Clone application with features like user authentication, project management, task CRUD operations, real-time updates, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt

- **Project Management**
  - Create, read, update, delete projects
  - Project ownership and access control
  - Color-coded projects

- **Task Management**
  - Full CRUD operations for tasks
  - Task status tracking (TODO, IN_PROGRESS, DONE)
  - Priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Task assignment to users
  - Due date management
  - Drag-and-drop positioning

- **Real-time Updates**
  - WebSocket integration for live updates
  - Real-time task and project changes
  - Live collaboration features

- **Advanced Features**
  - Soft deletes for data integrity
  - Global exception handling
  - Request validation and transformation
  - API response standardization
  - Rate limiting and security

## 🛠 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Real-time**: Socket.IO
- **Validation**: class-validator & class-transformer
- **Security**: Helmet, CORS, Throttling

## 📋 Prerequisites

- Node.js 18+ 
- Yarn or npm
- PostgreSQL (or Docker)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Install dependencies
yarn install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Update the database URL and other settings
nano .env
```

### 3. Database Setup

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Update .env with:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minijira?schema=public"
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb minijira

# Update .env with your local database URL
```

### 4. Database Migration & Seeding

```bash
# Generate Prisma client
yarn prisma:generate

# Run database migrations
yarn prisma:migrate

# Seed the database with sample data
yarn prisma:seed
```

### 5. Start the Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

The API will be available at `http://localhost:3000/api/v1`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### User Endpoints

```
GET    /api/v1/users/me
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Project Endpoints

```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Task Endpoints

```
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
PATCH  /api/v1/tasks/projects/:projectId/reorder
```

### Query Parameters for Tasks

```
GET /api/v1/tasks?status=TODO&priority=HIGH&assigneeId=123&page=1&limit=20
```

## 🔒 Default Users (After Seeding)

- **Admin**: admin@minijira.com / admin123
- **User**: user@minijira.com / user123

## 🌍 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/minijira?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App Config
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## 🚀 Deployment

### Using Docker

```bash
# Build and run with Docker
docker build -t minijira-api .
docker run -p 3000:3000 --env-file .env minijira-api
```

## 📄 License

This project is licensed under the MIT License.
