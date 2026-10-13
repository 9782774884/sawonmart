import { useCallback, useEffect, useState } from 'react';

/**
 * State that mirrors itself into localStorage.
 * Reads are defensive: private-mode / quota errors must never crash the page.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* quota exceeded or storage disabled — keep working in memory */
        }
        return resolved;
      });
    },
    [key]
  );

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return;
      try {
        setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue));
      } catch {
        /* ignore malformed cross-tab payloads */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // initialValue is intentionally excluded — it is only a fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set];
}