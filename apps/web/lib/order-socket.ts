import { io, type Socket } from 'socket.io-client';

export function createOrderSocket(): Socket {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN;

  if (!origin) {
    throw new Error('NEXT_PUBLIC_API_ORIGIN is not set');
  }

  return io(origin, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'],
  });
}
