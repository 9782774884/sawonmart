import Icon from '../ui/Icon.jsx';
import Rating from '../ui/Rating.jsx';
import { REVIEWS } from '../../data/site.js';
import { buildRatingBreakdown } from '../../data/specs.js';
import { formatCompact } from '../../utils/format.js';

/** Ratings summary + the written reviews attached to this product. */
export default function ProductReviews({ product }) {
  const breakdown = buildRatingBreakdown(product.rating, product.ratingCount);
  const written = REVIEWS.filter((r) => r.productId === product.id);

  return (
    <section className="previews" aria-labelledby="reviews-heading">
      <h2 className="previews__title" id="reviews-heading">
        Ratings &amp; reviews
      </h2>

      <div className="previews__summary">
        <div className="previews__score">
          <p className="previews__score-value t-numeric">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} showCount={false} />
          <p className="t-text-muted previews__score-count">
            {formatCompact(product.ratingCount)} ratings
          </p>
        </div>

        <ul className="previews__bars">
          {breakdown.map((row) => {
            const pct = product.ratingCount ? (row.count / product.ratingCount) * 100 : 0;
            return (
              <li key={row.stars} className="previews__bar-row">
                <span className="previews__bar-label t-numeric">{row.stars} ★</span>
                <span className="previews__bar-track" aria-hidden="true">
                  <span className="previews__bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="previews__bar-count t-numeric">{formatCompact(row.count)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {written.length > 0 ? (
        <ul className="previews__list">
          {written.map((review) => (
            <li key={review.id}>
              <article className="preview">
                <header className="preview__head">
                  <p className="preview__title">{review.title}</p>
                  <Rating value={review.rating} showCount={false} size="sm" />
                </header>

                <p className="preview__body">{review.body}</p>

                <footer className="preview__meta t-text-muted">
                  <span className="preview__author">{review.name}</span>
                  <span className="preview__city">
                    <Icon name="pin" size={12} />
                    {review.city}
                  </span>
                  <span className="preview__certified">
                    <Icon name="check" size={12} />
                    Certified buyer
                  </span>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="previews__empty t-text-muted">
          Is product par abhi tak koi detailed review nahi hai. Aap pehle khareedein aur apna
          experience share karein.
        </p>
      )}
    </section>
  );
}