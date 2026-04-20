'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { chatApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { useChatRoom } from '@/hooks/useSocket';
import { Message, User } from '@/types';
import { clsx } from 'clsx';

/** Format message timestamps */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user: me } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendMessage, onNewMessage, sendTyping, sendStopTyping, onTyping } =
    useChatRoom(matchId);

  // Load history + matched user profile
  useEffect(() => {
    if (!matchId) return;
    Promise.all([
      chatApi.getHistory(matchId),
      userApi.getById(matchId),
    ])
      .then(([msgRes, userRes]) => {
        setMessages(msgRes.data.data.messages);
        setMatchedUser(userRes.data.data.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [matchId]);

  // Real-time new messages
  useEffect(() => {
    const cleanup = onNewMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => { cleanup?.(); };
  }, [onNewMessage]);

  // Typing indicator
  useEffect(() => {
  const unsub = onTyping(({ userId }) => {
    if (userId !== me?._id) {
      setTypingUser(userId);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000);
    }
  });
  return () => { unsub?.(); };
}, [onTyping, me]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendStopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(sendStopTyping, 1500);
  };

  const getSenderId = (msg: Message) =>
    typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3">
        <Link href="/matches" className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {matchedUser && (
          <>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-sm font-bold text-white">
              {matchedUser.profilePicture ? (
                <img src={matchedUser.profilePicture} alt={matchedUser.name} className="h-full w-full object-cover" />
              ) : (
                matchedUser.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--text)]">{matchedUser.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {matchedUser.availability ? '🟢 Available for mock interviews' : 'Matched developer'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-3xl">👋</p>
            <p className="font-medium text-[var(--text)]">You're matched!</p>
            <p className="max-w-xs text-sm text-[var(--text-muted)]">
              {matchedUser
                ? `Say hello to ${matchedUser.name}. You both want to collaborate!`
                : 'Start the conversation.'}
            </p>
            {matchedUser?.skillsKnown.length ? (
              <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 dark:border-brand-700 dark:bg-brand-900/20">
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  💬 Icebreaker idea
                </p>
                <p className="mt-0.5 text-sm text-[var(--text)]">
                  "Hey! I see you know {matchedUser.skillsKnown[0]}. I've been wanting to learn that — how did you get started?"
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = getSenderId(msg) === me?._id;
              return (
                <div
                  key={msg._id}
                  className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={clsx(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                      isMine
                        ? 'rounded-tr-sm bg-brand-500 text-white'
                        : 'rounded-tl-sm bg-[var(--bg-secondary)] text-[var(--text)]'
                    )}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <p
                      className={clsx(
                        'mt-1 text-right text-[10px] opacity-70',
                        isMine ? 'text-brand-100' : 'text-[var(--text-muted)]'
                      )}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUser && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[var(--bg-secondary)] px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white transition-all hover:bg-brand-600 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
