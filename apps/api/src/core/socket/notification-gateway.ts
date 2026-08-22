import type { IncomingMessage, Server as HttpServer, ServerResponse } from 'node:http';
import type { Request, RequestHandler, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ApplicationComponents } from '../di/application-components';
import { RoleCode } from '../../modules/auth/role-code.enum';
import type { SessionUser } from '../../modules/auth/dto/session-user';
import type { AppRedisClient } from '../../types/common/redis';
import type { INotificationGateway } from '../../types/common/notification-gateway.interface';
import { createSessionMiddleware } from '../http/session';
import { OPERATORS_ROOM, TEAMS_ROOM, createTeamRoom } from './socket-room';

type HandshakeRequest = IncomingMessage & {
  session?: { user?: SessionUser };
};

@injectable()
export class NotificationGateway implements INotificationGateway {
  private io: Server | null = null;
  private subscriber: AppRedisClient | null = null;

  public constructor(
    @inject(ApplicationComponents.Redis) private readonly redis: AppRedisClient,
  ) {}

  public async attach(httpServer: HttpServer): Promise<void> {
    const io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
      allowEIO3: false,
    });

    io.engine.on('connection_error', (error) => {
      console.warn('Socket.IO connection_error', error.message);
    });

    try {
      this.subscriber = this.redis.duplicate();
      await this.subscriber.connect();
      io.adapter(createAdapter(this.redis, this.subscriber));
      console.log('Socket.IO Redis adapter attached');
    } catch (error) {
      console.warn('Socket.IO Redis adapter unavailable, running without it', error);
    }

    const sessionMiddleware = createSessionMiddleware(this.redis);
    io.use((socket, next) => {
      this.authorize(socket.request, sessionMiddleware, next);
    });

    io.on('connection', (socket) => {
      const user = (socket.request as HandshakeRequest).session?.user;

      if (!user) {
        socket.disconnect(true);
        return;
      }

      const rooms =
        user.roleCode === RoleCode.Operator
          ? [OPERATORS_ROOM]
          : [TEAMS_ROOM, createTeamRoom(user.id)];

      void Promise.all(rooms.map((room) => socket.join(room))).then(() => {
        console.log(`Socket connected ${user.id} ${user.roleCode} rooms=${rooms.join(',')}`);
      });
    });

    this.io = io;
    console.log('Socket.IO attached');
  }

  public emit(room: string, event: string, payload: unknown): void {
    this.io?.to(room).emit(event, payload);
  }

  private authorize(
    request: IncomingMessage,
    sessionMiddleware: RequestHandler,
    next: (error?: Error) => void,
  ): void {
    const response = {
      getHeader() {
        return undefined;
      },
      setHeader() {},
      end() {},
      writeHead() {},
      cookie() {},
    } as unknown as ServerResponse;

    sessionMiddleware(request as Request, response as Response, (error?: unknown) => {
      if (error instanceof Error) {
        next(error);
        return;
      }

      const user = (request as HandshakeRequest).session?.user;

      if (!user) {
        console.warn('Socket handshake rejected: no session');
        next(new Error('Пользователь не авторизован'));
        return;
      }

      next();
    });
  }
}
