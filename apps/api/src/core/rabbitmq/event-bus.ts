import { inject, injectable } from 'inversify';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { ApplicationComponents } from '../di/application-components';
import { getRabbitMqUrl } from '../config/env';
import type { IEventBus } from '../../types/common/event-bus.interface';
import type { INotificationGateway } from '../../types/common/notification-gateway.interface';
import { dispatchOrderEvent } from '../socket/dispatch-order-event';
import { createRabbitConnection } from './client';
import { DomainEvent } from './domain-event.enum';

const EXCHANGE = 'clinic.events';
const QUEUE = 'clinic.events.consume';
const ROUTING_KEY = 'order.#';
const RECONNECT_MS = 5000;

@injectable()
export class EventBus implements IEventBus {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connecting = false;

  public constructor(
    @inject(ApplicationComponents.NotificationGateway)
    private readonly notificationGateway: INotificationGateway,
  ) {}

  public async connect(): Promise<void> {
    if (this.connecting || this.channel) {
      return;
    }

    this.connecting = true;

    try {
      const connection = await createRabbitConnection(getRabbitMqUrl());
      const channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      await channel.assertQueue(QUEUE, { durable: true });
      await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
      await channel.prefetch(10);
      await channel.consume(QUEUE, (message) => this.onMessage(channel, message));

      connection.on('error', (error) => {
        console.warn('RabbitMQ connection error', error);
      });
      connection.on('close', () => {
        this.drop();
        this.scheduleReconnect();
      });

      this.connection = connection;
      this.channel = channel;
      console.log(`RabbitMQ connected (${EXCHANGE} / ${QUEUE})`);
    } catch (error) {
      console.warn('RabbitMQ unavailable, HTTP continues without events', error);
      this.drop();
      this.scheduleReconnect();
    } finally {
      this.connecting = false;
    }
  }

  public async publish(event: DomainEvent, payload: unknown): Promise<void> {
    if (!this.channel) {
      console.warn(`RabbitMQ skip publish ${event}: no connection`);
      return;
    }

    try {
      const body = Buffer.from(
        JSON.stringify({
          type: event,
          payload,
          occurredAt: new Date().toISOString(),
        }),
      );

      this.channel.publish(EXCHANGE, event, body, {
        persistent: true,
        contentType: 'application/json',
      });
    } catch (error) {
      console.warn(`RabbitMQ publish failed ${event}`, error);
    }
  }

  private onMessage(channel: Channel, message: ConsumeMessage | null): void {
    if (!message) {
      return;
    }

    try {
      const envelope = parseEnvelope(message.content.toString());

      if (!envelope) {
        console.warn(`RabbitMQ event ${message.fields.routingKey}: invalid payload`);
        return;
      }

      const rooms = dispatchOrderEvent(this.notificationGateway, envelope.type, envelope.payload);
      console.log(`RabbitMQ event ${envelope.type} => ${rooms.join(',')}`);
    } catch (error) {
      console.warn(`RabbitMQ event ${message.fields.routingKey} dispatch failed`, error);
    } finally {
      channel.ack(message);
    }
  }

  private drop(): void {
    this.channel = null;
    this.connection = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, RECONNECT_MS);
  }
}

function parseEnvelope(raw: string): { type: DomainEvent; payload: unknown } | null {
  try {
    const body: unknown = JSON.parse(raw);

    if (!body || typeof body !== 'object' || !('type' in body) || !('payload' in body)) {
      return null;
    }

    if (!isDomainEvent(body.type)) {
      return null;
    }

    return { type: body.type, payload: body.payload };
  } catch {
    return null;
  }
}

function isDomainEvent(value: unknown): value is DomainEvent {
  return Object.values(DomainEvent).some((event) => event === value);
}
