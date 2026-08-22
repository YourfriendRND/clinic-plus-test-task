import { DomainEvent } from '../rabbitmq/domain-event.enum';
import type { INotificationGateway } from '../../types/common/notification-gateway.interface';
import { OPERATORS_ROOM, TEAMS_ROOM, createTeamRoom } from './socket-room';

export function dispatchOrderEvent(
  notificationGateway: INotificationGateway,
  event: DomainEvent,
  payload: unknown,
): string[] {
  const rooms = [OPERATORS_ROOM];
  const isListSync = event === DomainEvent.OrderCreated || event === DomainEvent.OrderAssigned;

  if (isListSync) {
    rooms.push(TEAMS_ROOM);
  }

  const executorId = readExecutorId(payload);

  if (executorId && !isListSync) {
    rooms.push(createTeamRoom(executorId));
  }

  for (const room of rooms) {
    notificationGateway.emit(room, event, payload);
  }

  return rooms;
}

function readExecutorId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('executor' in payload)) {
    return null;
  }

  const executor = payload.executor;

  if (!executor || typeof executor !== 'object' || !('id' in executor)) {
    return null;
  }

  const id = executor.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}
