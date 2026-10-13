import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import { useStore, MAX_QTY } from '../../context/StoreContext.jsx';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { useRef } from 'react';
import { formatPrice } from '../../utils/format.js';

/**
 * Slide-in cart drawer.
 *
 * Semantics: a complementary <aside> exposed as a modal dialog, so focus is
 * trapped and Escape closes it. Announced via aria-modal + labelled by its heading.
 */
export default function CartDrawer({ open, onClose }) {
  const { cart, cartSummary, decrementCart, incrementCart, removeFromCart, clearCart } =
    useStore();
  const panelRef = useRef(null);

  useLockBodyScroll(open);
  useOnClickOutside(panelRef, onClose, open);

  return (
    // `inert` while closed keeps the panel out of the tab order and the
    // accessibility tree, but still allows the slide-out animation to run.
    <div className={`drawer ${open ? 'is-open' : ''}`} inert={open ? undefined : ''}>
      <div className="drawer__backdrop" onClick={onClose} role="presentation" />

      <aside
        className="drawer__panel"
        ref={panelRef}
        // Dialog semantics are only applied while the drawer is actually open.
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        aria-labelledby={open ? 'cart-drawer-title' : undefined}
        aria-hidden={open ? undefined : 'true'}
        tabIndex={-1}
      >
        <header className="drawer__head">
          <h2 className="drawer__title" id="cart-drawer-title">
            Aapka Cart
          </h2>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Cart band karein">
            <Icon name="close" size={20} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="drawer__empty">
            <span className="drawer__empty-icon" aria-hidden="true">
              <Icon name="cart" size={44} />
            </span>
            <p className="drawer__empty-title">Cart abhi khali hai</p>
            <p className="drawer__empty-text t-text-muted">
              Kuch pasand aaya? Abhi add karein, deals roz update hote hain.
            </p>
            <Button variant="accent" onClick={onClose}>
              Shopping jaari rakhein
            </Button>
          </div>
        ) : (
          <>
            <ul className="drawer__items">
              {cart.map((line) => (
                <li key={line.id} className="drawer__item">
                  <span className="drawer__item-thumb">
                    <img src={`/assets/images/${line.image}`} alt="" width="72" height="72" loading="lazy" />
                  </span>

                  <div className="drawer__item-body">
                    <p className="drawer__item-brand t-text-muted">{line.brand}</p>
                    <p className="drawer__item-title t-clamp-2">{line.title}</p>

                    <div className="drawer__item-foot">
                      <div className="qty" role="group" aria-label={`${line.title} quantity`}>
                        <button
                          type="button"
                          className="qty__btn"
                          onClick={() => decrementCart(line.id)}
                          aria-label={`${line.title} — quantity kam karein`}
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="qty__value t-numeric" aria-live="polite">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          className="qty__btn"
                          onClick={() => incrementCart(line.id)}
                          disabled={line.qty >= MAX_QTY}
                          aria-label={`${line.title} — quantity badhaayein`}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="drawer__item-remove"
                        onClick={() => removeFromCart(line.id)}
                        aria-label={`${line.title} hatayein`}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="drawer__item-price">
                    <p className="t-price">{formatPrice(line.price * line.qty)}</p>
                    <p className="t-strike t-numeric">{formatPrice(line.mrp * line.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              <p className="drawer__price-row">
                <span>Total items: {cartSummary.count}</span>
              </p>
              <p className="drawer__price-row">
                <span>Total MRP</span>
                <span className="t-strike t-numeric">{formatPrice(cartSummary.mrpTotal)}</span>
              </p>
              <p className="drawer__price-row drawer__price-row--save">
                <span>Aap bacha rahe hain</span>
                <span className="u-text-green">− {formatPrice(cartSummary.savings)}</span>
              </p>
              <p className="drawer__price-row drawer__price-row--total">
                <span>Total payable</span>
                <span className="t-price">{formatPrice(cartSummary.total)}</span>
              </p>

              <Button variant="accent" size="lg" fullWidth onClick={onClose}>
                Checkout karein
              </Button>
              <button type="button" className="drawer__clear" onClick={clearCart}>
                Cart khaali karein
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}