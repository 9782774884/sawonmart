import Carousel from '../ui/Carousel.jsx';
import ProductCard from './ProductCard.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';
import Badge from '../ui/Badge.jsx';
import { DEAL_PRODUCTS } from '../../data/products.js';
import { DEAL_WINDOW_MS } from '../../utils/constants.js';
import { pad2 } from '../../utils/format.js';
import { useCountdown } from '../../hooks/useCountdown.js';

/** Deals of the day rail with a live countdown. */
export default function DealsSection() {
  const { hours, minutes, seconds, isOver } = useCountdown(DEAL_WINDOW_MS.dealsOfTheDay);

  const timerLabel = `Deal khatam hone mein ${hours} ghante ${minutes} minute ${seconds} second`;

  return (
    <Reveal as="section" className="section deals" aria-labelledby="deals-heading">
      <SectionHeader
        id="deals-heading"
        title="Deal of the Day"
        subtitle="Roz subah 8 AM par naye deals — stock khatam hone tak"
        icon="bolt"
        action={
          <div className="countdown">
            {/* Announced once as a sentence; the ticking digits are aria-hidden. */}
            <span className="countdown__label" role="timer" aria-label={timerLabel}>
              {isOver ? 'Deal khatam' : 'Khatam hone mein'}
            </span>

            <ol className="countdown__digits" aria-hidden="true">
              {[
                { value: hours, unit: 'hr' },
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

      <Carousel label="Deal of the day products" itemCount={DEAL_PRODUCTS.length}>
        {DEAL_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </Carousel>

      <p className="deals__note t-text-muted">
        <Badge tone="neutral" size="sm">
          Note
        </Badge>
        Offers bank aur partner par depend karti hain. Details ke liye offer terms check karein.
      </p>
    </Reveal>
  );
}