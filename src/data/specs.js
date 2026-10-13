/**
 * Product specification tables.
 *
 * Real catalogues store specs as free-form key/value documents. We keep it
 * structured: each category has a template of rows, and values are filled in
 * from the product where available. `SPECS_BY_ID` holds product-specific
 * overrides for the flagship items.
 */

const WARRANTY = '1 year manufacturer warranty';
const RETURN = '7 day replacement';

/* ------------------------------------------------------------- overrides */

const SPECS_BY_ID = {
  'sm-ph-01': [
    {
      group: 'General',
      rows: [
        ['Model number', 'SM-S911B'],
        ['Model name', 'Cosmic Black 5G'],
        ['Series', 'Galaxy S'],
        ['Colour', 'Cosmic Black'],
        ['SIM type', 'Dual Sim'],
      ],
    },
    {
      group: 'Display',
      rows: [
        ['Display size', '6.7 inch'],
        ['Resolution', '2340 x 1080 Pixels'],
        ['Resolution type', 'Full HD+'],
        ['Refresh rate', '120 Hz'],
        ['Display type', 'Dynamic AMOLED 2X'],
      ],
    },
    {
      group: 'Camera',
      rows: [
        ['Primary camera', '50MP + 12MP + 10MP'],
        ['Secondary camera', '10MP Front Camera'],
        ['Video recording', 'Yes, 8K @ 30fps'],
        ['Flash', 'LED'],
      ],
    },
    {
      group: 'Battery & Power',
      rows: [
        ['Battery capacity', '5000 mAh'],
        ['Battery type', 'Li-ion'],
        ['Charging', '25W wired, 15W wireless'],
        ['Fast charging', 'Yes'],
      ],
    },
    {
      group: 'Warranty & Returns',
      rows: [
        ['Warranty', WARRANTY],
        ['Return policy', RETURN],
        ['Covered in warranty', 'Manufacturing defects'],
      ],
    },
  ],

  'sm-lp-01': [
    {
      group: 'General',
      rows: [
        ['Series', 'Inspire 15'],
        ['Model number', 'DL-3545'],
        ['Type', 'Thin and Light Laptop'],
        ['Colour', 'Charcoal Grey'],
        ['Usage', 'Processing'],
      ],
    },
    {
      group: 'Processor & Memory',
      rows: [
        ['Processor brand', 'Intel'],
        ['Processor name', 'Core i5 8th Gen'],
        ['Generation', '8th'],
        ['RAM', '8 GB DDR4'],
        ['SSD capacity', '512 GB'],
      ],
    },
    {
      group: 'Display',
      rows: [
        ['Screen size', '15.6 inch'],
        ['Resolution', '1920 x 1080 Pixels'],
        ['Resolution type', 'Full HD'],
        ['Screen type', 'Full HD IPS Anti-Glare'],
      ],
    },
    {
      group: 'Operating System',
      rows: [
        ['OS', 'Windows 11 Home'],
        ['Pre-installed software', 'Office Home & Student'],
      ],
    },
    {
      group: 'Warranty & Returns',
      rows: [
        ['Warranty', '1 year Onsite Warranty'],
        ['Return policy', RETURN],
      ],
    },
  ],
};

/* ------------------------------------------------------ generic fallbacks */

const GENERIC = (product) => [
  {
    group: 'General',
    rows: [
      ['Brand', product.brand],
      ['Model name', product.title.split(',')[0]],
      ['Category', product.category],
      ['Colour options', `${product.colors.length} available`],
      ['Delivery', product.delivery],
    ],
  },
  {
    group: 'Highlights',
    rows: product.highlights.map((h, i) => [`Feature ${i + 1}`, h]),
  },
  {
    group: 'Warranty & Returns',
    rows: [
      ['Warranty', WARRANTY],
      ['Return policy', RETURN],
      ['Covered in warranty', 'Manufacturing defects'],
      ['Refunded', 'Yes, if delivered and reported within 7 days'],
    ],
  },
];

/**
 * @returns {{group: string, rows: [string, string][]}[]}
 */
export function buildSpecs(product) {
  if (SPECS_BY_ID[product.id]) return SPECS_BY_ID[product.id];
  return GENERIC(product);
}

/** Longer-form marketing copy shown in the "Description" section. */
export function buildDescription(product) {
  return [
    `The ${product.brand} ${product.title} is built for people who want dependable performance without overpaying. It sits in the middle of our ${product.category} range and is one of the most ordered models in the category.`,
    `Key strengths: ${product.highlights.join(', ').toLowerCase()}. Every unit is covered by a ${WARRANTY.toLowerCase()}, and if the product does not suit you, you can return it within ${RETURN.split(' ')[0]} days at no cost.`,
    `The listing you are viewing is ${product.assured ? 'an Assured product, meaning the seller is a verified SawonMart partner and the item passes our quality checks before dispatch' : 'sold by a SawonMart marketplace partner and covered by the same return policy'}. Delivery is scheduled for ${product.delivery.toLowerCase()}.`,
  ];
}

/** Rating distribution used by the reviews block (sums to `count`). */
export function buildRatingBreakdown(rating, count) {
  // Plausible bell curve centred a little below `rating`.
  const weights = [0.42, 0.31, 0.16, 0.07, 0.04];
  const five = Math.min(1, rating / 5);
  const shifted = weights.map((w, i) => {
    const stars = 5 - i;
    const pull = Math.exp(-((stars - five) ** 2) / 1.6);
    return w * pull;
  });
  const total = shifted.reduce((a, b) => a + b, 0) || 1;

  return shifted.map((w, i) => ({
    stars: 5 - i,
    count: Math.round((w / total) * count),
  }));
}

/** Offers shown in the offers list. */
export function buildOffers(product) {
  const base = Math.round(product.price * 0.1);
  return [
    {
      id: 'bank',
      title: 'Bank Offer (10% instant discount)',
      detail: 'On SawonMart Axis Bank Credit Card, up to ₹1,250 on orders above ₹5,000',
      tag: 'Bank offer',
    },
    {
      id: 'no-cost-emi',
      title: 'No cost EMI',
      detail: `Starting from ₹${Math.round(product.price / 9)}/month on select banks`,
      tag: 'EMI',
    },
    {
      id: 'coupon',
      title: `Extra ₹${base} off`,
      detail: 'Apply coupon SAWON100 on orders above ₹1,999',
      tag: 'Coupon',
    },
    {
      id: 'exchange',
      title: 'Exchange offer',
      detail: 'Get up to ₹3,000 off by exchanging your old device',
      tag: 'Exchange',
    },
  ];
}