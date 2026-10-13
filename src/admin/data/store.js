import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { seedAuditLog, seedCoupons, seedCustomers, seedOrders, seedProducts, seedStaff, startOfDay } from './seed.js';

/**
 * Admin data store.
 *
 * PERSISTENCE: localStorage only. This is a working demo backend — it survives
 * refresh and supports create/edit/archive, but it is single-browser and not a
 * substitute for a server. `src/admin/data/backend.md` records what to swap in
 * for production (Firestore or a REST API); the shape of every entity is
 * already what a real backend would return.
 */

const KEY = 'sawonmart:admin:v1';

/* ----------------------------------------------------------------- seeding */

function buildSeed() {
  const { orders, customers } = seedOrders();
  const products = seedProducts();
  const staff = seedStaff();

  // Attribute revenue to the staff member who handled each order, so the staff
  // performance and staff-wise sales screens have something real to show.
  const byStaff = new Map();
  for (const o of orders) {
    if (o.status !== 'delivered') continue;
    byStaff.set(o.staffId, (byStaff.get(o.staffId) ?? 0) + o.total);
  }
  for (const s of staff) s.sales = byStaff.get(s.id) ?? 0;

  return {
    products,
    orders,
    customers,
    staff,
    warehouses: undefined,
    coupons: seedCoupons(),
    audit: seedAuditLog(orders, staff),
    staffSales: Object.fromEntries(byStaff),
    version: 1,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return buildSeed();
    return parsed;
  } catch {
    return buildSeed();
  }
}

let state = typeof window === 'undefined' ? buildSeed() : load();

const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — keep working in memory */
  }
}

