import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Rating from '../ui/Rating.jsx';
import { REVIEWS } from '../../data/site.js';

/** Customer testimonials. Each review is a <figure> — quotations, not buttons. */
export default function ReviewSection() {
  return (
    <Reveal as="section" className="section section--tinted reviews" aria-labelledby="reviews-heading">
      <SectionHeader
        id="reviews-heading"
        title="Customers Kya Kehte Hain"
        subtitle="42 lakh+ verified reviews se"
        icon="star"
      />

      <ul className="reviews__list">
        {REVIEWS.map((review) => (
          <li key={review.id}>
            <figure className="review">
              <div className="review__head">
                <img
                  className="review__avatar"
                  src={`/assets/images/${review.avatar}`}
                  alt=""
                  width="44"
                  height="44"
                  loading="lazy"
                />
                <figcaption className="review__who">
                  <span className="review__name">{review.name}</span>
                  <span className="review__city t-text-muted">
                    <Icon name="pin" size={13} />
                    {review.city}
                  </span>
                </figcaption>
              </div>

              <Rating value={review.rating} showCount={false} size="sm" />
              <blockquote className="review__quote">
                <p className="review__title">{review.title}</p>
                <p className="review__body">{review.body}</p>
              </blockquote>
            </figure>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}