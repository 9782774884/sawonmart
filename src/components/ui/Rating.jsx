import Icon from './Icon.jsx';
import { cx, formatCompact } from '../../utils/format.js';

/**
 * Star rating.
 *
 * Accessibility: the visual stars are decorative. The real value is exposed
 * once as text ("4.4 out of 5, 128473 ratings") inside a `role="img"` element,
 * so screen readers hear one meaningful label instead of five stars.
 */
export default function Rating({ value = 0, count = 0, reviews, size = 'md', showCount = true }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const label = `${value} out of 5 stars${count ? `, ${formatCompact(count)} ratings` : ''}${
    reviews ? `, ${formatCompact(reviews)} reviews` : ''
  }`;

  return (
    <div className={cx('rating', `rating--${size}`)}>
      <span className="rating__badge" role="img" aria-label={label}>
        <Icon name="star" size={12} strokeWidth={0} className="rating__star" />
        <span className="t-numeric">{value.toFixed(1)}</span>
      </span>

      <span className="rating__track" aria-hidden="true">
        <span className="rating__fill" style={{ width: `${pct}%` }} />
      </span>

      {showCount && count ? (
        <span className="rating__count t-numeric" aria-hidden="true">
          ({formatCompact(count)})
        </span>
      ) : null}
    </div>
  );
}