function set(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  persist();
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => state;

/** Resets the demo back to its seeded state. */
export function resetAdminData() {
  state = buildSeed();
  persist();
  listeners.forEach((fn) => fn());
}

/* -------------------------------------------------------------- mutations */

const nowIso = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
let seq = Date.now() % 100000;

const nextId = (prefix) => `${prefix}-${String(seq++).slice(-6)}`;

/**
 * Records an audit entry.
 *
 * Newest first: every consumer (dashboard "recent activity", staff log,
 * security trail) reads `audit.slice(0, n)` assuming that order. Appending
 * would silently surface stale entries instead of what just happened.
 */
function audit(type, action, target) {
  return [
    { id: nextId('log'), type, action, actor: 'Super Admin', target, at: nowIso() },
    ...state.audit,
  ].slice(0, 200);
}

/* ------------------------------------------------------------------ hooks */

export function useAdmin() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ------------------------------------------------------------------- API */

export const admin = {
  /* ---- products ---- */
  saveProduct(product) {
    set((s) => {
      const exists = s.products.some((p) => p.id === product.id);
      const record = {
        ...product,
        updatedAt: nowIso(),
        ...(exists ? {} : { createdAt: nowIso() }),
      };
      return {
        ...s,
        products: exists
          ? s.products.map((p) => (p.id === product.id ? record : p))
          : [record, ...s.products],
        audit: audit(exists ? 'product.edit' : 'product.create', exists ? 'Updated product' : 'Created product', record.id),
      };
    });
  },

  deleteProduct(id) {
    set((s) => ({
      ...s,
      audit: audit('product.delete', 'Deleted product', id),
    }));
    // Read the previous state to recompute the list.
    set((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  },

  /** Soft delete: keeps order history intact, which is what accounting needs. */
  archiveProduct(id, archived = true) {
    set((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, archived, status: archived ? 'inactive' : 'active' } : p)),
      audit: audit('product.archive', archived ? 'Archived product' : 'Restored product', id),
    }));
  },

  adjustStock(id, delta, reason = 'Manual adjustment') {
    set((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: nowIso() } : p
      ),
      audit: audit('stock.adjust', `${reason} (${delta > 0 ? '+' : ''}${delta})`, id),
    }));
  },

  /* ---- orders ---- */
  updateOrderStatus(id, status) {
    set((s) => {
      const order = s.orders.find((o) => o.id === id);
      if (!order || order.status === status) return s;

      const now = new Date();
      return {
        ...s,
        orders: s.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                // Profit is only recognised once the money is actually kept.
                profit: status === 'delivered' ? Math.round(o.total - o.cost) : 0,
                deliveredAt: status === 'delivered' ? now.toISOString().slice(0, 19).replace('T', ' ') : o.deliveredAt,
                paymentStatus:
                  status === 'delivered' ? 'paid' : status === 'cancelled' ? 'cancelled' : o.paymentStatus,
                // Stock leaves the warehouse when the parcel does.
                products:
                  ['dispatched', 'delivered'].includes(status) && !['dispatched', 'delivered'].includes(order.status)
                    ? s.products
                    : s.products,
              }
            : o
        ),
        audit: audit('order.status', `Status → ${status}`, id),
      };
    });

    // Deduct stock exactly once, when an order is first dispatched.
    const order = state.orders.find((o) => o.id === id);
    if (order && status === 'dispatched' && !order.trackingNumber) {
      set((s) => ({
        ...s,
        products: s.products.map((p) => {
          const line = order.items.find((i) => i.productId === p.id);
          return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
        }),
      }));
      set((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === id ? { ...o, trackingNumber: `TRK${Math.floor(10000000 + Math.random() * 89999999)}` } : o
        ),
      }));
    }
  },

  /* ---- customers ---- */
  setCustomerStatus(id, status) {
    set((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === id ? { ...c, status } : c)),
      audit: audit('customer.status', `Customer ${status}`, id),
    }));
  },

  /* ---- staff ---- */
  saveStaff(member) {
    set((s) => {
      const exists = s.staff.some((m) => m.id === member.id);
      const record = exists ? member : { ...member, id: nextId('STF'), joinedAt: new Date().toISOString().slice(0, 10), sales: 0, attendance: 100 };
      return {
        ...s,
        staff: exists ? s.staff.map((m) => (m.id === record.id ? record : m)) : [...s.staff, record],
        audit: audit('staff.manage', exists ? 'Updated staff' : 'Created staff', record.id),
      };
    });
  },

  toggleStaffStatus(id) {
    set((s) => ({
      ...s,
      staff: s.staff.map((m) => (m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m)),
      audit: audit('staff.manage', 'Toggled staff status', id),
    }));
  },

  /* ---- coupons ---- */
  saveCoupon(coupon) {
    set((s) => {
      const exists = s.coupons.some((c) => c.code === coupon.code);
      return {
        ...s,
        coupons: exists ? s.coupons.map((c) => (c.code === coupon.code ? coupon : c)) : [...s.coupons, coupon],
        audit: audit('discount.manage', exists ? 'Updated coupon' : 'Created coupon', coupon.code),
      };
    });
  },

  deleteCoupon(code) {
    set((s) => ({ ...s, coupons: s.coupons.filter((c) => c.code !== code) }));
  },

  /* ---- audit ---- */
  logAction(type, action, target) {
    set((s) => ({ ...s, audit: audit(type, action, target) }));
  },
};

/* ------------------------------------------------------------- selectors */

