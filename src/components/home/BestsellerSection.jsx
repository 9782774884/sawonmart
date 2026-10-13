import Reveal from '../ui/Reveal.jsx';
import Carousel from '../ui/Carousel.jsx';
import ProductCard from './ProductCard.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { BESTSELLERS } from '../../data/products.js';

/** Bestsellers rail — editorial picks across categories. */
export default function BestsellerSection() {
  return (
    <Reveal as="section" className="section" aria-labelledby="bestseller-heading">
      <SectionHeader
        id="bestseller-heading"
        title="Bestsellers"
        subtitle="Jo abhi sabse zyada bik rahe hain"
        icon="star"
      />

      <Carousel label="Bestseller products" itemCount={BESTSELLERS.length}>
        {BESTSELLERS.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </Carousel>
    </Reveal>
  );
}