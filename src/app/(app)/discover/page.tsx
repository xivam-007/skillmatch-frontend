'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, RefreshCw, Loader2, Compass, Sparkles, X, Heart } from 'lucide-react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useMatchNotifications } from '@/hooks/useSocket';
import { matchApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SwipeCard } from '@/components/cards/SwipeCard';
import { MatchToast } from '@/components/cards/MatchToast';
import { Button } from '@/components/ui/Button';
import { LookingForType, User } from '@/types';

const FILTER_OPTIONS: { value: LookingForType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'peer_coding', label: 'Peer Coding' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'project_building', label: 'Projects' },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentCandidate,
    stack,
    currentIndex,
    isLoading,
    filter,
    setFilter,
    handleSwipe,
    isExhausted,
  } = useDiscovery();

  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchId, setMatchId] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user && user.skillsToLearn.length === 0 && user.skillsKnown.length === 0) {
      router.push('/onboarding');
    }
  }, [mounted, isAuthenticated, user, router]);

  useMatchNotifications(
    useCallback(
      async (matchedUserId: string) => {
        try {
          const res = await userApi.getById(matchedUserId);
          setMatchedUser(res.data.data.user);
          setMatchId(matchedUserId);
        } catch { /* silently fail */ }
      },
      []
    )
  );



  const handleSwipeAction = async (direction: 'left' | 'right') => {
    if (!currentCandidate) return;
    const targetId = currentCandidate.user._id;
    handleSwipe(direction);

    if (direction === 'right') {
      try {
        const res = await matchApi.swipe(targetId, 'right');
        const result = res.data.data;
        if (result.matched && result.matchedUserId) {
          const userRes = await userApi.getById(result.matchedUserId);
          setMatchedUser(userRes.data.data.user);
          setMatchId(result.matchedUserId);
        }
      } catch { /* Non-blocking */ }
    } else {
      try { await matchApi.swipe(targetId, 'left'); } catch { /* Non-blocking */ }
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-8 md:py-12">
        {/* Match Notification */}
        <MatchToast
          matchedUser={matchedUser}
          matchId={matchId}
          onDismiss={() => setMatchedUser(null)}
        />

        {/* Discovery Header */}
        <div className="mb-8 w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Discovery</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Find your next collaborator</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-2">
            {FILTER_OPTIONS.map(({ value, label }) => {
              const isActive = (filter ?? 'all') === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value === 'all' ? undefined : value)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card Stack Area */}
        <div className="relative flex h-[620px] w-full flex-col items-center justify-center">
          {isLoading && !currentCandidate ? (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium animate-pulse">Curating matches for you...</p>
            </div>
          ) : isExhausted ? (
            <div className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl dark:bg-slate-800">
                🚀
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                You've reached the end!
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                You've seen all potential matches for now. Try changing your filters or check back later!
              </p>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 px-8 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:border-slate-700"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => setFilter(filter)}
              >
                Refresh Stack
              </Button>
            </div>
          ) : (
            <>
              {/* Stack Rendering */}
              <div className="relative h-full w-full">
                {[2, 1, 0].map((depthOffset) => {
                  const cardIndex = currentIndex + depthOffset;
                  const candidate = stack[cardIndex];
                  if (!candidate) return null;
                  return (
                    <SwipeCard
                      key={candidate.user._id}
                      candidate={candidate}
                      onSwipe={handleSwipeAction}
                      isTop={depthOffset === 0}
                      depth={depthOffset}
                    />
                  );
                })}
              </div>

              {/* Action Buttons Layer (Visible only when cards exist) */}
              <div className="absolute -bottom-6 flex gap-6 z-50">
                <button
                  onClick={() => handleSwipeAction('left')}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-500 shadow-xl border border-slate-100 transition-transform active:scale-90 dark:bg-slate-900 dark:border-slate-800"
                >
                  <X className="h-8 w-8" strokeWidth={3} />
                </button>
                <button
                  onClick={() => handleSwipeAction('right')}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 transition-transform active:scale-90 dark:shadow-none"
                >
                  <Heart className="h-8 w-8 fill-current" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Swipe Hint Footer */}
        {currentCandidate && !isExhausted && (
          <div className="mt-16 flex flex-col items-center gap-2">
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              <span className="flex items-center gap-1.5"><X className="h-3 w-3" /> Swipe Left to Pass</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center gap-1.5 text-indigo-500">Swipe Right to Match <Heart className="h-3 w-3 fill-current" /></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}