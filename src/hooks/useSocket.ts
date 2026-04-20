'use client';

import { useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store';
import { Message } from '@/types';

/** Listens for real-time match notifications */
export function useMatchNotifications(
  onMatch: (matchedUserId: string) => void
) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();

    socket.on('new_match', ({ matchedUserId }: { matchedUserId: string }) => {
      onMatch(matchedUserId);
    });

    return () => {
      socket.off('new_match');
    };
  }, [isAuthenticated, onMatch]);
}

/** Manages a chat room: joining, messaging, typing indicators */
export function useChatRoom(matchId: string | null) {
  const { isAuthenticated } = useAuthStore();

  const joinRoom = useCallback(() => {
    if (!matchId || !isAuthenticated) return;
    const socket = getSocket();
    socket.emit('join_match', matchId);
  }, [matchId, isAuthenticated]);

  const leaveRoom = useCallback(() => {
    if (!matchId) return;
    const socket = getSocket();
    socket.emit('leave_match', matchId);
  }, [matchId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!matchId || !content.trim()) return;
      const socket = getSocket();
      socket.emit('send_message', { matchId, content });
    },
    [matchId]
  );

  const onNewMessage = useCallback(
    (handler: (msg: Message) => void) => {
      const socket = getSocket();
      socket.on('new_message', handler);
      return () => socket.off('new_message', handler);
    },
    []
  );

  const sendTyping = useCallback(() => {
    if (!matchId) return;
    getSocket().emit('typing', matchId);
  }, [matchId]);

  const sendStopTyping = useCallback(() => {
    if (!matchId) return;
    getSocket().emit('stop_typing', matchId);
  }, [matchId]);

  const onTyping = useCallback(
    (handler: (data: { userId: string }) => void) => {
      const socket = getSocket();
      socket.on('user_typing', handler);
      socket.on('user_stop_typing', handler);
      return () => {
        socket.off('user_typing', handler);
        socket.off('user_stop_typing', handler);
      };
    },
    []
  );

  useEffect(() => {
    joinRoom();
    return () => leaveRoom();
  }, [joinRoom, leaveRoom]);

  return { sendMessage, onNewMessage, sendTyping, sendStopTyping, onTyping };
}
