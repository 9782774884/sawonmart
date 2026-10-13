import { useInView } from '../../hooks/useScroll.js';
import { cx } from '../../utils/format.js';

/**
 * Adds the `.reveal` entrance animation when the node scrolls into view.
 * A plain <div> wrapper by default; pass `as` for any element.
 */
export default function Reveal({ as: Tag = 'div', className = '', children, delay = 0, ...rest }) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      className={cx('reveal', inView && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}