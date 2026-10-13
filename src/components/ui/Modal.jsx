import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { cx } from '../../utils/format.js';

/**
 * Generic modal dialog.
 *
 * Accessibility contract:
 *  - role="dialog" + aria-modal + aria-labelledby (via <dialog>-like semantics).
 *  - Focus moves into the dialog on open and returns to the trigger on close.
 *  - Tab is trapped inside the dialog.
 *  - Escape and backdrop click both close it.
 *  - Background scroll is locked.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  labelledBy,
}) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  useLockBodyScroll(open);

  /* ---- focus management ---- */
  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;

    // Focus the first meaningful control, falling back to the panel itself.
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector(
        'input:not([type="hidden"]), button:not([disabled]), a[href], select, textarea'
      );
      (target ?? panel).focus();
    }, 20);

    return () => {
      window.clearTimeout(focusTimer);
      const prev = restoreFocusRef.current;
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [open]);

  /* ---- escape to close ---- */
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  const onBackdropClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  const titleId = labelledBy ?? 'modal-title';

  return (
    <div
      className={cx('modal', !reduceMotion && 'modal--anim')}
      onClick={onBackdropClick}
      // The backdrop is a presentation layer; the dialog itself is the semantics.
      role="presentation"
    >
      <div
        className={cx('modal__panel', `modal__panel--${size}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="modal__head">
          <div className="stack">
            {title ? (
              <h2 className="modal__title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {description ? <p className="modal__desc t-text-muted">{description}</p> : null}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Band karein">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__foot">{footer}</footer> : null}
      </div>
    </div>
  );
}