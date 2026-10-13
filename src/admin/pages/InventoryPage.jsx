import { useMemo, useState } from 'react';

import DataTable from '../components/DataTable.jsx';
import { PageHeader, Panel, Select, StatCard, StatusPill } from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

const WAREHOUSES = [
  { id: 'wh-jn', name: 'Jaynagar Main', city: 'Jaynagar' },
  { id: 'wh-pt', name: 'Patna Branch', city: 'Patna' },
];

export default function InventoryPage() {
  const state = useAdmin();
  const [warehouse, setWarehouse] = useState('all');
  const [view, setView] = useState('alerts');

  const scoped = useMemo(
    () => (warehouse === 'all' ? state.products : state.products.filter((p) => p.warehouseId === warehouse)),
    [state.products, warehouse]
  );

  const alerts = useMemo(
    () => scoped.filter((p) => !p.archived && p.stock <= p.lowStockThreshold),
    [scoped]
  );

  const rows = useMemo(() => {
    const list =
      view === 'alerts' ? alerts
        : view === 'out' ? scoped.filter((p) => !p.archived && p.stock === 0)
          : scoped.filter((p) => !p.archived);
    return [...list].sort((a, b) => a.stock - b.stock);
  }, [view, scoped, alerts]);

  const valuation = scoped.filter((p) => !p.archived).reduce((s, p) => s + p.purchasePrice * p.stock, 0);
  const retailValue = scoped.filter((p) => !p.archived).reduce((s, p) => s + p.price * p.stock, 0);
  const units = scoped.filter((p) => !p.archived).reduce((s, p) => s + p.stock, 0);

  const adjust = (product, delta) => {
    const reason = delta > 0 ? 'Stock inward' : 'Stock outward';
    if (window.confirm(`${reason}: ${delta > 0 ? '+' : ''}${delta} for ${product.sku}?`)) {
      admin.adjustStock(product.id, delta, reason);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Product',
      value: (r) => `${r.title} ${r.sku}`,
      render: (r) => (
        <span>
          <span className="adm-cellmain">{r.title}</span>
          <span className="adm-muted t-numeric">{r.sku} · {r.warehouseId}</span>
        </span>
      ),
    },
    { key: 'stock', header: 'In stock', value: (r) => r.stock, sortValue: (r) => r.stock, align: 'right', render: (r) => <span className="t-numeric">{r.stock}</span> },
    { key: 'lowStockThreshold', header: 'Alert at', value: (r) => r.lowStockThreshold, align: 'right' },
    { key: 'reorderLevel', header: 'Reorder at', value: (r) => r.reorderLevel, align: 'right' },
    {
      key: 'value',
      header: 'Stock value',
      value: (r) => r.purchasePrice * r.stock,
      sortValue: (r) => r.purchasePrice * r.stock,
      align: 'right',
      render: (r) => <span className="t-numeric">{formatPrice(r.purchasePrice * r.stock)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      value: (r) => (r.stock === 0 ? 'out of stock' : r.stock <= r.lowStockThreshold ? 'low' : 'ok'),
      render: (r) =>
        r.stock === 0 ? <StatusPill status="out of stock">Out of stock</StatusPill>
          : r.stock <= r.lowStockThreshold ? <StatusPill status="low">Low stock</StatusPill>
            : <StatusPill status="ok">Healthy</StatusPill>,
    },
    {
      key: 'adjust',
      header: 'Adjust',
      sortable: false,
      value: () => '',
      render: (r) => (
        <span className="adm-rowactions">
          {/* The visible "+1" / "−1" is part of the accessible name, so the
              spoken label and the on-screen text agree. */}
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => adjust(r, 1)}
            aria-label={`+1 ${r.sku} stock increase`}
          >
            +1
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => adjust(r, -1)}
            disabled={r.stock === 0}
            aria-label={`−1 ${r.sku} stock decrease`}
          >
            −1
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--outline adm-btn--sm"
            onClick={() => {
              const n = Number(window.prompt(`Restock ${r.sku} by how many units?`, String(r.reorderLevel * 2)));
              if (n > 0) adjust(r, n);
            }}
            aria-label={`Restock ${r.sku}`}
          >
            Restock
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Inventory' }]}
        title="Inventory & warehouse"
        subtitle={`${formatCompact(units)} units across ${WAREHOUSES.length} warehouses`}
        actions={
          <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} aria-label="Warehouse">
            <option value="all">All warehouses</option>
            {WAREHOUSES.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
        }
      />

      <div className="adm-grid adm-grid--4">
        <StatCard label="Stock value (cost)" value={formatPrice(valuation)} icon="wallet" tone="blue" />
        <StatCard label="Stock value (retail)" value={formatPrice(retailValue)} icon="star" tone="violet" />
        <StatCard label="Low stock" value={formatCompact(alerts.filter((p) => p.stock > 0).length)} icon="bell" tone="amber" />
        <StatCard label="Out of stock" value={formatCompact(alerts.filter((p) => p.stock === 0).length)} icon="close" tone="red" />
      </div>

      <div className="adm-grid adm-grid--2">
        <Panel title="Warehouses" bodyClass="adm-panel__body--flush">
          <table className="adm-table adm-table--mini">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Name</th>
                <th scope="col">City</th>
                <th scope="col" className="is-right">SKUs</th>
                <th scope="col" className="is-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {WAREHOUSES.map((w) => {
                const list = state.products.filter((p) => p.warehouseId === w.id);
                return (
                  <tr key={w.id}>
                    <td className="t-numeric">{w.code}</td>
                    <td>{w.name}</td>
                    <td>{w.city}</td>
                    <td className="is-right t-numeric">{list.length}</td>
                    <td className="is-right t-numeric">{formatCompact(list.reduce((s, p) => s + p.stock, 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Not yet built" subtitle="Phase 2 items 103–115">
          <ul className="adm-notes adm-notes--plain">
            <li><strong>Stock transfer</strong> between warehouses — needs a transfer note and in-transit state.</li>
            <li><strong>Purchase orders</strong> and supplier records — no supplier table exists yet.</li>
            <li><strong>Batch / expiry tracking</strong> — required for food and cosmetics, which are not yet in the catalogue.</li>
            <li><strong>Damaged stock</strong> write-off with reason codes.</li>
          </ul>
        </Panel>
      </div>

      <Panel bodyClass="adm-panel__body--flush">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={12}
          initialSort={{ key: 'stock', dir: 'asc' }}
          empty={{ title: 'Nothing needs attention', text: 'All products are above their reorder level.' }}
          toolbar={
            <div className="adm-filters">
              <Select value={view} onChange={(e) => setView(e.target.value)} aria-label="Stock view">
                <option value="alerts">Needs attention</option>
                <option value="out">Out of stock only</option>
                <option value="all">All products</option>
              </Select>
            </div>
          }
        />
      </Panel>
    </>
  );
}