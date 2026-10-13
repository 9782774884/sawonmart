import ProductCard from './ProductCard.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { ELECTRONICS_PRODUCTS } from '../../data/products.js';

/** "Best of Electronics" responsive grid with a filter toolbar. */
export default function ElectronicsSection() {
  return (
    <Reveal as="section" className="section electronics" aria-labelledby="electronics-heading">
      <SectionHeader
        id="electronics-heading"
        title="Best of Electronics"
        subtitle="Phones, laptops, audio aur accessories — sab ek jagah"
        icon="bolt"
        action={
          <Button variant="outline" size="sm" href="#all-electronics" iconRight={<Icon name="chevronRight" size={16} />}>
            Sab dekhhein
          </Button>
        }
      />

      {/* Decorative filter chips; a real site would drive a query param. */}
      <div className="filterbar" role="group" aria-label="Products filter karein">
        {['All', 'Mobiles', 'Laptops', 'Audio', 'Wearables', 'Accessories'].map((chip, i) => (
          <button
            key={chip}
            type="button"
            className={`filterbar__chip ${i === 0 ? 'is-active' : ''}`}
            aria-pressed={i === 0}
          >
            {chip}
          </button>
        ))}
      </div>

      <ul className="grid-products">
        {ELECTRONICS_PRODUCTS.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}