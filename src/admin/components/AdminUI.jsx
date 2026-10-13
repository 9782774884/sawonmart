/**
 * Small shared UI primitives for the admin panel.
 *
 * These live together deliberately: each is a handful of lines, and splitting
 * fifteen one-line formatters across fifteen files would add noise without
 * adding clarity. Anything with real behaviour (tables, charts, forms with
 * validation) has its own file.
 */
import { cx } from '../../utils/format.js';
import Icon from '../../components/ui/Icon.jsx';

/* ------------------------------------------------------------- page header */

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <header className="adm-pagehead">
      <div className="adm-pagehead__text">
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="adm-crumbs">
            {breadcrumb.map((b, i) => (
              <span key={b.label}>
                {i > 0 ? <span className="adm-crumbs__sep" aria-hidden="true">/</span> : null}
                <span className={i === breadcrumb.length - 1 ? 'adm-crumbs__current' : undefined}>{b.label}</span>
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="adm-pagehead__title">{title}</h1>
        {subtitle ? <p className="adm-pagehead__sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="adm-pagehead__actions">{actions}</div> : null}
    </header>
  );
}

/* ---------------------------------------------------------------- stat card */

const TONE_CLASS = {
  blue: 'adm-stat--blue', green: 'adm-stat--green', red: 'adm-stat--red',
  amber: 'adm-stat--amber', violet: 'adm-stat--violet', grey: 'adm-stat--grey',
};

export function StatCard({ label, value, hint, icon, tone = 'blue', delta }) {
  return (
    <article className={cx('adm-stat', TONE_CLASS[tone])}>
      <div className="adm-stat__top">
        <p className="adm-stat__label">{label}</p>
        {icon ? (
          <span className="adm-stat__icon" aria-hidden="true">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
      </div>
      <p className="adm-stat__value t-numeric">{value}</p>
      <p className="adm-stat__hint">
        {delta != null ? (
          <span className={cx('adm-stat__delta', delta >= 0 ? 'is-up' : 'is-down')}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span>{hint}</span> : null}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------- status pill */

const STATUS_TONE = {
  active: 'ok', paid: 'ok', delivered: 'ok', confirmed: 'info', packed: 'info',
  dispatched: 'info', pending: 'warn', low: 'warn', approved: 'ok',
  cancelled: 'bad', returned: 'bad', refunded: 'bad', blocked: 'bad',
  suspended: 'bad', inactive: 'bad', expired: 'bad', archived: 'bad',
  'out of stock': 'bad', approval: 'warn',
};

export function StatusPill({ status, children }) {
  const tone = STATUS_TONE[String(status).toLowerCase()] ?? 'grey';
  return <span className={cx('adm-pill', `adm-pill--${tone}`)}>{children ?? status}</span>;
}

/* ------------------------------------------------------------------- forms */

/**
 * Labelled form field.
 *
 * The <label> WRAPS the control rather than sitting beside it with `for`.
 * That gives an implicit association for free, so it works uniformly for
 * Input, Select and Textarea without every caller having to invent an id —
 * which is exactly the mistake that left the staff form unlabelled.
 */
export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={cx('adm-field', className)}>
      <label className="adm-field__label">
        <span className="adm-field__text">
          {label}
          {required ? <span className="adm-field__req" aria-hidden="true"> *</span> : null}
        </span>
        {children}
      </label>
      {error ? (
        <p className="adm-field__msg is-error" role="alert">{error}</p>
      ) : hint ? (
        <p className="adm-field__msg">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className = '', invalid, ...rest }) {
  return <input className={cx('adm-input', invalid && 'is-invalid', className)} {...rest} />;
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={cx('adm-input adm-select', className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', rows = 3, ...rest }) {
  return <textarea rows={rows} className={cx('adm-input adm-textarea', className)} {...rest} />;
}

export function Checkbox({ label, className = '', ...rest }) {
  return (
    <label className={cx('adm-check', className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

/** Toggle rendered as a real switch, driven by a checkbox. */
export function Switch({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={cx('adm-switch', disabled && 'is-disabled')}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="adm-switch__track" aria-hidden="true"><span className="adm-switch__thumb" /></span>
      <span className="adm-switch__text">
        <span className="adm-switch__label">{label}</span>
        {hint ? <span className="adm-switch__hint">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ layout */

export function Panel({ title, subtitle, actions, children, className = '', bodyClass = '' }) {
  return (
    <section className={cx('adm-panel', className)}>
      {title ? (
        <header className="adm-panel__head">
          <div>
            <h2 className="adm-panel__title">{title}</h2>
            {subtitle ? <p className="adm-panel__sub">{subtitle}</p> : null}
          </div>
          {actions ? <div className="adm-panel__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cx('adm-panel__body', bodyClass)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon = 'grid', title, text, action }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty__icon" aria-hidden="true"><Icon name={icon} size={30} /></span>
      <p className="adm-empty__title">{title}</p>
      {text ? <p className="adm-empty__text">{text}</p> : null}
      {action}
    </div>
  );
}

export function Toolbar({ children, className = '' }) {
  return <div className={cx('adm-toolbar', className)}>{children}</div>;
}

export function Alert({ tone = 'info', title, children }) {
  return (
    <div className={cx('adm-alert', `adm-alert--${tone}`)} role="note">
      {title ? <p className="adm-alert__title">{title}</p> : null}
      <div className="adm-alert__body">{children}</div>
    </div>
  );
}