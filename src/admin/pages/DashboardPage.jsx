import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader, Panel, Select, StatCard, StatusPill, EmptyState } from '../components/AdminUI.jsx';
import {
  LocationChart,
  OrderVolumeChart,
  ProfitLossChart,
  RevenueChart,
  StatusDonut,
} from '../components/charts.jsx';
import { useAdmin, selectDashboard } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

/** Renders "—" rather than a misleading 0 for a day with no deliveries. */
const dayOrDash = (v) => (v > 0 ? formatPrice(v) : '—');

export default function DashboardPage() {
  const state = useAdmin();
  const [range, setRange] = useState('30');

  const d = useMemo(() => selectDashboard(state, Number(range)), [state, range]);
  const { cards, extras } = d;

  // Yesterday's revenue, for a like-for-like comparison on "today".
  const todayDelta = useMemo(() => {
    if (d.series.length < 2) return null;
    const today = d.series[d.series.length - 1].revenue;
    const yesterday = d.series[d.series.length - 2].revenue;
    if (!yesterday) return null;
    return Math.round(((today - yesterday) / yesterday) * 100);
  }, [d.series]);

  const statusData = [
    { name: 'Delivered', value: cards.deliveredOrders },
    { name: 'Pending', value: cards.pendingOrders },
    { name: 'Cancelled', value: cards.cancelledOrders },
    { name: 'Returned', value: cards.returnedOrders },
  ].filter((x) => x.value > 0);

  const lowStockTotal = cards.lowStockProducts + cards.outOfStockProducts;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${SITE_LINE} · ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`}
        actions={
          <>
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Chart date range"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            <button type="button" className="adm-btn adm-btn--outline" onClick={() => window.print()}>
              Print / PDF
            </button>
          </>
        }
      />

      {/* -------------------------------------------- 1–16 headline counters */}
      <h2 className="adm-grouphead">Sales</h2>
      <div className="adm-grid adm-grid--5">
        <StatCard label="Total sales" value={formatPrice(cards.totalSales)} icon="wallet" tone="blue" hint="All time, delivered" />
        <StatCard label="Today's sales" value={formatPrice(cards.todaySales)} icon="bolt" tone="amber" hint={dayOrDash(cards.todaySales)} delta={todayDelta ?? undefined} />
        <StatCard label="This month" value={formatPrice(cards.monthlySales)} icon="grid" tone="violet" hint={new Date().toLocaleString('en-IN', { month: 'long' })} />
        <StatCard label="This year" value={formatPrice(cards.yearlySales)} icon="star" tone="green" hint={String(new Date().getFullYear())} />
        <StatCard label="Total orders" value={formatCompact(cards.totalOrders)} icon="truck" tone="grey" hint={`${formatPrice(extras.avgOrderValue)} avg`} />
      </div>

      <h2 className="adm-grouphead">Order status</h2>
      <div className="adm-grid adm-grid--5">
        <StatCard label="Pending orders" value={formatCompact(cards.pendingOrders)} icon="bell" tone="amber" hint="Awaiting confirmation" />
        <StatCard label="Delivered orders" value={formatCompact(cards.deliveredOrders)} icon="check" tone="green" hint="Completed" />
        <StatCard label="Cancelled orders" value={formatCompact(cards.cancelledOrders)} icon="close" tone="red" hint="By customer or stock" />
        <StatCard label="Returned orders" value={formatCompact(cards.returnedOrders)} icon="refresh" tone="red" hint="Refunded or replaced" />
        <StatCard label="Total staff" value={formatCompact(cards.totalStaff)} icon="user" tone="grey" hint="Active accounts" />
      </div>

      <h2 className="adm-grouphead">Customers &amp; catalogue</h2>
      <div className="adm-grid adm-grid--5">
        <StatCard label="Total customers" value={formatCompact(cards.totalCustomers)} icon="user" tone="blue" hint="Registered" />
        <StatCard label="Active customers" value={formatCompact(cards.activeCustomers)} icon="check" tone="green" hint="Ordered in last 90 days" />
        <StatCard label="Total products" value={formatCompact(cards.totalProducts)} icon="grid" tone="violet" hint="Active catalogue" />
        <StatCard label="Low stock" value={formatCompact(cards.lowStockProducts)} icon="bell" tone="amber" hint="At or below reorder level" />
        <StatCard label="Out of stock" value={formatCompact(cards.outOfStockProducts)} icon="close" tone="red" hint="Needs reordering" />
      </div>

      <h2 className="adm-grouphead">Financials</h2>
      <div className="adm-grid adm-grid--4">
        <StatCard label="Gross profit" value={formatPrice(extras.profit)} icon="wallet" tone="green" hint="Delivered orders only" />
        <StatCard label="Cost of goods sold" value={formatPrice(extras.cogs)} icon="truck" tone="grey" hint="Purchase cost" />
        <StatCard label="Gross margin" value={`${extras.grossMargin.toFixed(1)}%`} icon="star" tone="violet" hint="Profit ÷ revenue" />
        <StatCard label="Inventory value" value={formatPrice(extras.inventoryValue)} icon="grid" tone="blue" hint="At purchase price" />
      </div>

      {/* ------------------------------------------- 16–17 revenue & P&L */}
      <h2 className="adm-grouphead">Charts</h2>
      <div className="adm-grid adm-grid--2">
        <RevenueChart data={d.series} />
        <ProfitLossChart data={d.series} />
        <RevenueChart data={d.monthly} months />
        <OrderVolumeChart data={d.series} />
      </div>

      {/* ------------------------------------------ 18–20 + operational */}
      <h2 className="adm-grouphead">Performance</h2>
      <div className="adm-grid adm-grid--2">
        <Panel title="Top-selling products" subtitle="By revenue, live orders" bodyClass="adm-panel__body--flush">
          {d.topSellers.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <ol className="adm-rank">
              {d.topSellers.map((p, i) => (
                <li key={p.productId} className="adm-rank__row">
                  <span className="adm-rank__no">{i + 1}</span>
                  <span className="adm-rank__name">{p.name}</span>
                  <span className="adm-rank__units t-numeric">{formatCompact(p.units)} units</span>
                  <span className="adm-rank__rev t-numeric">{formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <LocationChart data={d.locations} />
      </div>

      <div className="adm-grid adm-grid--3">
        <Panel title="Sales by location" subtitle="Cities ranked by revenue" bodyClass="adm-panel__body--flush">
          <table className="adm-table adm-table--mini">
            <thead>
              <tr>
                <th scope="col">City</th>
                <th scope="col">State</th>
                <th scope="col" className="is-right">Orders</th>
                <th scope="col" className="is-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {d.locations.map((l) => (
                <tr key={l.city}>
                  <td>{l.city}</td>
                  <td className="adm-muted">{l.state}</td>
                  <td className="is-right t-numeric">{formatCompact(l.orders)}</td>
                  <td className="is-right t-numeric">{formatPrice(l.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <StatusDonut data={statusData} />

        <Panel title="Recent activity" bodyClass="adm-panel__body--flush">
          {d.recentActivity.length === 0 ? (
            <EmptyState title="No activity recorded" />
          ) : (
            <ul className="adm-feed">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="adm-feed__row">
                  <span className={`adm-feed__dot adm-feed__dot--${a.type.split('.')[0]}`} aria-hidden="true" />
                  <span className="adm-feed__body">
                    <span className="adm-feed__action">{a.action}</span>
                    <span className="adm-feed__meta">{a.actor} · {a.target}</span>
                  </span>
                  <time className="adm-feed__time" dateTime={a.at.replace(' ', 'T')}>
                    {relativeTime(a.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="adm-grid adm-grid--2">
        <Panel
          title="Low stock alerts"
          subtitle={`${lowStockTotal} product(s) need attention`}
          actions={<Link className="adm-btn adm-btn--ghost adm-btn--sm" to="/admin/inventory">Manage</Link>}
          bodyClass="adm-panel__body--flush"
        >
          {[...d.outOfStockItems, ...d.lowStockItems].length === 0 ? (
            <EmptyState icon="check" title="Stock levels are healthy" />
          ) : (
            <table className="adm-table adm-table--mini">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">SKU</th>
                  <th scope="col" className="is-right">Stock</th>
                  <th scope="col" className="is-right">Reorder at</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...d.outOfStockItems, ...d.lowStockItems].map((p) => (
                  <tr key={p.id}>
                    <td className="adm-cellname">{p.title}</td>
                    <td className="adm-muted t-numeric">{p.sku}</td>
                    <td className="is-right t-numeric">{p.stock}</td>
                    <td className="is-right t-numeric">{p.reorderLevel}</td>
                    <td>
                      <StatusPill status={p.stock === 0 ? 'out of stock' : 'low'}>
                        {p.stock === 0 ? 'Out of stock' : 'Low'}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="How these numbers are calculated" subtitle="Read this before quoting a figure">
          <ul className="adm-notes">
            <li><strong>Revenue</strong> counts only <em>delivered</em> orders. Pending and dispatched orders are excluded so the figure matches money actually received.</li>
            <li><strong>GST</strong> is treated as collected on behalf of the government and is <em>not</em> counted as profit.</li>
            <li><strong>Profit</strong> = delivered revenue − cost of goods sold − shipping. It is not a fully loaded P&amp;L: rent, salaries, marketing and platform fees are not yet deducted.</li>
            <li><strong>Active customers</strong> = registered, not blocked, and ordered within the last 90 days.</li>
            <li><strong>Low stock</strong> = stock above zero but at or below the product's reorder level.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}

const SITE_LINE = 'Sawon Store · Jaynagar & Patna';

/** Compact "3h ago" style timestamp. */
function relativeTime(isoish) {
  const then = new Date(isoish.replace(' ', 'T')).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-IN');
}