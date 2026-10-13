/** Small pure helpers shared across components. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact' });

/** 12999 → "₹12,999" */
export const formatPrice = (value) => inr.format(value);

/** 128000 → "1.28L" — used where space is tight (e.g. price drop ticker) */
export const formatCompact = (value) => compact.format(value);

/** Discount percentage, rounded. */
export const discountPercent = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

/** "2 days 04:12:09" style breakdown from a millisecond delta. */
export const splitDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

export const pad2 = (n) => String(n).padStart(2, '0');

/** Joins class names, skipping falsy values. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Clamp a number between a min and max. */
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Builds the search-suggestion "highlight" of the matched substring. */
export const highlightMatch = (text, query) => {
  if (!query) return [{ text, hit: false }];
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [{ text, hit: false }];
  return [
    { text: text.slice(0, idx), hit: false },
    { text: text.slice(idx, idx + query.length), hit: true },
    { text: text.slice(idx + query.length), hit: false },
  ].filter((p) => p.text);
};