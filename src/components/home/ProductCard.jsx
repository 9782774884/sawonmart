import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Icon from '../ui/Icon.jsx';
import Rating from '../ui/Rating.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { cx, discountPercent, formatCompact, formatPrice } from '../../utils/format.js';

/**
 * Product tile.
 *
 * Semantics: an <article> so each product is a distinct landmark-ish region,
 * with the title as its heading and the price machine-readable.
 *
 * Rendered with <memo> because the home page renders ~40 of these at once.
 */
function ProductCard({ product, compact = false }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();

  const off = discountPercent(product.price, product.mrp);
  const saved = isWishlisted(product.id);
  const headingId = `p-${product.id}-title`;
  const to = `/product/${product.id}`;

  return (
    <article className={cx('pcard', compact && 'pcard--compact')} aria-labelledby={headingId}>
      <div className="pcard__media">
        {/* Duplicate of the title link: hidden from AT and the tab order so
            keyboard users meet exactly one link per product. */}
        <Link to={to} className="pcard__media-link" tabIndex={-1} aria-hidden="true">
          <img
            src={`/assets/images/${product.image}`}
            alt=""
            width="240"
            height="240"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {product.badge ? (
          <span className="pcard__badge">
            <Badge tone="accent" size="sm">
              {product.badge}
            </Badge>
          </span>
        ) : null}

        <button
          type="button"
          className={cx('pcard__wish', saved && 'is-active')}
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `${product.title} — wishlist se hataayein`
              : `${product.title} — wishlist mein daalein`
          }
        >
          <Icon name="heart" size={20} strokeWidth={1.9} />
        </button>
      </div>

      <div className="pcard__body">
        {/* The title is the card's primary link to the description page. */}
        <h3 className="pcard__title t-clamp-2" id={headingId}>
          <Link to={to} className="pcard__title-link">
            {product.title}
          </Link>
        </h3>

        {!compact ? (
          <p className="pcard__highlight t-text-muted t-truncate">{product.highlights[0]}</p>
        ) : null}

        <Rating value={product.rating} count={product.ratingCount} reviews={product.reviews} />

        <p className="pcard__price">
          <span className="pcard__price-now t-price">{formatPrice(product.price)}</span>
          {off > 0 ? (
            <>
              <span className="pcard__price-mrp t-strike t-numeric">{formatPrice(product.mrp)}</span>
              <span className="pcard__price-off u-text-green">{off}% off</span>
            </>
          ) : null}
        </p>

        {off > 0 ? (
          <p className="pcard__saving t-text-muted t-numeric">
            Aap {formatCompact(product.mrp - product.price)} bacha rahe hain
          </p>
        ) : null}

        <ul className="pcard__colors" aria-label={`${product.colors.length} colours available`}>
          {product.colors.slice(0, 4).map((color, index) => (
            <li
              key={color}
              className="pcard__swatch"
              style={{ '--swatch': color }}
              title={index === 0 ? product.title : `Colour ${index + 1}`}
            />
          ))}
          {product.colors.length > 4 ? (
            <li className="pcard__swatch-more t-numeric">+{product.colors.length - 4}</li>
          ) : null}
        </ul>

        <p className="pcard__delivery">
          <Icon name="truck" size={15} />
          <span className="t-truncate">Delivery {product.delivery}</span>
        </p>

        {product.assured ? (
          <p className="pcard__assured">
            <Badge tone="assured" size="sm">
              Assured
            </Badge>
          </p>
        ) : null}
      </div>

      <div className="pcard__actions">
        <button
          type="button"
          className="pcard__add"
          onClick={() => addToCart(product)}
          /* No aria-label here: the visible text "Add to Cart" is the accessible
             name (overriding it would break label-in-name). The product title is
             attached as a description so the button is still unambiguous among
             the dozens of cards on the page. */
          aria-describedby={headingId}
        >
          <Icon name="plus" size={16} strokeWidth={2.2} />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}

export default memo(ProductCard);