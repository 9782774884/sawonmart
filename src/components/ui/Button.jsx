import { cx } from '../../utils/format.js';

/**
 * Buttons and button-like links.
 *
 * Rendering rules:
 *  - `href`      → renders an <a>
 *  - `to`        → renders a react-router <Link> (passed via `as={Link}`)
 *  - otherwise   → renders a <button>, defaulting to type="button" so it never
 *                  submits a surrounding form by accident.
 *
 * Decorative icons are hidden from assistive tech; the label does the work.
 */

const VARIANTS = {
  primary: 'btn--primary',
  accent: 'btn--accent',
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  subtle: 'btn--subtle',
  white: 'btn--white',
  success: 'btn--success',
  danger: 'btn--danger',
};

const SIZES = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  as: Component,
  className = '',
  iconLeft,
  iconRight,
  fullWidth = false,
  type = 'button',
  ...rest
}) {
  const classes = cx(
    'btn',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'btn--block',
    className
  );

  const content = (
    <>
      {iconLeft ? <span className="btn__icon">{iconLeft}</span> : null}
      <span className="btn__label">{children}</span>
      {iconRight ? <span className="btn__icon">{iconRight}</span> : null}
    </>
  );

  // `to` implies a router link even when `as` is not passed.
  if (Component) {
    return (
      <Component className={classes} {...(to ? { to } : { href })} {...rest}>
        {content}
      </Component>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}