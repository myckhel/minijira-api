import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: any) {
    return this.tasksService.create(createTaskDto, user.id, user.role);
  }

  @Get()
  findAll(@Query() filterDto: FilterTasksDto, @GetUser() user: any) {
    return this.tasksService.findAll(filterDto, user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.tasksService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.tasksService.remove(id, user.id, user.role);
  }

  @Patch('projects/:projectId/reorder')
  updatePositions(
    @Param('projectId') projectId: string,
    @Body()
    body: { tasks: Array<{ id: string; position: number; status?: string }> },
    @GetUser() user: any,
  ) {
    return this.tasksService.updateTaskPositions(
      projectId,
      body.tasks,
      user.id,
      user.role,
    );
  }
}
