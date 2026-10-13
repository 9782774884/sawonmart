/**
 * Deterministic demo seed.
 *
 * A seeded PRNG is used rather than Math.random so every reload, every machine
 * and every screenshot shows the SAME figures. An admin dashboard whose totals
 * change on refresh is impossible to sanity-check.
 */

import { PRODUCTS } from '../../data/products.js';

/* ------------------------------------------------------------ seeded PRNG */

/** Mulberry32 — small, fast, deterministic. */
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = prng(20260813);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));

/* ------------------------------------------------------------------ dates */

const DAY = 86_400_000;
const TODAY = new Date();
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const daysAgo = (n) => new Date(startOfDay(TODAY) - n * DAY);

const iso = (d) => d.toISOString().slice(0, 10);
const isoTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

/* --------------------------------------------------------------- products */

/** Categories mirrored from the storefront so both sides agree. */
export const SUBCATEGORIES = {
  mobiles: ['Smartphones', 'Android Phones', '5G Phones', 'Budget Mobiles', 'Accessories'],
  laptops: ['Laptops', 'Tablets', 'Desktop PCs', 'Monitors', 'Laptop Accessories'],
  audio: ['Earbuds', 'Headphones', 'Bluetooth Speakers', 'Soundbars', 'Home Theatre'],
  wearables: ['Smart Watches', 'Fitness Bands', 'Smart Glasses'],
  computers: ['Keyboards', 'Mice', 'Printers', 'Cameras', 'Monitors'],
  appliances: ['Refrigerators', 'Air Conditioners', 'Microwave Ovens', 'Kettles', 'Blenders'],
  fashion: ['T-Shirts', 'Shirts', 'Kurtas', 'Ethnic Wear', 'Jeans'],
  footwear: ['Running Shoes', 'Sneakers', 'Formal Shoes', 'Sandals'],
  bags: ['Handbags', 'Wallets', 'Backpacks', 'Luggage'],
  beauty: ['Makeup', 'Skincare', 'Fragrance', 'Hair Care'],
  books: ['Fiction', 'Non-Fiction', 'Self Help', 'Children'],
  sports: ['Helmets', 'Cycles', 'Fitness', 'Team Sports'],
  toys: ['Soft Toys', 'Building Blocks', 'Board Games', 'Educational'],
  furniture: ['Chairs', 'Sofas', 'Tables', 'Beds'],
};

/** Indian HSN code prefixes, used to keep the field plausible. */
const HSN_PREFIX = {
  mobiles: '8517', laptops: '8471', audio: '8518', wearables: '9102',
  computers: '8471', appliances: '8516', fashion: '6109', footwear: '6403',
  bags: '4202', beauty: '3304', books: '4901', sports: '9506',
  toys: '9503', furniture: '9403',
};

export const GST_RATES = [0, 5, 12, 18, 28];

const WAREHOUSES = [
  { id: 'wh-jn', name: 'Jaynagar Main Warehouse', code: 'JNR-01', city: 'Jaynagar', state: 'Bihar' },
  { id: 'wh-pt', name: 'Patna Branch Warehouse', code: 'PAT-02', city: 'Patna', state: 'Bihar' },
];

