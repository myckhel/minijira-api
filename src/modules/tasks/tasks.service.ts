import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { Role } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string, userRole: Role) {
    const { projectId, ...taskData } = createTaskDto;

    // Verify project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to this project
    if (userRole !== Role.ADMIN && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // If assigneeId is provided, verify the user exists
    if (createTaskDto.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: createTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    // Get the next position for the task
    if (!taskData.position) {
      const lastTask = await this.prisma.task.findFirst({
        where: { projectId, status: taskData.status || 'TODO' },
        orderBy: { position: 'desc' },
      });
      taskData.position = lastTask ? lastTask.position + 1 : 0;
    }

    const newTask = await this.prisma.task.create({
      data: {
        ...taskData,
        projectId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Emit real-time event
    this.eventsGateway.emitTaskCreated(projectId, newTask);

    return newTask;
  }

  async findAll(filterDto: FilterTasksDto, userId: string, userRole: Role) {
    const {
      status,
      priority,
      assigneeId,
      projectId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filterDto;

    // Build where clause with proper typing
    const where: {
      deletedAt?: null;
      status?: string;
      priority?: string;
      assigneeId?: string;
      projectId?: string;
      OR?: Array<any>;
      AND?: Array<any>;
    } = {
      deletedAt: null, // Exclude soft-deleted tasks
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;

    // Build search and access control conditions properly
    // If not admin, only show tasks from user's projects or assigned to user
    if (userRole !== Role.ADMIN) {
      const accessConditions = [
        { project: { ownerId: userId } },
        { assigneeId: userId },
      ];

      if (search) {
        // Combine search with access control using AND logic
        // Note: SQLite doesn't support mode: 'insensitive', so we use contains directly
        where.AND = [
          {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          },
          { OR: accessConditions },
        ];
      } else {
        // Just access control
        where.OR = accessConditions;
      }
    } else if (search) {
      // Admin with search - just add search conditions
      // Note: SQLite doesn't support mode: 'insensitive', so we use contains directly
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Calculate pagination
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build order by with proper typing
    const orderBy: Record<string, any> = {};
    const sortByField = sortBy || 'createdAt';
    const sortOrderValue = sortOrder || 'desc';

    if (sortByField === 'project') {
      orderBy.project = { name: sortOrderValue };
    } else if (sortByField === 'assignee') {
      orderBy.assignee = { name: sortOrderValue };
    } else {
      orderBy[sortByField] = sortOrderValue;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: where as any,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: orderBy as any,
        skip,
        take: limitNum,
      }),
      this.prisma.task.count({ where: where as any }),
    ]);

    return {
      items: tasks,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    if (
      userRole !== Role.ADMIN &&
      task.project.owner.id !== userId &&
      task.assigneeId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
    userRole: Role,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to update this task
    if (
      userRole !== Role.ADMIN &&
      task.project.ownerId !== userId &&
      task.assigneeId !== userId
    ) {
      throw new ForbiddenException(
        'You can only update your own tasks or assigned tasks',
      );
    }

    // If assigneeId is being updated, verify the user exists
    if (updateTaskDto.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Emit real-time event
    this.eventsGateway.emitTaskUpdated(updatedTask.project.id, updatedTask);

    return updatedTask;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to delete this task
    if (userRole !== Role.ADMIN && task.project.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only delete tasks from your own projects',
      );
    }

    // Soft delete the task
    const deletedTask = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        title: true,
        deletedAt: true,
      },
    });

    // Emit real-time event
    this.eventsGateway.emitTaskDeleted(task.project.id, id);

    return deletedTask;
  }

  async updateTaskPositions(
    projectId: string,
    taskUpdates: Array<{ id: string; position: number; status?: string }>,
    userId: string,
    userRole: Role,
  ) {
    // Verify project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole !== Role.ADMIN && project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Update all tasks in a transaction
    const updatedTasks = await this.prisma.$transaction(
      taskUpdates.map((update) =>
        this.prisma.task.update({
          where: { id: update.id },
          data: {
            position: update.position,
            ...(update.status && { status: update.status as any }),
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        }),
      ),
    );

    // Emit real-time event for task reordering
    this.eventsGateway.emitTaskReordered(projectId, updatedTasks);

    return updatedTasks;
  }
}
