import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import SearchBar from '../search/SearchBar.jsx';
import AccountMenu from '../auth/AccountMenu.jsx';
import SignInModal from '../auth/SignInModal.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { useScrolledPast } from '../../hooks/useScroll.js';
import { SITE } from '../../utils/constants.js';

/**
 * Main site header.
 *
 * Semantics: a <header> landmark containing the primary <nav>, the search
 * form and the account / cart actions.
 *
 * The account slot is driven by Firebase Auth: a "Login" trigger while signed
 * out, the <AccountMenu> once Firebase reports a user.
 */
export default function Header({ onOpenCart }) {
  const { cartSummary, wishlist } = useStore();
  const { isAuthenticated, initialising, pendingError, clearPendingError } = useAuth();
  const scrolled = useScrolledPast(10);

  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const kebabRef = useRef(null);
  const [kebabOpen, setKebabOpen] = useState(false);

  const closeKebab = useCallback(() => setKebabOpen(false), []);
  useOnClickOutside(kebabRef, closeKebab, kebabOpen);

  /**
   * A failed Google redirect lands the user back here with no other feedback.
   * Re-open the dialog and show the reason, otherwise a misconfigured
   * Firebase project looks identical to a user pressing cancel.
   */
  useEffect(() => {
    if (!pendingError) return undefined;
    setLoginOpen(true);
    const timer = window.setTimeout(clearPendingError, 12000);
    return () => window.clearTimeout(timer);
  }, [pendingError, clearPendingError]);

  return (
    <header className={`header ${scrolled ? 'is-stuck' : ''}`}>
      <div className="container header__inner">
        {/* ---------------------------------------------------------- logo */}
        <a href="#top" className="header__logo" aria-label={`${SITE.name} — homepage`}>
          <img src="/assets/images/brand/logo-mark.svg" alt="" width="36" height="36" />
          <span className="header__logo-text">
            Sawon<span className="header__logo-accent">Mart</span>
          </span>
        </a>

        {/* --------------------------------------------------------- search */}
        <div className="header__search">
          <SearchBar onOpenDrawer={onOpenCart} />
        </div>

        {/* -------------------------------------------------------- actions */}
        <nav className="header__actions" aria-label="Account actions">
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <button
              type="button"
              className="header__action header__action--login"
              onClick={() => setLoginOpen(true)}
              /* While Firebase resolves the existing session, hide the trigger
                 rather than flashing a "Login" button at a signed-in shopper. */
              aria-busy={initialising || undefined}
              hidden={initialising}
            >
              <span className="header__action-text">
                <span className="header__action-sub">Hello,</span>
                <span className="header__action-main">Login</span>
              </span>
            </button>
          )}

          <a href="#become-seller" className="header__action header__action--seller u-hide-sm">
            Become a Seller
          </a>

          {/* kebab overflow menu */}
          <div className="header__kebab" ref={kebabRef}>
            <button
              type="button"
              className="header__icon-btn"
              aria-label="Aur options"
              aria-expanded={kebabOpen}
              aria-haspopup="true"
              onClick={() => setKebabOpen((open) => !open)}
            >
              <Icon name="grid" size={22} />
            </button>

            {kebabOpen ? (
              <div className="kebab-menu" role="menu" aria-label="Aur options">
                <a className="kebab-menu__item" role="menuitem" href="#notifications" onClick={closeKebab}>
                  <Icon name="bell" size={18} />
                  Notifications
                </a>
                <a className="kebab-menu__item" role="menuitem" href="#wishlist" onClick={closeKebab}>
                  <Icon name="heart" size={18} />
                  Wishlist ({wishlist.length})
                </a>
                <a className="kebab-menu__item" role="menuitem" href="#orders" onClick={closeKebab}>
                  <Icon name="truck" size={18} />
                  Orders
                </a>
                <a className="kebab-menu__item" role="menuitem" href="#rewards" onClick={closeKebab}>
                  <Icon name="gift" size={18} />
                  Rewards
                </a>
              </div>
            ) : null}
          </div>

          {/* cart
              No aria-label: the visible text is the accessible name. The item
              count is a visually-hidden span instead, so the label reads
              "Cart Kharid 3 items" and the visible wording stays in the name. */}
          <button
            type="button"
            className="header__action header__action--cart"
            onClick={onOpenCart}
          >
            <span className="header__cart-icon">
              <Icon name="cart" size={24} />
              {cartSummary.count > 0 ? (
                <span className="header__cart-badge t-numeric" aria-hidden="true">
                  {cartSummary.count}
                </span>
              ) : null}
            </span>
            <span className="header__action-text u-hide-sm">
              <span className="header__action-sub">Cart</span>
              <span className="header__action-main">Kharid</span>
            </span>
            <span className="sr-only">
              {cartSummary.count} {cartSummary.count === 1 ? 'item' : 'items'} in cart
            </span>
          </button>

          {/* mobile menu */}
          <button
            type="button"
            className="header__icon-btn u-only-sm"
            aria-label="Menu kholein"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="menu" size={24} />
          </button>
        </nav>
      </div>

      <SignInModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
