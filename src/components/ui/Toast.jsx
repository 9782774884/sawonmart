import { useStore } from '../../context/StoreContext.jsx';
import Icon from './Icon.jsx';
import { cx } from '../../utils/format.js';

const TONE_ICON = {
  success: 'check',
  error: 'close',
  info: 'bell',
};

const AUTO_DISMISS_MS = 3600;

/**
 * Toast stack.
 * The live region is polite and `aria-atomic`, so a screen reader announces
 * each notification once after the current utterance finishes.
 */
export default function ToastStack() {
  const { toasts, dismissToast } = useStore();
  if (!toasts.length) return null;

  return (
    <div
      className="toast-stack"
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx('toast', `toast--${toast.tone}`)}
          style={{ '--toast-life': `${AUTO_DISMISS_MS}ms` }}
        >
          <span className="toast__icon" aria-hidden="true">
            <Icon name={TONE_ICON[toast.tone] ?? 'bell'} size={18} />
          </span>

          <div className="toast__text">
            <p className="toast__title">{toast.title}</p>
            {toast.text ? <p className="toast__body t-truncate">{toast.text}</p> : null}
          </div>

          <button
            type="button"
            className="toast__close"
            onClick={() => dismissToast(toast.id)}
            aria-label={`${toast.title} — band karein`}
          >
            <Icon name="close" size={16} />
          </button>

          <span className="toast__timer" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}