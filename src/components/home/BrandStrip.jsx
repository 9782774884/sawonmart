import Reveal from '../ui/Reveal.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { BRANDS } from '../../data/site.js';

/** Trusted-brand wordmark strip. */
export default function BrandStrip() {
  return (
    <Reveal as="section" className="section section--tinted brands" aria-labelledby="brands-heading">
      <SectionHeader id="brands-heading" title="Brands Jo Aapko Pasand Hain" subtitle="Har order par 100% original" />

      <ul className="brands__list">
        {BRANDS.map((brand) => (
          <li key={brand.id} className="brands__item">
            <a href={`#brand-${brand.id}`} className="brands__link" aria-label={`${brand.label} ke products dekhein`}>
              <img
                src={`/assets/images/brands/${brand.id}.svg`}
                alt={brand.label}
                width="200"
                height="80"
                loading="lazy"
                decoding="async"
              />
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}