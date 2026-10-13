import Reveal from '../ui/Reveal.jsx';
import { CATEGORIES } from '../../data/site.js';

/** Circular "shop by category" shortcuts. */
export default function CategoryStrip() {
  return (
    <Reveal as="section" className="section cat-strip" aria-labelledby="cat-heading">
      <h2 className="sr-only" id="cat-heading">
        Category se shopping karein
      </h2>

      <ul className="cat-strip__list">
        {CATEGORIES.map((category, i) => (
          <li key={category.id} className="cat-strip__item">
            <a
              href={`#cat-${category.id}`}
              className="cat-strip__link"
              // A small stagger makes the row cascade in without extra JS.
              style={{ transitionDelay: `${i * 45}ms` }}
            >
              <span className="cat-strip__circle">
                <img
                  src={`/assets/images/${category.image}`}
                  alt=""
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="cat-strip__label">{category.label}</span>
              <span className="cat-strip__count t-text-muted">{category.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}