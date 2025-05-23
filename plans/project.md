# Mini Jira Clone – Backend Development Plan

## 1. Project Architecture Overview

**Layered Modular Design (NestJS + Prisma, DDD-inspired):**

- **Modules:**  
  - `auth` (JWT, registration, login)
  - `users` (user management)
  - `tasks` (CRUD, status/priority, filtering)
  - `projects` (CRUD, project-level permissions)
  - `websockets`
- **Controllers:** Handle HTTP requests, validation, and response formatting.
- **Services:** Encapsulate business logic, interact with Prisma Client.
- **DTOs:** Define and validate request/response shapes.
- **Guards:** JWT authentication, role-based access.
- **Interceptors/Filters:** Logging, error handling, response shaping.
- **Prisma:** Data access layer, schema-driven.

**Reasoning:**  
This structure enforces separation of concerns, scalability, and testability. Each feature is encapsulated, following SOLID and DDD principles.

### Core Modules Structure

````typescript
src/
├── common/                    # Shared utilities and constants
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/                    # Configuration management
├── database/                  # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── modules/
│   ├── auth/                 # Authentication & Authorization
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
│   ├── users/                # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   ├── tasks/                # Task CRUD operations
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   └── dto/
│   ├── projects/             # Project management
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── projects.module.ts
│   │   └── dto/
├── prisma/                   # Prisma service
│   └── prisma.service.ts
└── main.ts                   # Application bootstrap
````

## 2. API Endpoint Definitions

**Auth**
- `POST /api/v1/auth/register` – Register user
- `POST /api/v1/auth/login` – Login, returns JWT

**Users**
- `GET /api/v1/users/me` – Get current user profile
- `GET /api/v1/users/:id` – Get user by ID (admin)
- `PATCH /api/v1/users/:id` – Update user (self or admin)
- `DELETE /api/v1/users/:id` – Delete user (admin)

**Tasks**
- `GET /api/v1/tasks` – List tasks (filter by status, priority, project, pagination)
- `POST /api/v1/tasks` – Create task
- `GET /api/v1/tasks/:id` – Get task by ID
- `PATCH /api/v1/tasks/:id` – Update task
- `DELETE /api/v1/tasks/:id` – Delete task

**Projects**
- `GET /api/v1/projects` – List projects
- `POST /api/v1/projects` – Create project
- `GET /api/v1/projects/:id` – Get project by ID
- `PATCH /api/v1/projects/:id` – Update project
- `DELETE /api/v1/projects/:id` – Delete project

### Query Parameters for Filtering
```typescript
// Task filtering examples
GET /api/v1/tasks?status=TODO&priority=HIGH&assigneeId=123
GET /api/v1/tasks?projectId=456&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

## 3. Authentication & Authorization

- **JWT Authentication:**  
  - Secure endpoints with `JwtAuthGuard`
  - Use JWT for authentication (@nestjs/jwt)
  - Store hashed passwords (bcrypt)
- **Role-Based Access Control:**  
  - Roles: `USER`, `ADMIN`
  - Use `RolesGuard` for admin-only endpoints
- **Token Refresh:**  
  - (Optional) Implement refresh tokens for session longevity

---

## 4. Database Schema Design (Prisma)

**Entities:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  tasks     Task[]   @relation("AssignedTasks")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  assigneeId  String?
  assignee    User?      @relation("AssignedTasks", fields: [assigneeId], references: [id])
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id])
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?
}

model Project {
  id        String   @id @default(uuid())
  name      String
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

---

## 5. Best Practices

- **Validation:**  
  - Use `class-validator` in DTOs for all inputs.
- **Error Handling:**  
  - Global exception filter for consistent error responses.
  - Handle Prisma errors (e.g., unique constraint, not found).
- **Testing:**  
  - Unit tests for services (Jest)
  - Integration tests for controllers (supertest)
  - Mock Prisma in tests
- **Caching:**  
  - Use in-memory caching (e.g., NestJS CacheModule) for frequently accessed data (optional).
- **Security:**  
  - Hash passwords with bcrypt.
  - Use helmet, CORS, and rate limiting.
  - Validate and sanitize all inputs.
- **Performance:**  
  - Use Prisma `select` for minimal data fetching.
  - Paginate all list endpoints.
  - Add DB indexes on foreign keys and frequently queried fields.

---

## 6. More Features

- **Real-time Updates:**  
  - WebSocket gateway for live task/project updates.
- **Kanban Drag-and-Drop:**  
  - API endpoints for reordering tasks/status.

---

## 7. CI/CD & Deployment Suggestions

- **CI:**  
  - GitHub Actions:  
    - Lint, type-check, run tests on PRs.
- **CD:**  
  - Deploy to Render.
  - Use environment variables for secrets.
  - Run DB migrations on deploy.
- **Docs:**  
  - Postman.

---

## 8. Stack Recommendations

- **Backend:** NestJS (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL (prod), SQLite (dev/test)
- **Auth:** nestjs JWT
- **Realtime:** WebSockets (via @nestjs/websockets)
- **Validation:** class-validator/class-transformer
- **Testing:** Jest
- **Deployment:** Render
- **Frontend:** React Vite (separate repo)

---

**Summary:**  
This plan ensures a robust, scalable, and maintainable backend for a Mini Jira Clone, following modern best practices and clean architecture principles. Each module is isolated, security is prioritized, and the stack is optimized for developer productivity and production readiness.