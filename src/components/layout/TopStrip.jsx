import { useEffect, useState } from 'react';
import { TOP_STRIP } from '../../data/site.js';

/**
 * Thin announcement bar above the header.
 * The message rotates, but it is `aria-hidden` because it carries no
 * information the page does not repeat elsewhere.
 */
export default function TopStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % TOP_STRIP.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="top-strip">
      <div className="container top-strip__inner">
        <p className="top-strip__text" aria-hidden="true">
          <span className="top-strip__bolt">★</span>
          {TOP_STRIP[index]}
        </p>

        {/* Screen readers get the full list once instead of a rotating fragment. */}
        <ul className="sr-only">
          {TOP_STRIP.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>

        <ul className="top-strip__links" aria-label="Quick links">
          <li>
            <a href="#download">Download App</a>
          </li>
          <li>
            <a href="#become-seller">Become a Seller</a>
          </li>
          <li>
            <a href="#help">Help</a>
          </li>
        </ul>
      </div>
    </div>
  );
}