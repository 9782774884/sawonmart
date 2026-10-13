import { cx } from '../../utils/format.js';

/** Small pill used for "Best Seller", discount % and "Assured". */
export default function Badge({ children, tone = 'neutral', size = 'md', className = '' }) {
  return (
    <span className={cx('badge', `badge--${tone}`, `badge--${size}`, className)}>{children}</span>
  );
}