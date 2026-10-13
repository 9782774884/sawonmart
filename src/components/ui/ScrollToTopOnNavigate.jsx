import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position on navigation, the way a real page load would.
 * Without this, jumping from the homepage footer to a product page keeps the
 * old scroll offset and lands the user mid-page.
 *
 * Hash links (#deals) are left alone so in-page anchors still work.
 */
export default function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}