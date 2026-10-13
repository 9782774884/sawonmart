import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import Breadcrumbs from '../components/product/Breadcrumbs.jsx';
import ProductGallery from '../components/product/ProductGallery.jsx';
import BuyBox from '../components/product/BuyBox.jsx';
import SpecsTable from '../components/product/SpecsTable.jsx';
import ProductReviews from '../components/product/ProductReviews.jsx';

import ProductCard from '../components/home/ProductCard.jsx';
import Carousel from '../components/ui/Carousel.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Icon from '../components/ui/Icon.jsx';
import NotFoundPage from './NotFoundPage.jsx';

import { CATEGORY_LABELS, findProduct, getRelatedProducts } from '../data/products.js';
import { buildDescription, buildOffers, buildSpecs } from '../data/specs.js';
import { SITE } from '../utils/constants.js';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';

/**
 * Product description page — route "/product/:id".
 *
 * The page is data-driven: everything below comes from the :id route param,
 * so any catalogue item automatically gets a full detail page.
 */
export default function ProductPage() {
  const { id } = useParams();
  const product = findProduct(id);

  const offers = useMemo(() => (product ? buildOffers(product) : []), [product]);
  const specs = useMemo(() => (product ? buildSpecs(product) : []), [product]);
  const description = useMemo(() => (product ? buildDescription(product) : []), [product]);
  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product]);

  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;

  // Unknown id → show the 404 view rather than rendering an empty shell.
  if (!product) return <NotFoundPage />;

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: categoryLabel, to: '/' },
    { label: product.brand, to: '/' },
    { label: product.title },
  ];

  return (
    <>
      {/* Route-level <title>, meta description and schema.org JSON-LD. */}
      <ProductMeta product={product} categoryLabel={categoryLabel} />

      <div className="container">
        <Breadcrumbs items={crumbs} />

        {/* ------------------------------------------------- gallery + buybox */}
        <div className="pdp">
          <div className="pdp__media">
            <ProductGallery product={product} />
          </div>

          <div className="pdp__info">
            <BuyBox product={product} offers={offers} />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- highlights */}
      <Reveal as="section" className="section pdp-section" aria-labelledby="highlights-heading">
        <div className="container">
          <h2 className="pdp-section__title" id="highlights-heading">
            Highlights
          </h2>
          <ul className="highlights">
            {product.highlights.map((item) => (
              <li key={item} className="highlights__item">
                <Icon name="check" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------- specs */}
      <Reveal as="section" className="section section--tinted pdp-section" aria-labelledby="specs-heading">
        <div className="container">
          <h2 className="pdp-section__title" id="specs-heading">
            Specifications
          </h2>
          <SpecsTable groups={specs} />
        </div>
      </Reveal>

      {/* ------------------------------------------------------- description */}
      <Reveal as="section" className="section pdp-section" aria-labelledby="description-heading">
        <div className="container">
          <h2 className="pdp-section__title" id="description-heading">
            Description
          </h2>
          <div className="prose">
            {description.map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>

          <p className="pdp-section__meta t-text-muted">
            Model: <strong>{product.id.toUpperCase()}</strong> · Category: {categoryLabel} · Brand:{' '}
            {product.brand}
          </p>
        </div>
      </Reveal>

      {/* ----------------------------------------------------------- reviews */}
      <div className="container">
        <ProductReviews product={product} />
      </div>

      {/* ----------------------------------------------------------- related */}
      <Reveal as="section" className="section section--tinted" aria-labelledby="related-heading">
        <div className="container">
          <h2 className="pdp-section__title" id="related-heading">
            Similar products
          </h2>
        </div>

        <div className="container">
          <Carousel label="Similar products" itemCount={related.length}>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </Carousel>
        </div>
      </Reveal>

      {/* Sticky mobile action bar keeps the CTA reachable while scrolling. */}
      <div className="pdp-bar">
        <div className="pdp-bar__price">
          <span className="pdp-bar__amount">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
          <span className="pdp-bar__title t-truncate">{product.title}</span>
        </div>
        <Link className="btn btn--accent btn--md" to={`/product/${product.id}`}>
          <span className="btn__label">Add to Cart</span>
        </Link>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Route-level <title> / meta description.
 * Declared here as its own component so the hook call stays unconditional —
 * the page itself returns early for unknown ids.
 */
function ProductMeta({ product, categoryLabel }) {
  useDocumentMeta(
    product ? `${product.title} | ${SITE.name}` : `Product nahi mila | ${SITE.name}`,
    product
      ? `${product.brand} ${product.title} – ${product.highlights.join(', ')}. ` +
          `${formatPrice(product.price)} par, delivery ${product.delivery}.`
      : 'Ye product abhi available nahi hai.',
    // Per-product canonical. Without it every product page would inherit the
    // homepage URL and be treated as a duplicate of it.
    product ? `/product/${product.id}` : undefined,
    // `image` is stored relative to /assets/images/, so it needs the prefix to
    // become a real absolute URL — see ProductCard, which does the same.
    product ? `/assets/images/${product.image}` : undefined
  );

  // Nothing to render; this component only manages document metadata.
  return product ? (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(product) }} />
  ) : null;
}

/**
 * schema.org/Product JSON-LD.
 * JSON-LD must be a raw <script type="application/ld+json"> block, which JSX
 * cannot express without escaping — hence dangerouslySetInnerHTML. The payload
 * is built from our own catalogue data, not from user input.
 */
function buildJsonLd(product) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [`${window.location.origin}/assets/images/${product.image}`],
    description: product.highlights.join('. '),
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand },
    category: CATEGORY_LABELS[product.category] ?? product.category,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.ratingCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  });
}

/* -------------------------------------------------------------------------- */

/** Formats a price for use inside a meta description. */
const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);