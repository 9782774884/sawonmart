import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { cx } from '../../utils/format.js';

/**
 * Horizontal product rail with prev/next controls and a progress indicator.
 *
 * Keyboard/AT notes:
 *  - The scroller is a `region` with a label, and it is focusable so users can
 *    scroll it with arrow keys.
 *  - Arrow buttons are real buttons with disabled states and accessible names.
 *  - Scroll position is mirrored into a `aria-live="off"` visual bar only;
 *    announcing scroll position would be noise.
 */
export default function Carousel({
  label,
  children,
  itemCount,
  showProgress = true,
  className = '',
  renderTrack,
}) {
  const trackRef = useRef(null);
  const [state, setState] = useState({ canPrev: false, canNext: true, progress: 0 });

  const measure = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < maxScroll - 4,
      progress: maxScroll > 0 ? Math.max(0, Math.min(1, el.scrollLeft / maxScroll)) : 0,
    });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    measure();
    el.addEventListener('scroll', measure, { passive: true });

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [itemCount, children]);

  const scrollBy = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(240, el.clientWidth * 0.82), behavior: 'smooth' });
  };

  return (
    <div className={cx('carousel', className)}>
      <div className="carousel__controls">
        <button
          type="button"
          className="carousel__arrow"
          onClick={() => scrollBy(-1)}
          disabled={!state.canPrev}
          aria-label={`${label} — pichle products dekhein`}
        >
          <Icon name="chevronLeft" size={20} />
        </button>

        <button
          type="button"
          className="carousel__arrow"
          onClick={() => scrollBy(1)}
          disabled={!state.canNext}
          aria-label={`${label} — agle products dekhein`}
        >
          <Icon name="chevronRight" size={20} />
        </button>
      </div>

      <div
        className="rail"
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {renderTrack ? renderTrack() : children}
      </div>

      {showProgress ? (
        <div className="carousel__progress" aria-hidden="true">
          <span
            className="carousel__progress-bar"
            style={{ transform: `scaleX(${Math.max(state.progress, 0.06)})` }}
          />
        </div>
      ) : null}
    </div>
  );
}