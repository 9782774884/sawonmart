import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { BANNERS } from '../../data/site.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { cx } from '../../utils/format.js';

const AUTO_PLAY_MS = 5000;

/**
 * Homepage hero carousel.
 *
 * Accessibility contract:
 *  - A labelled `region` landmark with aria-roledescription="carousel".
 *  - Each slide is a real <section>, not a CSS-only overlay, so its heading
 *    stays in the accessibility tree.
 *  - Dot buttons expose aria-current; slide position is announced politely.
 *  - Autoplay pauses on hover/focus and is disabled entirely when the user
 *    prefers reduced motion.
 *  - Inactive slides are removed from the tab order via `inert`.
 */
export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const timerRef = useRef(null);

  const count = BANNERS.length;

  const goTo = useCallback((next) => setIndex(((next % count) + count) % count), [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* ---- autoplay ---- */
  useEffect(() => {
    if (paused || reduceMotion) return undefined;

    timerRef.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timerRef.current);
  }, [paused, reduceMotion, count]);

  /* ---- keyboard: arrows navigate the carousel ---- */
  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  };

  return (
    <section
      className="hero"
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <h2 className="sr-only" id="hero-heading">
        Featured offers
      </h2>

      <div className="hero__track">
        {BANNERS.map((banner, i) => (
          <section
            key={banner.id}
            className={cx('hero__slide', i === index && 'is-active')}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            /* `inert` (as an attribute string) keeps hidden slides out of the tab order */
            inert={i !== index ? '' : undefined}
          >
            <img
              className="hero__image"
              src={`/assets/images/${banner.image}`}
              alt={banner.alt}
              width="1600"
              height="600"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />

            <div className="hero__overlay">
              <p className="hero__eyebrow">{banner.eyebrow}</p>
              <h3 className="hero__title">{banner.title}</h3>
              <p className="hero__subtitle">{banner.subtitle}</p>
              <a className="btn btn--accent btn--lg hero__cta" href={`#${banner.id}`}>
                <span className="btn__label">{banner.cta}</span>
                <Icon name="chevronRight" size={18} />
              </a>
            </div>
          </section>
        ))}
      </div>

      {/* --------------------------------------------------------- controls */}
      <div className="hero__controls">
        <button type="button" className="hero__arrow" onClick={prev} aria-label="Pichla slide">
          <Icon name="chevronLeft" size={22} />
        </button>

        {/* No role override here: forcing `group` onto the <ul> would strip its
            implicit list role and orphan the <li> children from screen readers.
            aria-label on the <ul> is enough. */}
        <ul className="hero__dots" aria-label="Slide chunein">
          {BANNERS.map((banner, i) => (
            <li key={banner.id}>
              <button
                type="button"
                className={cx('hero__dot', i === index && 'is-active')}
                aria-label={`Slide ${i + 1}: ${banner.title}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            </li>
          ))}
        </ul>

        <button type="button" className="hero__arrow" onClick={next} aria-label="Agla slide">
          <Icon name="chevronRight" size={22} />
        </button>
      </div>

      <p className="hero__status sr-only" aria-live="polite">
        Slide {index + 1} of {count}: {BANNERS[index].title}
      </p>
    </section>
  );
}