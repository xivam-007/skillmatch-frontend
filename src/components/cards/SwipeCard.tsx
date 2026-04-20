'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { Heart, X, Star, Github, Code2 } from 'lucide-react';
import { DiscoveryCandidate } from '@/types';
import { clsx } from 'clsx';

interface SwipeCardProps {
  candidate: DiscoveryCandidate;
  onSwipe: (direction: 'left' | 'right') => void;
  /** Whether this card is the topmost in the stack */
  isTop: boolean;
  /** Stack depth (0 = top card) for visual layering */
  depth: number;
}

const SWIPE_THRESHOLD = 120; // px from center before confirming swipe
const ROTATION_FACTOR = 15; // max degrees of rotation

const ICEBREAKERS: Record<string, string> = {
  React: 'Built any cool hooks lately?',
  'Node.js': "REST or GraphQL — what's your take?",
  Python: "Favourite library you've discovered recently?",
  'LeetCode / DSA': "What's the trickiest problem you've solved?",
  'System Design': 'How would you design a URL shortener?',
  Docker: 'Docker Compose or Kubernetes for small projects?',
};

function getIcebreaker(sharedSkills: string[]): string | null {
  for (const skill of sharedSkills) {
    if (ICEBREAKERS[skill]) return ICEBREAKERS[skill];
  }
  return null;
}

export function SwipeCard({ candidate, onSwipe, isTop, depth }: SwipeCardProps) {
  const { user, matchScore, sharedSkills, complementarySkills } = candidate;
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_FACTOR, 0, ROTATION_FACTOR]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const icebreaker = getIcebreaker(sharedSkills);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      const direction = offset > 0 ? 'right' : 'left';
      // Animate off-screen
      animate(x, direction === 'right' ? 600 : -600, {
        duration: 0.3,
        onComplete: () => onSwipe(direction),
      });
    } else {
      // Snap back to center
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    animate(x, direction === 'right' ? 600 : -600, {
      duration: 0.3,
      onComplete: () => onSwipe(direction),
    });
  };

  // Non-top cards are shown as static background layers
  if (!isTop) {
    return (
      <div
        className="card absolute inset-0 shadow-sm"
        style={{
          transform: `translateY(${depth * 8}px) scale(${1 - depth * 0.04})`,
          zIndex: 10 - depth,
        }}
      />
    );
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ x, rotate, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      className="swipe-card card absolute inset-0 z-20 flex flex-col overflow-hidden shadow-xl"
    >
      {/* LIKE / NOPE overlays */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-6 top-8 z-30 rotate-[-20deg] rounded-lg border-4 border-green-500 px-4 py-2"
      >
        <span className="text-2xl font-black text-green-500">MATCH</span>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-6 top-8 z-30 rotate-[20deg] rounded-lg border-4 border-red-500 px-4 py-2"
      >
        <span className="text-2xl font-black text-red-500">NOPE</span>
      </motion.div>

      {/* Card header / avatar */}
      <div className="relative flex items-center gap-4 border-b border-[var(--border)] p-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name[0]?.toUpperCase()
          )}
          {user.availability && (
            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[var(--card)]" title="Available for mock interviews" />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <h2 className="truncate text-lg font-semibold text-[var(--text)]">{user.name}</h2>
          {user.bio && (
            <p className="truncate text-sm text-[var(--text-muted)]">{user.bio}</p>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
            {user.githubUsername && (
              <span className="flex items-center gap-1">
                <Github className="h-3 w-3" />
                {user.githubUsername}
              </span>
            )}
            {user.leetcodeHandle && (
              <span className="flex items-center gap-1">
                <Code2 className="h-3 w-3" />
                {user.leetcodeHandle}
              </span>
            )}
          </div>
        </div>

        {/* Match score badge */}
        <div className="flex flex-col items-center rounded-xl bg-brand-50 px-3 py-2 dark:bg-brand-900/30">
          <Star className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{matchScore}</span>
          <span className="text-[10px] text-brand-500">score</span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {sharedSkills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              They can teach you
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sharedSkills.slice(0, 6).map((s) => (
                <span key={s} className="skill-pill-known">{s}</span>
              ))}
            </div>
          </div>
        )}

        {complementarySkills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              You can teach them
            </p>
            <div className="flex flex-wrap gap-1.5">
              {complementarySkills.slice(0, 6).map((s) => (
                <span key={s} className="skill-pill-learn">{s}</span>
              ))}
            </div>
          </div>
        )}

        {user.skillsKnown.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Their skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsKnown.slice(0, 8).map((s) => (
                <span
                  key={s}
                  className={clsx(
                    'skill-pill',
                    sharedSkills.includes(s)
                      ? 'skill-pill-known'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]'
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Icebreaker prompt */}
        {icebreaker && (
          <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-900/20">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
              💬 Icebreaker
            </p>
            <p className="mt-0.5 text-sm text-[var(--text)]">{icebreaker}</p>
          </div>
        )}

        {/* Looking for */}
        {user.lookingFor.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {user.lookingFor.map((type) => (
              <span
                key={type}
                className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs text-[var(--text-muted)] border border-[var(--border)]"
              >
                {type.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 border-t border-[var(--border)] p-4">
        <button
          onClick={() => triggerSwipe('left')}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-300 bg-white text-red-500 shadow-sm transition-all hover:scale-110 hover:border-red-500 hover:shadow-md dark:bg-[var(--bg-secondary)]"
          aria-label="Pass"
        >
          <X className="h-6 w-6" />
        </button>

        <button
          onClick={() => triggerSwipe('right')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
          aria-label="Match"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>
    </motion.div>
  );
}
