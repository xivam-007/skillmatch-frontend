'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Github, Code2, Loader2, UserX } from 'lucide-react';
import { matchApi } from '@/lib/api';
import { User } from '@/types';

function MatchCard({ match }: { match: User }) {
  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-md">
      {/* Avatar strip */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
          {match.profilePicture ? (
            <img src={match.profilePicture} alt={match.name} className="h-full w-full object-cover" />
          ) : (
            match.name[0]?.toUpperCase()
          )}
          {match.availability && (
            <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-semibold text-[var(--text)]">{match.name}</p>
          {match.bio && (
            <p className="truncate text-xs text-[var(--text-muted)]">{match.bio}</p>
          )}
        </div>
      </div>

      {/* Skills preview */}
      <div className="space-y-2 p-4 pb-3">
        {match.skillsKnown.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {match.skillsKnown.slice(0, 4).map((s) => (
              <span key={s} className="skill-pill-known">{s}</span>
            ))}
            {match.skillsKnown.length > 4 && (
              <span className="skill-pill bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                +{match.skillsKnown.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {match.githubUsername && (
            <span className="flex items-center gap-1">
              <Github className="h-3 w-3" /> {match.githubUsername}
            </span>
          )}
          {match.leetcodeHandle && (
            <span className="flex items-center gap-1">
              <Code2 className="h-3 w-3" /> {match.leetcodeHandle}
            </span>
          )}
        </div>
      </div>

      {/* Chat button */}
      <div className="px-4 pb-4">
        <Link
          href={`/chat/${match._id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </Link>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    matchApi
      .getMatches()
      .then((res) => setMatches(res.data.data.matches))
      .catch(() => setError('Failed to load matches'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Your Matches</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {matches.length > 0
            ? `${matches.length} mutual match${matches.length !== 1 ? 'es' : ''}`
            : 'Start swiping to find collaborators'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <p className="py-20 text-center text-sm text-red-500">{error}</p>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserX className="mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text)]">No matches yet</h3>
          <p className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">
            Head to Discover and swipe right on developers you'd like to collaborate with.
          </p>
          <Link
            href="/discover"
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Start discovering
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
