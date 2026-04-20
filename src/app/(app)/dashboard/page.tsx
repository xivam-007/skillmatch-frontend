'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Github, Code2, Star, Users, Zap, Trophy,
  CheckCircle2, TrendingUp, ExternalLink, Loader2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { integrationApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { GithubSnapshot, LeetcodeSnapshot } from '@/types';

function StatCard({ label, value, icon: Icon, color = 'brand' }: {
  label: string; value: string | number; icon: any; color?: string;
}) {
  return (
    <div className="card p-4">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const [github, setGithub] = useState<GithubSnapshot | null>(null);
  const [leetcode, setLeetcode] = useState<LeetcodeSnapshot | null>(null);
  const [loadingGh, setLoadingGh] = useState(false);
  const [loadingLc, setLoadingLc] = useState(false);
  const [availability, setAvailability] = useState(user?.availability ?? false);

  useEffect(() => {
    if (user?.githubUsername) {
      setLoadingGh(true);
      integrationApi
        .github(user.githubUsername)
        .then((res) => setGithub(res.data.data))
        .catch(() => {})
        .finally(() => setLoadingGh(false));
    }
    if (user?.leetcodeHandle) {
      setLoadingLc(true);
      integrationApi
        .leetcode(user.leetcodeHandle)
        .then((res) => setLeetcode(res.data.data))
        .catch(() => {})
        .finally(() => setLoadingLc(false));
    }
  }, [user?.githubUsername, user?.leetcodeHandle]);

  const toggleAvailability = async () => {
    const next = !availability;
    setAvailability(next);
    try {
      const res = await userApi.updateProfile({ availability: next });
      setUser(res.data.data.user);
    } catch {
      setAvailability(!next); // revert
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 text-3xl font-bold text-white">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text)]">{user.name}</h1>
            {user.bio && <p className="mt-1 text-sm text-[var(--text-muted)]">{user.bio}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.lookingFor.map((t) => (
                <span key={t} className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {t.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Availability toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
            <div>
              <p className="text-xs font-medium text-[var(--text)]">Mock interviews</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {availability ? 'Ready now' : 'Not available'}
              </p>
            </div>
            <button onClick={toggleAvailability}>
              {availability ? (
                <ToggleRight className="h-8 w-8 text-green-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-[var(--text-muted)]" />
              )}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-4 flex gap-3">
          {user.githubUsername && (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              @{user.githubUsername}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          )}
          {user.leetcodeHandle && (
            <a
              href={`https://leetcode.com/${user.leetcodeHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <Code2 className="h-3.5 w-3.5" />
              {user.leetcodeHandle}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          )}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs text-white hover:bg-brand-600 transition-colors"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Skills I know" value={user.skillsKnown.length} icon={CheckCircle2} color="brand" />
        <StatCard label="Want to learn" value={user.skillsToLearn.length} icon={TrendingUp} color="amber" />
        <StatCard label="Matches" value={user.matches.length} icon={Users} color="purple" />
        <StatCard label="Match score" value="—" icon={Star} color="green" />
      </div>

      {/* Skills section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Zap className="h-4 w-4 text-brand-500" />
            Skills I know
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsKnown.length > 0 ? (
              user.skillsKnown.map((s) => (
                <span key={s} className="skill-pill-known">{s}</span>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">None added yet</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Want to learn
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsToLearn.length > 0 ? (
              user.skillsToLearn.map((s) => (
                <span key={s} className="skill-pill-learn">{s}</span>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">None added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* GitHub snapshot */}
      {user.githubUsername && (
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Github className="h-4 w-4" />
            GitHub snapshot
          </h3>
          {loadingGh ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : github ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                  <p className="text-xl font-bold text-[var(--text)]">{github.publicRepos}</p>
                  <p className="text-xs text-[var(--text-muted)]">Repos</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                  <p className="text-xl font-bold text-[var(--text)]">{github.stars}</p>
                  <p className="text-xs text-[var(--text-muted)]">Stars</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-secondary)] p-3">
                  <p className="text-xl font-bold text-[var(--text)]">{github.followers}</p>
                  <p className="text-xs text-[var(--text-muted)]">Followers</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Top languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {github.topLanguages.map((l) => (
                    <span key={l} className="skill-pill-known">{l}</span>
                  ))}
                </div>
              </div>
              {github.pinnedRepos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Top repos</p>
                  <div className="space-y-2">
                    {github.pinnedRepos.slice(0, 3).map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{repo.name}</p>
                          {repo.description && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">{repo.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3" /> {repo.stargazerCount}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Could not load GitHub data</p>
          )}
        </div>
      )}

      {/* LeetCode snapshot */}
      {user.leetcodeHandle && (
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Trophy className="h-4 w-4 text-amber-500" />
            LeetCode stats
          </h3>
          {loadingLc ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : leetcode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-[var(--bg-secondary)] p-3 text-center">
                  <p className="text-xl font-bold text-[var(--text)]">{leetcode.totalSolved}</p>
                  <p className="text-xs text-[var(--text-muted)]">Total solved</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 text-center dark:bg-green-900/20">
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">{leetcode.easySolved}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Easy</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{leetcode.mediumSolved}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">Medium</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 text-center dark:bg-red-900/20">
                  <p className="text-xl font-bold text-red-700 dark:text-red-400">{leetcode.hardSolved}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Hard</p>
                </div>
              </div>
              {leetcode.contestRating && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Contest rating: {Math.round(leetcode.contestRating)}
                  </p>
                </div>
              )}
              {leetcode.ranking && (
                <p className="text-xs text-[var(--text-muted)]">
                  Global ranking: #{leetcode.ranking.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Could not load LeetCode data</p>
          )}
        </div>
      )}
    </div>
  );
}
