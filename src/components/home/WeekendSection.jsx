import Carousel from '../ui/Carousel.jsx';
import ProductCard from './ProductCard.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';
import { SHUKRAWAT_PRODUCTS } from '../../data/products.js';
import { DEAL_WINDOW_MS } from '../../utils/constants.js';
import { pad2 } from '../../utils/format.js';
import { useCountdown } from '../../hooks/useCountdown.js';

/** "Shukrawat ka Special" — a longer rail for the weekend sale. */
export default function WeekendSection() {
  const { hours, minutes, seconds } = useCountdown(DEAL_WINDOW_MS.endOfSeason);

  return (
    <Reveal as="section" className="section section--tinted weekend" aria-labelledby="weekend-heading">
      <SectionHeader
        id="weekend-heading"
        title="Shukrawat Ka Special"
        subtitle="Chote brands, badi discounts — sirf is weekend"
        icon="gift"
        action={
          <div className="countdown countdown--dark">
            <span className="countdown__label">Khatam hone mein</span>
            <ol className="countdown__digits" aria-hidden="true">
              {[
                { value: hours % 24, unit: 'hr' },
                { value: minutes, unit: 'min' },
                { value: seconds, unit: 'sec' },
              ].map((part) => (
                <li key={part.unit} className="countdown__part">
                  <span className="countdown__value t-numeric">{pad2(part.value)}</span>
                  <span className="countdown__unit">{part.unit}</span>
                </li>
              ))}
            </ol>
          </div>
        }
      />

      <Carousel label="Weekend special products" itemCount={SHUKRAWAT_PRODUCTS.length}>
        {SHUKRAWAT_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Carousel>
    </Reveal>
  );
}