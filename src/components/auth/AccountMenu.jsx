import { useCallback, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { useStore } from '../../context/StoreContext.jsx';
import { cx } from '../../utils/format.js';

const LINKS = [
  { id: 'account', label: 'My Account', icon: 'user', href: '#account' },
  { id: 'orders', label: 'Orders', icon: 'truck', href: '#orders' },
  { id: 'wishlist', label: 'Wishlist', icon: 'heart', href: '#wishlist' },
  { id: 'rewards', label: 'Rewards', icon: 'gift', href: '#rewards' },
];

/**
 * Signed-in account menu: avatar button opening a dropdown.
 *
 * The avatar <img> is only rendered when Google actually gave us a photo URL —
 * there is no placeholder image to 404 on.
 */
export default function AccountMenu() {
  const { displayName, email, photoURL, initials, logOut, busy } = useAuth();
  const { cart, wishlist, pushToast } = useStore();

  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(wrapRef, close, open);

  const onLogOut = async () => {
    setSigningOut(true);
    const result = await logOut();
    setSigningOut(false);

    if (result.ok) {
      close();
      pushToast({ title: 'Logout ho gaye', text: 'Phir se login kar sakte hain.', tone: 'info' });
    } else if (result.message) {
      pushToast({ title: 'Logout nahi ho paya', text: result.message, tone: 'error' });
    }
  };

  return (
    <div className="account" ref={wrapRef}>
      <button
        type="button"
        className="account__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account__avatar" aria-hidden="true">
          {photoURL ? (
            <img src={photoURL} alt="" width="28" height="28" referrerPolicy="no-referrer" />
          ) : (
            <span className="account__initials">{initials || '?'}</span>
          )}
        </span>

        <span className="account__text u-hide-sm">
          <span className="account__name">{displayName?.split(' ')[0] || 'Account'}</span>
          <span className="account__sub">Account</span>
        </span>

        <Icon name="chevronDown" size={14} className="account__caret" />
      </button>

      {open ? (
        <div className="account__menu" role="menu" aria-label="Account menu">
          <div className="account__head">
            <span className="account__avatar account__avatar--lg" aria-hidden="true">
              {photoURL ? (
                <img src={photoURL} alt="" width="40" height="40" referrerPolicy="no-referrer" />
              ) : (
                <span className="account__initials">{initials || '?'}</span>
              )}
            </span>
            <span className="account__head-text">
              <span className="account__head-name">{displayName}</span>
              <span className="account__head-email t-truncate" title={email}>
                {email}
              </span>
            </span>
          </div>

          <ul className="account__links">
            <li>
              <a role="menuitem" href="#orders" onClick={close}>
                <Icon name="truck" size={17} />
                Orders
                {cart.length ? <span className="account__count">{cart.length}</span> : null}
              </a>
            </li>
            {LINKS.filter((link) => link.id !== 'orders').map((link) => (
              <li key={link.id}>
                <a role="menuitem" href={link.href} onClick={close}>
                  <Icon name={link.icon} size={17} />
                  {link.label}
                  {link.id === 'wishlist' && wishlist.length ? (
                    <span className="account__count">{wishlist.length}</span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            role="menuitem"
            className={cx('account__logout', signingOut && 'is-busy')}
            onClick={onLogOut}
            disabled={busy || signingOut}
          >
            <Icon name="refresh" size={17} />
            {signingOut ? 'Logout ho raha hai…' : 'Logout'}
          </button>
        </div>
      ) : null}
    </div>
  );
}