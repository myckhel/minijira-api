import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@minijira.com' },
    update: {},
    create: {
      email: 'admin@minijira.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@minijira.com' },
    update: {},
    create: {
      email: 'user@minijira.com',
      password: userPassword,
      name: 'Regular User',
      role: Role.USER,
    },
  });

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Sample Project',
      description: 'A sample project to demonstrate the Mini Jira Clone',
      color: '#6366f1',
      ownerId: admin.id,
    },
  });

  // Create sample tasks
  const tasks = [
    {
      title: 'Setup project infrastructure',
      description: 'Initialize the project with NestJS and Prisma',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: admin.id,
      position: 0,
    },
    {
      title: 'Implement authentication',
      description: 'Add JWT-based authentication system',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: admin.id,
      position: 1,
    },
    {
      title: 'Create task management',
      description: 'Implement CRUD operations for tasks',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: user.id,
      position: 0,
    },
    {
      title: 'Add real-time updates',
      description: 'Implement WebSocket for real-time task updates',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      position: 1,
    },
    {
      title: 'Design UI components',
      description: 'Create reusable UI components for the frontend',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: user.id,
      position: 2,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.upsert({
      where: {
        id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        id: `task-${taskData.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...taskData,
        projectId: project.id,
      },
    });
  }

  console.log('✅ Database seeding completed!');
  console.log('👤 Admin user: admin@minijira.com / admin123');
  console.log('👤 Regular user: user@minijira.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
