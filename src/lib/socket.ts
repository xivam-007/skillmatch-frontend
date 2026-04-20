import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Returns (or lazily creates) the authenticated Socket.io client.
 * Call `disconnectSocket()` on logout.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('sm_token') : null;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () =>
      console.log('🔌 Socket connected:', socket?.id)
    );
    socket.on('connect_error', (err) =>
      console.error('Socket connection error:', err.message)
    );
    socket.on('disconnect', (reason) =>
      console.log('🔌 Socket disconnected:', reason)
    );
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
