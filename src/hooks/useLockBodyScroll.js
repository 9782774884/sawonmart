import { useEffect } from 'react';

/**
 * Prevents background scrolling while an overlay is open.
 * Uses a counter so nested overlays (drawer -> modal) cannot unlock early.
 */
let lockCount = 0;

export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    lockCount += 1;
    document.body.classList.add('is-locked');

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.classList.remove('is-locked');
    };
  }, [locked]);
}