'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Loader2 } from 'lucide-react';
import { matchApi } from '@/lib/api';
import { User } from '@/types';

export default function ChatListPage() {
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchApi
      .getMatches()
      .then((res) => setMatches(res.data.data.matches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text)]">Messages</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle className="mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text)]">No conversations yet</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Match with developers in Discover to start chatting.
          </p>
          <Link
            href="/discover"
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Go to Discover
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <Link
              key={match._id}
              href={`/chat/${match._id}`}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 transition-colors hover:bg-[var(--border)]"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
                {match.profilePicture ? (
                  <img src={match.profilePicture} alt={match.name} className="h-full w-full object-cover" />
                ) : (
                  match.name[0]?.toUpperCase()
                )}
                {match.availability && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--bg-secondary)]" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-[var(--text)]">{match.name}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {match.skillsKnown.slice(0, 3).join(', ') || 'Tap to message'}
                </p>
              </div>
              <MessageCircle className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
