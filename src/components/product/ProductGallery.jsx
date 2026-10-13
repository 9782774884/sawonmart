import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Modal from '../ui/Modal.jsx';
import { cx } from '../../utils/format.js';

/**
 * Product image panel with a colour-variant picker and a zoom lightbox.
 *
 * Accessibility:
 *  - The variant picker is a real radio group (<fieldset> + <input type=radio>),
 *    so arrow keys work and the checked value is exposed natively.
 *  - The zoom dialog reuses <Modal>, which traps focus and restores it.
 */
export default function ProductGallery({ product }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const color = product.colors[colorIndex];

  return (
    <div className="gallery">
      <div className="gallery__frame" style={{ '--variant': color }}>
        <img
          className="gallery__image"
          src={`/assets/images/${product.image}`}
          alt={`${product.title} — ${colorNames(product.colors)[colorIndex]}`}
          width="560"
          height="560"
          /* The product image is the page's LCP element: load it eagerly. */
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />

        <button
          type="button"
          className="gallery__zoom"
          onClick={() => setZoomOpen(true)}
          /* Visible text "Zoom" is the accessible name; no aria-label override. */
        >
          <Icon name="search" size={18} />
          <span>Zoom</span>
        </button>
      </div>

      <fieldset className="gallery__variants">
        <legend className="gallery__variants-legend">
          {colorNames(product.colors)[colorIndex]}
          {product.colors.length > 1 ? (
            <span className="t-text-muted"> ({colorIndex + 1}/{product.colors.length})</span>
          ) : null}
        </legend>

        <div className="gallery__swatches">
          {product.colors.map((swatch, i) => (
            <label
              key={swatch + i}
              className={cx('gallery__swatch', i === colorIndex && 'is-active')}
              style={{ '--swatch': swatch }}
            >
              <input
                type="radio"
                name={`colour-${product.id}`}
                className="sr-only"
                value={swatch}
                checked={i === colorIndex}
                onChange={() => setColorIndex(i)}
              />
              <span className="gallery__swatch-dot" aria-hidden="true" />
              <span className="sr-only">{colorNames(product.colors)[i]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Modal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title={product.title}
        description={`${colorNames(product.colors)[colorIndex]} variant`}
        size="lg"
      >
        <div className="gallery__lightbox" style={{ '--variant': color }}>
          <img
            src={`/assets/images/${product.image}`}
            alt={`${product.title} — ${colorNames(product.colors)[colorIndex]}`}
            width="720"
            height="720"
          />
        </div>
      </Modal>
    </div>
  );
}

/** Neutral colour names so the variant choice is not colour-number only. */
function colorNames(colors) {
  const NAMES = {
    '#1c212b': 'Black',
    '#12161f': 'Midnight Black',
    '#2f3542': 'Charcoal',
    '#8ab4f8': 'Sky Blue',
    '#c6cfdd': 'Silver',
    '#9aa3b2': 'Grey',
    '#f1f3f6': 'White',
    '#7c4dff': 'Purple',
    '#ff4747': 'Red',
    '#d4427a': 'Pink',
    '#33994d': 'Green',
    '#0f9d58': 'Green',
    '#dd8b12': 'Amber',
    '#6b4b23': 'Brown',
    '#a1762f': 'Tan',
    '#25988c': 'Teal',
    '#2874f0': 'Blue',
    '#e3000b': 'Bright Red',
  };
  return colors.map((c, i) => NAMES[c.toLowerCase()] ?? `Variant ${i + 1}`);
}