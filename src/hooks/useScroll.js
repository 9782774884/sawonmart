import { useEffect, useState } from 'react';

/**
 * Reports whether the page has scrolled past a threshold.
 * Uses IntersectionObserver on a sentinel instead of a scroll listener,
 * which avoids running JS on every scroll frame.
 */
export function useScrolledPast(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // No sentinel element passed: fall back to a throttled scroll handler.
    let ticking = false;

    const check = () => {
      setScrolled(window.scrollY > threshold);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * True once the element has entered the viewport; used to fire the
 * `.reveal` entrance animation.
 */
export function useInView(options = {}) {
  const { threshold = 0.12, once = true } = options;
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold, once]);

  return [setNode, inView];
}