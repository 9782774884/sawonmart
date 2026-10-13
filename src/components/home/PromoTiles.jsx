import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import { PROMOS } from '../../data/site.js';

/** Promotional tiles that sit between content sections. */
export default function PromoTiles() {
  return (
    <Reveal as="section" className="section promo" aria-labelledby="promo-heading">
      <h2 className="sr-only" id="promo-heading">
        Aur offers
      </h2>

      <ul className="promo__list">
        {PROMOS.map((promo) => (
          <li key={promo.id}>
            <a href={`#${promo.id}`} className="promo__tile">
              <img
                className="promo__image"
                src={`/assets/images/${promo.image}`}
                alt={promo.alt}
                width="520"
                height="250"
                loading="lazy"
                decoding="async"
              />
              <span className="promo__body">
                <span className="promo__title">{promo.title}</span>
                <span className="promo__text">{promo.subtitle}</span>
              </span>
              <span className="promo__cta" aria-hidden="true">
                <Icon name="chevronRight" size={18} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}