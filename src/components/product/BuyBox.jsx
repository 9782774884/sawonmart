import { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Rating from '../ui/Rating.jsx';
import { MAX_QTY, useStore } from '../../context/StoreContext.jsx';
import { cx, discountPercent, formatCompact, formatPrice } from '../../utils/format.js';

/**
 * Buy box: price, offers, delivery estimate and the add-to-cart controls.
 */
export default function BuyBox({ product, offers }) {
  const { addToCart, isWishlisted, toggleWishlist, pushToast } = useStore();

  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState(null);

  const off = discountPercent(product.price, product.mrp);
  const saved = isWishlisted(product.id);

  const checkPincode = (event) => {
    event.preventDefault();
    const valid = /^\d{6}$/.test(pincode);
    setPinStatus(
      valid
        ? { ok: true, text: `Delivery ${product.delivery.toLowerCase()} — is pincode par.` }
        : { ok: false, text: '6 digit ka valid pincode daalein.' }
    );
  };

  const onAdd = () => {
    addToCart(product, qty);
  };

  const onBuyNow = () => {
    addToCart(product, qty);
    pushToast({
      title: 'Checkout shuru',
      text: `${qty} × ${product.title} cart mein hai.`,
      tone: 'info',
    });
  };

  return (
    <div className="buybox">
      {/* ------------------------------------------------------------ title */}
      <p className="buybox__brand">
        <span className="buybox__brand-name">{product.brand}</span>
        {product.assured ? (
          <Badge tone="assured" size="sm">
            Assured
          </Badge>
        ) : null}
      </p>

      <h1 className="buybox__title">{product.title}</h1>

      <div className="buybox__meta">
        <Rating value={product.rating} count={product.ratingCount} reviews={product.reviews} />
        <span className="buybox__meta-sep" aria-hidden="true">
          •
        </span>
        <span className="buybox__meta-text t-text-muted">
          {formatCompact(product.ratingCount)} Ratings &amp; {formatCompact(product.reviews)} Reviews
        </span>
      </div>

      {product.badge ? (
        <p className="buybox__tag">
          <Badge tone="accent">{product.badge}</Badge>
        </p>
      ) : null}

      {/* ----------------------------------------------------------- price */}
      <div className="buybox__price">
        <p className="buybox__price-row">
          <span className="buybox__price-now">{formatPrice(product.price)}</span>
          {off > 0 ? (
            <>
              <span className="t-strike buybox__price-mrp">{formatPrice(product.mrp)}</span>
              <span className="buybox__price-off">{off}% off</span>
            </>
          ) : null}
        </p>
        <p className="t-text-muted buybox__price-note">Inclusive of all taxes</p>
        {off > 0 ? (
          <p className="buybox__price-save">
            Aap is product par <strong>{formatPrice(product.mrp - product.price)}</strong> bacha
            rahe hain
          </p>
        ) : null}
      </div>

      {/* ---------------------------------------------------------- offers */}
      <section className="buybox__offers" aria-labelledby="offers-heading">
        <h2 className="buybox__subhead" id="offers-heading">
          Available offers
        </h2>
        <ul className="offer-list">
          {offers.map((offer) => (
            <li key={offer.id} className="offer">
              <Badge tone="success" size="sm">
                {offer.tag}
              </Badge>
              <span>
                <span className="offer__title">{offer.title}</span>
                <span className="offer__detail t-text-muted">{offer.detail}</span>
              </span>
              <button type="button" className="offer__copy">
                Copy
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------- delivery */}
      <section className="buybox__delivery" aria-labelledby="delivery-heading">
        <h2 className="buybox__subhead" id="delivery-heading">
          Delivery
        </h2>

        <p className="buybox__delivery-line">
          <Icon name="truck" size={18} />
          <span>
            Delivery by <strong>{product.delivery}</strong>
          </span>
        </p>

        <form className="pincode" onSubmit={checkPincode}>
          <label className="pincode__label" htmlFor="pincode-input">
            Delivery pincode
          </label>
          <div className="pincode__row">
            <input
              id="pincode-input"
              className="pincode__input"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="6 digit pincode"
              value={pincode}
              onChange={(event) => {
                setPincode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setPinStatus(null);
              }}
              aria-describedby={pinStatus ? 'pincode-status' : undefined}
            />
            <Button type="submit" variant="outline" size="md">
              Check
            </Button>
          </div>

          <p
            id="pincode-status"
            className={cx('pincode__status', pinStatus?.ok ? 'u-text-green' : 'u-text-red')}
            role="status"
          >
            {pinStatus?.text ?? 'Demo — koi bhi 6 digit number chalta hai.'}
          </p>
        </form>
      </section>

      {/* --------------------------------------------------------- actions */}
      <div className="buybox__actions">
        <div className="qty qty--lg" role="group" aria-label="Quantity chunein">
          <button
            type="button"
            className="qty__btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Quantity kam karein"
          >
            <Icon name="minus" size={16} />
          </button>
          <span className="qty__value t-numeric" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            className="qty__btn"
            onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            disabled={qty >= MAX_QTY}
            aria-label="Quantity badhaayein"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>

        <Button variant="accent" size="lg" onClick={onAdd} iconLeft={<Icon name="cart" size={18} />}>
          Add to Cart
        </Button>

        <Button variant="primary" size="lg" onClick={onBuyNow}>
          Buy Now
        </Button>

        <button
          type="button"
          className={cx('buybox__wish', saved && 'is-active')}
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
        >
          <Icon name="heart" size={20} strokeWidth={1.9} />
          <span>{saved ? 'Wishlist mein hai' : 'Wishlist mein daalein'}</span>
        </button>
      </div>

      <p className="buybox__assurance">
        <Icon name="shield" size={16} />
        <span>100% Original product · 7 day easy replacement · Koi hidden charge nahi</span>
      </p>
    </div>
  );
}