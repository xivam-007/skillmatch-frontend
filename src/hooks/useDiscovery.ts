'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDiscoveryStore } from '@/store';
import { discoverApi } from '@/lib/api';
import { LookingForType } from '@/types';

const PAGE_SIZE = 10;
const PREFETCH_THRESHOLD = 3; // fetch next page when this many cards remain

export function useDiscovery() {
  const {
    stack,
    currentIndex,
    filter,
    isLoading,
    setStack,
    appendStack,
    advanceStack,
    setFilter,
    setLoading,
    reset,
  } = useDiscoveryStore();

  const pageRef = useRef(1);
  const exhaustedRef = useRef(false);

  const currentCandidate = stack[currentIndex] ?? null;
  const remaining = stack.length - currentIndex;

  const fetchPage = useCallback(
    async (page: number) => {
      if (isLoading || exhaustedRef.current) return;
      setLoading(true);
      try {
        const res = await discoverApi.getStack({
          page,
          limit: PAGE_SIZE,
          filter,
        });
        const candidates = res.data.data.candidates;

        if (candidates.length === 0) {
          exhaustedRef.current = true;
        } else {
          page === 1 ? setStack(candidates) : appendStack(candidates);
          pageRef.current = page + 1;
        }
      } catch (err) {
        console.error('Discovery fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [filter, isLoading, setLoading, setStack, appendStack]
  );

  // Initial load + filter change
  useEffect(() => {
    pageRef.current = 1;
    exhaustedRef.current = false;
    reset();
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Prefetch when running low
  useEffect(() => {
    if (remaining <= PREFETCH_THRESHOLD && !isLoading && !exhaustedRef.current) {
      fetchPage(pageRef.current);
    }
  }, [remaining, isLoading, fetchPage]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      advanceStack();
    },
    [advanceStack]
  );

  return {
    currentCandidate,
    stack,
    currentIndex,
    remaining,
    isLoading,
    filter,
    setFilter,
    handleSwipe,
    isExhausted: exhaustedRef.current && remaining === 0,
  };
}
