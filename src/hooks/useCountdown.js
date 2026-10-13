import { useEffect, useRef, useState } from 'react';
import { splitDuration } from '../utils/format.js';

/**
 * Live countdown to a deadline.
 *
 * @param {number} durationMs  How long from mount until the deadline.
 * @returns {{hours:number, minutes:number, seconds:number, isOver:boolean}}
 *
 * Notes for web standards:
 *  - The visible text changes every second, which is exactly the kind of
 *    rapidly-changing content screen readers must not read live. That is why
 *    the consumer renders it with `aria-live="off"` and announces the whole
 *    timer once via `aria-label`.
 *  - The interval is cleared on unmount to avoid setState-after-unmount.
 */
export function useCountdown(durationMs) {
  const deadlineRef = useRef(0);
  const [remaining, setRemaining] = useState(durationMs);

  // Recompute the deadline whenever the duration changes (e.g. new deal set).
  useEffect(() => {
    deadlineRef.current = Date.now() + durationMs;
    setRemaining(durationMs);

    const tick = () => {
      const left = deadlineRef.current - Date.now();
      setRemaining(left > 0 ? left : 0);
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [durationMs]);

  return { ...splitDuration(remaining), isOver: remaining === 0 };
}