export function selectDashboard(s, rangeDays = 30) {
  const now = new Date();
  const startToday = startOfDay(now);

  const dayStart = (d) => {
    const t = new Date(d);
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  };

  const inRange = (o, fromMs) => new Date(o.placedAt.replace(' ', 'T')).getTime() >= fromMs;

  const sumTotal = (list) => list.reduce((s2, o) => s2 + o.total, 0);
  const isLive = (o) => !['cancelled', 'returned', 'refunded'].includes(o.status);
  const paid = (o) => o.status === 'delivered';

  const today = s.orders.filter((o) => dayStart(o.placedAt) === startToday);
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const yearFrom = new Date(now.getFullYear(), 0, 1).getTime();
  const rangeFrom = startToday - (rangeDays - 1) * 86_400_000;

  const month = s.orders.filter((o) => new Date(o.placedAt.replace(' ', 'T')).getTime() >= monthFrom);
  const year = s.orders.filter((o) => new Date(o.placedAt.replace(' ', 'T')).getTime() >= yearFrom);
  const range = s.orders.filter((o) => inRange(o, rangeFrom));

  const revenue = sumTotal(s.orders.filter(paid));
  const profit = s.orders.filter(paid).reduce((a, o) => a + o.profit, 0);
  const cogs = s.orders.filter(paid).reduce((a, o) => a + o.cost, 0);

  /* ---- daily series for charts ---- */
  const series = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const dayStartMs = startToday - i * 86_400_000;
    const dayEnd = dayStartMs + 86_400_000;
    const dayOrders = s.orders.filter((o) => {
      const t = new Date(o.placedAt.replace(' ', 'T')).getTime();
      return t >= dayStartMs && t < dayEnd;
    });
    const dayRevenue = sumTotal(dayOrders.filter(paid));
    const dayProfit = dayOrders.filter(paid).reduce((a, o) => a + o.profit, 0);

    series.push({
      date: new Date(dayStartMs).toISOString().slice(5, 10),
      revenue: dayRevenue,
      profit: dayProfit,
      cost: dayRevenue - dayProfit,
      orders: dayOrders.length,
    });
  }

  /* ---- monthly series ---- */
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = d.getTime();
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const list = s.orders.filter((o) => {
      const t = new Date(o.placedAt.replace(' ', 'T')).getTime();
      return t >= from && t < to;
    });
    const rev = sumTotal(list.filter(paid));
    monthly.push({
      month: d.toLocaleString('en-IN', { month: 'short' }),
      revenue: rev,
      profit: list.filter(paid).reduce((a, o) => a + o.profit, 0),
      orders: list.length,
    });
  }

  /* ---- top sellers ---- */
  const units = new Map();
  for (const o of s.orders) {
    if (!isLive(o)) continue;
    for (const line of o.items) {
      const prev = units.get(line.productId) ?? { name: line.name, units: 0, revenue: 0, productId: line.productId };
      prev.units += line.qty;
      prev.revenue += line.unitPrice * line.qty;
      units.set(line.productId, prev);
    }
  }
  const topSellers = [...units.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  /* ---- sales by location ---- */
  const byLocation = new Map();
  for (const o of s.orders) {
    if (!isLive(o)) continue;
    const prev = byLocation.get(o.city) ?? { city: o.city, state: o.state, orders: 0, revenue: 0 };
    prev.orders += 1;
    prev.revenue += o.total;
    byLocation.set(o.city, prev);
  }
  const locations = [...byLocation.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  /* ---- stock health ---- */
  const active = s.products.filter((p) => !p.archived);
  const lowStock = active.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = active.filter((p) => p.stock === 0);

  const count = (status) => s.orders.filter((o) => o.status === status).length;

  return {
    cards: {
      totalSales: revenue,
      todaySales: sumTotal(today.filter(paid)),
      monthlySales: sumTotal(month.filter(paid)),
      yearlySales: sumTotal(year.filter(paid)),
      totalOrders: s.orders.length,
      pendingOrders: count('pending'),
      deliveredOrders: count('delivered'),
      cancelledOrders: count('cancelled'),
      returnedOrders: count('returned'),
      totalCustomers: s.customers.length,
      activeCustomers: s.customers.filter((c) => {
        if (c.status !== 'active') return false;
        const t = new Date(c.lastOrderAt.replace(' ', 'T')).getTime();
        return t >= startToday - 90 * 86_400_000;
      }).length,
      totalProducts: active.length,
      lowStockProducts: lowStock.length,
      outOfStockProducts: outOfStock.length,
      totalStaff: s.staff.filter((m) => m.status === 'active').length,
    },
    extras: {
      profit,
      cogs,
      grossMargin: revenue ? ((revenue - cogs) / revenue) * 100 : 0,
      rangeRevenue: sumTotal(range.filter(paid)),
      rangeOrders: range.length,
      inventoryValue: active.reduce((a, p) => a + p.purchasePrice * p.stock, 0),
      avgOrderValue: (() => {
        const done = s.orders.filter(paid);
        return done.length ? sumTotal(done) / done.length : 0;
      })(),
    },
    series,
    monthly,
    topSellers,
    locations,
    recentActivity: s.audit.slice(0, 12),
    lowStockItems: lowStock.slice(0, 6),
    outOfStockItems: outOfStock.slice(0, 6),
  };
}

export { selectDashboard as computeDashboard };