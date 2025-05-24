import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from tracking
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join-project')
  handleJoinProject(
    @MessageBody() data: { projectId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`project-${data.projectId}`);
    this.userSockets.set(data.userId, client.id);
    console.log(`User ${data.userId} joined project ${data.projectId}`);
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`project-${data.projectId}`);
    console.log(`Client left project ${data.projectId}`);
  }

  // Real-time event emitters
  emitTaskCreated(projectId: string, task: any) {
    this.server.to(`project-${projectId}`).emit('task-created', task);
  }

  emitTaskUpdated(projectId: string, task: any) {
    this.server.to(`project-${projectId}`).emit('task-updated', task);
  }

  emitTaskDeleted(projectId: string, taskId: string) {
    this.server.to(`project-${projectId}`).emit('task-deleted', { id: taskId });
  }

  emitTaskReordered(projectId: string, tasks: any[]) {
    this.server.to(`project-${projectId}`).emit('tasks-reordered', tasks);
  }

  emitProjectUpdated(projectId: string, project: any) {
    this.server.to(`project-${projectId}`).emit('project-updated', project);
  }
}
