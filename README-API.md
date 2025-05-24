# Mini Jira Clone - Backend API

A full-featured task management application backend built with NestJS, Prisma, and SQLite. This project provides a complete REST API for managing projects, tasks, and users with JWT authentication and real-time WebSocket updates.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based registration and login
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Full CRUD operations with filtering and sorting
- **Role-Based Access Control**: Admin and User roles
- **Real-Time Updates**: WebSocket support for live collaboration
- **Task Filtering**: Filter by status, priority, assignee, and project
- **Task Sorting**: Sort by various fields with pagination
- **Drag & Drop Support**: Position-based task reordering

### Technical Features
- **NestJS Framework**: Modular architecture with dependency injection
- **Prisma ORM**: Type-safe database access with migrations
- **SQLite Database**: Local development database (configurable)
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Class-validator decorators for DTOs
- **Global Error Handling**: Centralized exception filtering
- **API Response Standardization**: Consistent response format
- **Soft Deletes**: Data preservation with deleted timestamps
- **Rate Limiting**: Throttling protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- SQLite (or PostgreSQL for production)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minijira/api
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
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

4. **Generate Prisma Client**
   ```bash
   yarn prisma:generate
   ```

5. **Run database migrations**
   ```bash
   yarn prisma:migrate
   ```

6. **Seed the database** (optional)
   ```bash
   yarn prisma:seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

The API will be available at `http://localhost:3000/api/v1`

## 📊 Database Management

### Available Scripts
- `yarn prisma:generate` - Generate Prisma Client
- `yarn prisma:migrate` - Run migrations
- `yarn prisma:migrate:reset` - Reset and re-run all migrations
- `yarn prisma:studio` - Open Prisma Studio GUI
- `yarn prisma:seed` - Seed database with sample data

### Default Accounts (after seeding)
- **Admin**: `admin@minijira.com` / `admin123`
- **User**: `user@minijira.com` / `user123`

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

### Project Endpoints

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "color": "#6366f1"
}
```

#### Get All Projects
```http
GET /api/v1/projects
Authorization: Bearer <token>
```

#### Get Project by ID
```http
GET /api/v1/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PATCH /api/v1/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project
```http
DELETE /api/v1/projects/:id
Authorization: Bearer <token>
```

### Task Endpoints

#### Create Task
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2024-12-31T00:00:00Z"
}
```

#### Get All Tasks (with filtering)
```http
GET /api/v1/tasks?status=TODO&priority=HIGH&page=1&limit=20&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by task status (TODO, IN_PROGRESS, DONE)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assigneeId`: Filter by assigned user ID
- `projectId`: Filter by project ID
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort direction (asc/desc, default: desc)

#### Get Task by ID
```http
GET /api/v1/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PATCH /api/v1/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task Title",
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

#### Delete Task
```http
DELETE /api/v1/tasks/:id
Authorization: Bearer <token>
```

#### Reorder Tasks (Drag & Drop)
```http
PATCH /api/v1/tasks/projects/:projectId/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskUpdates": [
    {
      "id": "task-uuid-1",
      "position": 0,
      "status": "TODO"
    },
    {
      "id": "task-uuid-2",
      "position": 1,
      "status": "IN_PROGRESS"
    }
  ]
}
```

### User Management Endpoints

#### Get All Users (Admin only)
```http
GET /api/v1/users
Authorization: Bearer <admin-token>
```

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PATCH /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### WebSocket Events

Connect to WebSocket: `ws://localhost:3000`

#### Events to Emit:
- `join-project`: Join a project room for real-time updates
- `leave-project`: Leave a project room

#### Events to Listen:
- `task-created`: New task created in project
- `task-updated`: Task updated in project
- `task-deleted`: Task deleted from project
- `project-updated`: Project details updated

## 🏗️ Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/          # Exception filters
│   ├── guards/           # Authentication guards
│   └── interceptors/     # Response interceptors
├── config/               # Configuration files
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   ├── events/          # WebSocket events module
│   ├── projects/        # Project management module
│   ├── tasks/           # Task management module
│   └── users/           # User management module
├── prisma/              # Database service
├── app.module.ts        # Main application module
└── main.ts              # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# Test coverage
yarn test:cov

# End-to-end tests
yarn test:e2e
```

## 🔧 Environment Configuration

### Development (SQLite)
```env
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/minijira?schema=public"
```

## 🐳 Docker Support

The project includes Docker configuration for PostgreSQL and Redis:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **Role-Based Access**: Admin and user permission levels

## 📊 Database Schema

### User Model
- `id`: UUID primary key
- `email`: Unique email address
- `password`: Hashed password
- `name`: Full name
- `role`: USER or ADMIN
- `avatarUrl`: Optional profile picture
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps

### Project Model
- `id`: UUID primary key
- `name`: Project name
- `description`: Optional description
- `color`: UI color code
- `ownerId`: Reference to User
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps

### Task Model
- `id`: UUID primary key
- `title`: Task title
- `description`: Optional description
- `status`: TODO, IN_PROGRESS, DONE
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `position`: For drag & drop ordering
- `assigneeId`: Optional reference to User
- `projectId`: Reference to Project
- `dueDate`: Optional due date
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps

## 🚀 Deployment

### Environment Variables for Production
Ensure these are set in your production environment:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-secret-key>
CORS_ORIGIN=<frontend-domain>
```

### Build for Production
```bash
yarn build
yarn start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@minijira.com or create an issue in the repository.

---

**Built with ❤️ using NestJS, Prisma, and TypeScript**
