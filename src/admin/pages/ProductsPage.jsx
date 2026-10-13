import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import DataTable from '../components/DataTable.jsx';
import { PageHeader, Panel, Select, StatusPill, Toolbar } from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { SUBCATEGORIES } from '../data/seed.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

const CATEGORIES = Object.keys(SUBCATEGORIES);

export default function ProductsPage() {
  const state = useAdmin();
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState('all');
  const [selected, setSelected] = useState([]);

  const rows = useMemo(() => {
    let list = state.products;
    if (status === 'archived') list = list.filter((p) => p.archived);
    else list = list.filter((p) => !p.archived && (status === 'all' || p.status === status));
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (stock === 'low') list = list.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
    if (stock === 'out') list = list.filter((p) => p.stock === 0);
    if (stock === 'in') list = list.filter((p) => p.stock > p.lowStockThreshold);
    return list;
  }, [state.products, status, category, stock]);

  const selectedProducts = rows.filter((p) => selected.includes(p.id));
  const selectedValue = selectedProducts.reduce((s, p) => s + p.purchasePrice * p.stock, 0);

  const bulkArchive = () => {
    selected.forEach((id) => admin.archiveProduct(id, true));
    setSelected([]);
  };

  const bulkFeature = () => {
    selectedProducts.forEach((p) => admin.saveProduct({ ...p, featured: true }));
    setSelected([]);
  };

  const bulkDelete = () => {
    if (!window.confirm(`Permanently delete ${selected.length} product(s)? This cannot be undone and will break order history references.`)) return;
    selected.forEach((id) => admin.deleteProduct(id));
    setSelected([]);
  };

  const columns = [
    {
      key: 'title',
      header: 'Product',
      value: (r) => `${r.title} ${r.brand} ${r.sku}`,
      render: (r) => (
        <span className="adm-prod">
          <img src={`/assets/images/${r.image}`} alt="" width={38} height={38} loading="lazy" />
          <span className="adm-prod__text">
            <Link className="adm-prod__name" to={`/admin/products/${r.id}`}>{r.title}</Link>
            <span className="adm-prod__meta">{r.brand} · {r.sku}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      value: (r) => `${r.category} ${r.subcategory}`,
      render: (r) => (
        <span>
          <span className="adm-cellmain">{r.subcategory}</span>
          <span className="adm-muted">{r.category}</span>
        </span>
      ),
    },
    { key: 'hsn', header: 'HSN', value: (r) => r.hsn, align: 'right' },
    {
      key: 'price',
      header: 'MRP / Selling',
      value: (r) => `${r.mrp} ${r.price}`,
      sortValue: (r) => r.price,
      align: 'right',
      render: (r) => (
        <span className="adm-prices">
          <span className="adm-prices__now t-numeric">{formatPrice(r.price)}</span>
          <span className="adm-prices__mrp t-numeric">{formatPrice(r.mrp)}</span>
        </span>
      ),
    },
    { key: 'gst', header: 'GST', value: (r) => r.gstRate, align: 'right', render: (r) => `${r.gstRate}%` },
    {
      key: 'stock',
      header: 'Stock',
      value: (r) => r.stock,
      align: 'right',
      render: (r) => (
        <span className="t-numeric">
          {r.stock}
          {r.stock === 0 ? <StatusPill status="out of stock">Out</StatusPill> : r.stock <= r.lowStockThreshold ? <StatusPill status="low">Low</StatusPill> : null}
        </span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      value: (r) => `${r.featured} ${r.newArrival}`,
      render: (r) => (
        <span className="adm-flags">
          {r.featured ? <StatusPill tone="ok">Featured</StatusPill> : null}
          {r.newArrival ? <StatusPill tone="info">New</StatusPill> : null}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      value: (r) => r.status,
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      value: () => '',
      render: (r) => (
        <span className="adm-rowactions">
          <Link className="adm-btn adm-btn--ghost adm-btn--sm" to={`/admin/products/${r.id}`}>Edit</Link>
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={(e) => {
              e.stopPropagation();
              admin.archiveProduct(r.id, !r.archived);
            }}
          >
            {r.archived ? 'Restore' : 'Archive'}
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Products' }]}
        title="Product management"
        subtitle={`${formatCompact(rows.length)} product(s) match the current filters`}
        actions={
          <>
            <Link className="adm-btn adm-btn--outline" to="/admin/products/new">Bulk upload (CSV)</Link>
            <Link className="adm-btn adm-btn--primary" to="/admin/products/new">+ Add product</Link>
          </>
        }
      />

      {selected.length > 0 ? (
        <div className="adm-bulkbar" role="region" aria-label="Bulk actions">
          <p className="adm-bulkbar__count">
            <strong>{selected.length}</strong> selected · stock value{' '}
            <strong>{formatPrice(selectedValue)}</strong>
          </p>
          <div className="adm-bulkbar__actions">
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={bulkFeature}>
              Mark featured
            </button>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={bulkArchive}>
              Archive
            </button>
            <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={bulkDelete}>
              Delete permanently
            </button>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setSelected([])}>
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <Panel bodyClass="adm-panel__body--flush">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={12}
          initialSort={{ key: 'title', dir: 'asc' }}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          empty={{ title: 'No products match', text: 'Try clearing the filters.' }}
          toolbar={
            <Toolbar className="adm-filters">
              <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                {STATUS_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Select value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Filter by stock level">
                <option value="all">All stock levels</option>
                <option value="in">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </Select>
            </Toolbar>
          }
        />
      </Panel>
    </>
  );
}