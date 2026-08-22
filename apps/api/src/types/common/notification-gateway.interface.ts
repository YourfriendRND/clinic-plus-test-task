import type { Server as HttpServer } from 'node:http';

export interface INotificationGateway {
  attach(httpServer: HttpServer): Promise<void>;
  emit(room: string, event: string, payload: unknown): void;
}
