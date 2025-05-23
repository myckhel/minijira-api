You are a senior TypeScript programmer with experience in the NestJS framework and Prisma ORM, with a preference for clean programming and design patterns.

Generate code, corrections, and refactorings that comply with the basic principles and nomenclature for a Mini Jira Clone API.

## Project Stack

- **Backend:** NestJS (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL or SQLite (configurable)
- **Authentication:** JWT

## Specific to NestJS + Prisma

### Basic Principles

- Use modular architecture with clear separation of concerns
- Follow Domain-Driven Design (DDD) principles
- Implement SOLID principles throughout the codebase
- Use dependency injection consistently
- Apply proper error handling and validation

### Project Structure

- Encapsulate the API in feature modules:
  - **Auth Module**: User registration, login, JWT authentication
  - **Users Module**: User management and profiles
  - **Tasks Module**: Task CRUD operations, status/priority management

### Module Organization

Each module should contain:

- **Controller**: Handle HTTP requests and responses
  - Use proper HTTP status codes (201, 200, 404, 400, 401, 403)
  - Implement request validation using DTOs
  - Apply guards for authentication and authorization
- **Service**: Business logic and data operations
  - Use Prisma Client for database operations
  - Implement proper transaction handling for complex operations
  - Handle business rule validation
- **DTOs**: Data Transfer Objects with class-validator
  - Create separate DTOs for create, update, and response operations
  - Use proper validation decorators (@IsEmail, @IsString, @IsEnum, etc.)
  - Implement transform decorators where needed
- **Entities**: Prisma schema models (defined in schema.prisma)
- **Guards**: Authentication (JWT) and authorization logic
- **Interceptors**: Response transformation and logging

### Core Module Structure

- **Global Exception Filter**: Centralized error handling
- **Global Validation Pipe**: Automatic DTO validation
- **JWT Strategy**: Passport JWT authentication
- **Guards**:
  - JwtAuthGuard for protected routes
  - RolesGuard for role-based access control
- **Interceptors**:
  - ResponseInterceptor for consistent API responses
  - LoggingInterceptor for request/response logging

### Prisma Best Practices

- Use Prisma Client for all database operations
- Implement proper relations between User, Task, and Project entities
- Use Prisma transactions for complex operations
- Implement soft deletes where appropriate
- Use Prisma enums for status and priority fields
- Follow Prisma naming conventions (camelCase for fields)

### Authentication & Authorization

- Implement JWT-based authentication
- Use bcrypt for password hashing
- Create role-based access control (USER, ADMIN)
- Protect routes with JwtAuthGuard
- Implement proper token refresh mechanism

### API Design

- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Implement pagination for list endpoints
- Use query parameters for filtering and sorting
- Return consistent response formats
- Include proper API versioning (/api/v1)

### Error Handling

- Implement global exception filter
- Return structured error responses
- Handle Prisma-specific errors (P2002, P2025, etc.)

### Environment & Configuration

- Use @nestjs/config for environment management
- Validate environment variables on startup
- Use .env files for local development
- Implement proper configuration for different environments

<!-- ### Testing

- Write unit tests for services using Jest
- Create integration tests for controllers
- Mock Prisma Client in tests
- Use Test Database for integration tests
- Implement proper test setup and teardown -->

### Code Style

- Use TypeScript strict mode
- Follow consistent naming conventions
- Use proper type definitions
- Implement interfaces for contracts
- Use enums for fixed value sets
- Apply proper code formatting with Prettier
- Use ESLint for code quality

### Security

- Validate all inputs using class-validator
- Sanitize user inputs
- Implement rate limiting
- Use CORS properly
- Secure JWT tokens
- Implement proper password policies
- Use HTTPS in production

### Performance

- Implement proper database indexing
- Use Prisma select for specific fields
- Implement caching where appropriate
- Use proper pagination for large datasets
- Optimize database queries
- Implement connection pooling

Generate code following these principles and ensure all implementations are production-ready with proper error handling, validation, and security measures.
