import type { DomainEvent } from '../../core/rabbitmq/domain-event.enum';

export interface IEventBus {
  connect(): Promise<void>;
  publish(event: DomainEvent, payload: unknown): Promise<void>;
}