export function seedProducts() {
  return PRODUCTS.map((p, i) => {
    const cost = Math.round(p.price * between(0.62, 0.84));
    const wholesale = Math.round(p.price * 0.94);
    const distributor = Math.round(p.price * 0.88);

    const reorder = intBetween(8, 30);

    // Deliberately create a realistic spread of stock health so the low-stock
    // and out-of-stock dashboard counters are non-zero and meaningful.
    let stock;
    if (i % 11 === 0) stock = 0; // genuinely out of stock
    else if (i % 7 === 0) stock = intBetween(1, Math.max(1, Math.floor(reorder / 2))); // low
    else stock = intBetween(reorder + 8, 240); // healthy

    return {
      ...p,
      sku: `SM-${p.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      subcategory: pick(SUBCATEGORIES[p.category] ?? ['General']),
      hsn: `${HSN_PREFIX[p.category] ?? '9999'}${intBetween(1000, 9999)}`,
      barcode: `890${intBetween(100000000000, 999999999999)}`,
      description:
        `${p.brand} ${p.title}. ${p.highlights.join('. ')}. ` +
        `Supplied by Sawon Store and covered by manufacturer warranty.`,
      purchasePrice: cost,
      wholesalePrice: wholesale,
      distributorPrice: distributor,
      gstRate: pick(GST_RATES),
      weightKg: Number(between(0.15, 12).toFixed(2)),
      dimensions: {
        length: Number(between(8, 60).toFixed(1)),
        width: Number(between(6, 45).toFixed(1)),
        height: Number(between(2, 30).toFixed(1)),
        unit: 'cm',
      },
      variants: {
        size: p.category === 'fashion' || p.category === 'footwear' ? ['S', 'M', 'L', 'XL'] : [],
        color: p.colors,
        capacity:
          ['appliances', 'audio', 'wearables'].includes(p.category)
            ? [pick(['500 ml', '1 L', '5 L', '10 L'])]
            : [],
      },
      videoUrl: '',
      stock,
      reorderLevel: reorder,
      minOrderQty: 1,
      maxOrderQty: 10,
      lowStockThreshold: Math.max(reorder, 12),
      status: 'active',
      featured: ['Best Seller', 'Editor Choice'].includes(p.badge),
      newArrival: intBetween(0, 40) <= 8,
      archived: false,
      warehouseId: rand() > 0.4 ? 'wh-jn' : 'wh-pt',
      purchaseDate: iso(daysAgo(intBetween(30, 700))),
      seo: {
        title: `${p.title} | Buy online`,
        description: p.highlights.join(', '),
        keywords: [p.brand, p.category, ...p.highlights.slice(0, 2)].join(', '),
        slug: p.id,
      },
      createdAt: isoTime(daysAgo(intBetween(60, 900))),
    };
  });
}

/* --------------------------------------------------------------- customers */

const FIRST = ['Aarav', 'Priya', 'Rohit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Meera', 'Karan', 'Divya', 'Sanjay', 'Pooja', 'Amit', 'Kavya', 'Nikhil', 'Ritu', 'Suresh', 'Anjali'];
const LAST = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Patel', 'Yadav', 'Prasad', 'Kumari', 'Das', 'Roy', 'Dev', 'Sah'];
const CITIES = [
  { city: 'Patna', state: 'Bihar', pin: '800001' },
  { city: 'Jaynagar', state: 'Bihar', pin: '847226' },
  { city: 'Madhubani', state: 'Bihar', pin: '847211' },
  { city: 'Darbhanga', state: 'Bihar', pin: '846001' },
  { city: 'Muzaffarpur', state: 'Bihar', pin: '842001' },
  { city: 'Gaya', state: 'Bihar', pin: '823001' },
  { city: 'Bhagalpur', state: 'Bihar', pin: '812001' },
  { city: 'Purnia', state: 'Bihar', pin: '854101' },
  { city: 'Delhi', state: 'Delhi', pin: '110001' },
  { city: 'Mumbai', state: 'Maharashtra', pin: '400001' },
];

export function seedCustomers(count = 240) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const loc = pick(CITIES);
    const created = daysAgo(intBetween(0, 720));
    // "Active" = ordered within the last 90 days.
    const lastOrder = daysAgo(intBetween(0, 300));

    out.push({
      id: `cus-${String(i + 1).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `9${intBetween(100000000, 999999999)}`,
      city: loc.city,
      state: loc.state,
      pincode: loc.pin,
      address: `${intBetween(1, 200)}, ${pick(['Main Road', 'Station Road', 'Gandhi Nagar', 'New Colony', 'Bazaar Road'])}`,
      status: rand() > 0.94 ? 'blocked' : 'active',
      wallet: Math.round(between(0, 5000)),
      loyaltyPoints: intBetween(0, 4200),
      orders: 0, // filled in after orders are generated
      spent: 0,
      joinedAt: isoTime(created),
      lastOrderAt: isoTime(lastOrder),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ orders */

const ORDER_STATUSES = [
  'pending', 'confirmed', 'packed', 'dispatched', 'delivered',
  'cancelled', 'returned', 'refunded',
];
/** Statuses a *new* order can realistically still be in today. */
const LIVE_STATUSES = ['pending', 'confirmed', 'packed', 'dispatched'];

const PAYMENT_MODES = ['UPI', 'Card', 'Net Banking', 'COD', 'Wallet'];

export function seedOrders(count = 1450) {
  const products = seedProducts();
  const customers = seedCustomers();
  const out = [];

  for (let i = 0; i < count; i++) {
    const ageDays = intBetween(0, 365);
    const placed = daysAgo(ageDays);

    // Older orders are far more likely to have reached a terminal state.
    // Weighted toward 'delivered' on purpose: a real storefront settles the
    // large majority of orders, and a demo where half of all orders were
    // cancelled or returned would make the dashboard KPIs meaningless.
    let status;
    if (ageDays < 3) status = pick(['pending', 'confirmed', 'confirmed', 'packed']);
    else if (ageDays < 10) {
      status = pick([
        'confirmed', 'packed', 'dispatched',
        'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
        'cancelled', 'returned',
      ]);
    } else {
      status = pick([
        'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
        'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
        'cancelled', 'returned', 'refunded',
      ]);
    }

    if (!ORDER_STATUSES.includes(status)) status = 'delivered';

    const lines = intBetween(1, 4);
    const items = Array.from({ length: lines }, () => {
      const p = pick(products);
      const qty = intBetween(1, 3);
      const unit = p.price;
      return {
        productId: p.id,
        name: p.title,
        sku: p.sku,
        qty,
        unitPrice: unit,
        // A realistic discount on the line, not a fabricated one.
        discount: rand() > 0.6 ? Math.round((unit * between(0.05, 0.35)) / 10) * 10 : 0,
        gstRate: p.gstRate,
      };
    });

    const gross = items.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const discount = items.reduce((s, l) => s + l.discount * l.qty, 0);
    const taxable = gross - discount;
    const gst = items.reduce((s, l) => s + (l.unitPrice * l.qty - l.discount * l.qty) * (l.gstRate / 100), 0);
    const shipping = taxable > 500 ? 0 : intBetween(40, 90);
    const total = Math.round(taxable + gst + shipping);

    const cost = items.reduce((s, l) => {
      const p = products.find((x) => x.id === l.productId);
      return s + (p?.purchasePrice ?? 0) * l.qty;
    }, 0);

    const customer = pick(customers);
    const delivered = status === 'delivered';

    out.push({
      id: `SM-${100000 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      city: customer.city,
      state: customer.state,
      pincode: customer.pin,
      items,
      gross: Math.round(gross),
      discount: Math.round(discount),
      gst: Math.round(gst),
      shipping,
      total,
      cost: Math.round(cost),
      // Realised profit only counts on money actually kept.
      profit: delivered ? Math.round(total - cost - shipping * 0.5) : 0,
      status,
      paymentMode: pick(PAYMENT_MODES),
      paymentStatus: ['delivered', 'returned'].includes(status)
        ? 'paid'
        : status === 'cancelled'
          ? 'cancelled'
          : 'pending',
      gstin: '10FSRPS8895F1ZW',
      warehouseId: rand() > 0.4 ? 'wh-jn' : 'wh-pt',
      placedAt: isoTime(placed),
      deliveredAt: delivered ? isoTime(new Date(placed.getTime() + intBetween(2, 8) * DAY)) : null,
      trackingNumber: delivered || status === 'dispatched' ? `TRK${intBetween(10000000, 99999999)}` : null,
      channel: pick(['Web', 'Mobile App', 'WhatsApp']),
      staffId: null, // assigned below
    });
  }

  // ---- roll up customer aggregates from the generated orders -------------
  const totals = new Map();
  for (const o of out) {
    if (['cancelled', 'refunded'].includes(o.status)) continue;
    const prev = totals.get(o.customerId) ?? { orders: 0, spent: 0 };
    prev.orders += 1;
    prev.spent += o.total;
    totals.set(o.customerId, prev);
  }
  for (const c of customers) {
    const t = totals.get(c.id);
    c.orders = t?.orders ?? 0;
    c.spent = t?.spent ?? 0;
  }

  // ---- assign a staff member to each order ---------------------------------
  const staffIds = ['STF-0003', 'STF-0004', 'STF-0005', 'STF-0006'];
  for (const o of out) o.staffId = pick(staffIds);

  return { orders: out.sort((a, b) => b.placedAt.localeCompare(a.placedAt)), customers };
}

/* ------------------------------------------------------------------- staff */

export function seedStaff() {
  return [
    {
      id: 'STF-0001', name: 'Super Admin', email: 'admin@sawonstore.in', phone: '8503988085',
      role: 'superadmin', department: 'Management', status: 'active',
      joinedAt: '2024-01-04', salary: 0, workingHours: '10:00–19:00',
      attendance: 100, sales: 0, twoFactor: true, avatar: 'brand/avatar-a.svg',
    },
    {
      id: 'STF-0002', name: 'Store Manager', email: 'manager@sawonstore.in', phone: '8503988086',
      role: 'manager', department: 'Operations', status: 'active',
      joinedAt: '2024-06-11', salary: 45000, workingHours: '10:00–18:00',
      attendance: 96, sales: 0, twoFactor: true, avatar: 'brand/avatar-b.svg',
    },
    {
      id: 'STF-0003', name: 'Rakesh Yadav', email: 'rakesh@sawonstore.in', phone: '8503988087',
      role: 'staff', department: 'Sales', status: 'active',
      joinedAt: '2025-01-20', salary: 22000, workingHours: '10:00–18:00',
      attendance: 92, sales: 0, twoFactor: false, avatar: 'brand/avatar-c.svg',
    },
    {
      id: 'STF-0004', name: 'Priya Sharma', email: 'priya@sawonstore.in', phone: '8503988088',
      role: 'staff', department: 'Support', status: 'active',
      joinedAt: '2025-04-02', salary: 21000, workingHours: '11:00–19:00',
      attendance: 98, sales: 0, twoFactor: true, avatar: 'brand/avatar-a.svg',
    },
    {
      id: 'STF-0005', name: 'Md. Irfan', email: 'irfan@sawonstore.in', phone: '8503988089',
      role: 'staff', department: 'Warehouse', status: 'active',
      joinedAt: '2025-07-15', salary: 20000, workingHours: '09:00–17:00',
      attendance: 89, sales: 0, twoFactor: false, avatar: 'brand/avatar-b.svg',
    },
    {
      id: 'STF-0006', name: 'Sunita Kumari', email: 'sunita@sawonstore.in', phone: '8503988090',
      role: 'staff', department: 'Sales', status: 'suspended',
      joinedAt: '2025-03-08', salary: 19500, workingHours: '10:00–18:00',
      attendance: 71, sales: 0, twoFactor: false, avatar: 'brand/avatar-c.svg',
    },
  ];
}

/* ------------------------------------------------------- operational records */

export function seedCoupons() {
  return [
    { code: 'SAWON100', type: 'flat', value: 100, minOrder: 1999, usageLimit: 5000, used: 1840, expires: '2026-12-31', status: 'active' },
    { code: 'FESTIVE200', type: 'flat', value: 200, minOrder: 2999, usageLimit: 2000, used: 1930, expires: '2026-11-30', status: 'active' },
    { code: 'BBD50', type: 'percent', value: 50, maxDiscount: 1500, minOrder: 9999, usageLimit: 500, used: 118, expires: '2026-10-20', status: 'active' },
    { code: 'EXPIRED50', type: 'percent', value: 50, minOrder: 4999, usageLimit: 1000, used: 1000, expires: '2026-06-30', status: 'expired' },
  ];
}

export function seedAuditLog(orders, staff) {
  const actions = [
    ['order.status', 'Changed order status'],
    ['product.edit', 'Updated product details'],
    ['stock.adjust', 'Adjusted stock quantity'],
    ['refund.issue', 'Issued refund'],
    ['product.mrp.edit', 'Changed MRP'],
    ['staff.login', 'Signed in'],
  ];
  const out = [];
  for (let i = 0; i < 40; i++) {
    const [type, action] = pick(actions);
    out.push({
      id: `log-${i + 1}`,
      type,
      action,
      actor: pick(staff).name,
      target: type.startsWith('order') ? pick(orders).id : pick(['SM-PHO-0007', 'SM-LAP-0003', 'SM-AUD-0002']),
      at: isoTime(new Date(Date.now() - intBetween(1, 720) * 3600_000)),
    });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export { WAREHOUSES, startOfDay, daysAgo, iso, isoTime, DAY, TODAY, prng };