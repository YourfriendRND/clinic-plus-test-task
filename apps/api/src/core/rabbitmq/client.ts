import amqp from 'amqplib';

export function createRabbitConnection(url: string) {
  return amqp.connect(url);
}
