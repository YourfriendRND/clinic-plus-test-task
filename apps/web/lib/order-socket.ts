import { io, type Socket } from 'socket.io-client';

export function createOrderSocket(): Socket {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN;
  const options = {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'],
  };

  return origin ? io(origin, options) : io(options);
}
