'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';

interface MatchToastProps {
  matchedUser: { name: string; profilePicture?: string } | null;
  matchId: string;
  onDismiss: () => void;
}

export function MatchToast({ matchedUser, matchId, onDismiss }: MatchToastProps) {
  return (
    <AnimatePresence>
      {matchedUser && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          className="fixed left-1/2 top-20 z-50 w-80 -translate-x-1/2"
        >
          <div className="card overflow-hidden shadow-2xl">
            {/* Gradient header */}
            <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-brand-500 to-purple-600 p-6 text-center text-white">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, times: [0, 0.5, 1] }}
              >
                <Heart className="h-10 w-10 fill-white" />
              </motion.div>
              <h3 className="text-xl font-bold">It's a Match!</h3>
              <p className="text-sm opacity-90">
                You and <strong>{matchedUser.name}</strong> both swiped right
              </p>
            </div>

            {/* Avatar */}
            <div className="flex justify-center -mt-8 mb-0">
              <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-[var(--card)] bg-brand-400 text-xl font-bold text-white flex items-center justify-center">
                {matchedUser.profilePicture ? (
                  <img src={matchedUser.profilePicture} alt={matchedUser.name} className="h-full w-full object-cover" />
                ) : (
                  matchedUser.name[0]?.toUpperCase()
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 pt-2">
              <Link
                href={`/chat/${matchId}`}
                onClick={onDismiss}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                <MessageCircle className="h-4 w-4" />
                Say Hello
              </Link>
              <button
                onClick={onDismiss}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
