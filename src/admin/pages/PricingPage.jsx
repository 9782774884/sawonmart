import { useMemo, useState } from 'react';

import DataTable from '../components/DataTable.jsx';
import {
  Alert,
  Field,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusPill,
  StatCard,
} from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { discountPercent, formatPrice } from '../../utils/format.js';

/** Global discount rules, in addition to the per-product tiers. Items 51–65. */
const DEFAULT_RULES = {
  distributorDiscount: 12, // percent off selling price for distributors
  wholesaleDiscount: 6,
  quantityBreaks: [
    { min: 1, off: 0 },
    { min: 3, off: 3 },
    { min: 6, off: 6 },
    { min: 12, off: 10 },
  ],
  festivalDiscount: 15,
  flashSaleDiscount: 25,
  minMarginFloor: 15, // % — selling price may not fall below this
};

export default function PricingPage() {
  const state = useAdmin();
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [tab, setTab] = useState('margins');

  const priced = useMemo(() => state.products.filter((p) => !p.archived), [state.products]);

  const stats = useMemo(() => {
    const withCost = priced.filter((p) => p.purchasePrice > 0 && p.price > 0);
    const margins = withCost.map((p) => ((p.price - p.purchasePrice) / p.price) * 100);
    const thin = withCost.filter((p) => ((p.price - p.purchasePrice) / p.price) * 100 < rules.minMarginFloor);
    return {
      avgMargin: margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0,
      thin: thin.length,
      avgDiscount: priced.length
        ? priced.reduce((s, p) => s + discountPercent(p.price, p.mrp), 0) / priced.length
        : 0,
      gstCollected: state.orders
        .filter((o) => o.status === 'delivered')
        .reduce((s, o) => s + o.gst, 0),
    };
  }, [priced, rules.minMarginFloor, state.orders]);

  const columns = [
    { key: 'title', header: 'Product', value: (r) => r.title, render: (r) => <span><span className="adm-cellmain">{r.title}</span><span className="adm-muted t-numeric">{r.sku}</span></span> },
    { key: 'mrp', header: 'MRP', value: (r) => r.mrp, sortValue: (r) => r.mrp, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.mrp)}</span> },
    { key: 'price', header: 'Selling', value: (r) => r.price, sortValue: (r) => r.price, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.price)}</span> },
    { key: 'purchasePrice', header: 'Cost', value: (r) => r.purchasePrice, sortValue: (r) => r.purchasePrice, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.purchasePrice)}</span> },
    {
      key: 'margin',
      header: 'Margin',
      value: (r) => (r.price > 0 ? ((r.price - r.purchasePrice) / r.price) * 100 : 0),
      sortValue: (r) => (r.price > 0 ? ((r.price - r.purchasePrice) / r.price) * 100 : 0),
      align: 'right',
      render: (r) => {
        const m = r.price > 0 ? ((r.price - r.purchasePrice) / r.price) * 100 : 0;
        return <StatusPill status={m < rules.minMarginFloor ? 'low' : 'ok'}>{m.toFixed(1)}%</StatusPill>;
      },
    },
    { key: 'wholesalePrice', header: 'Wholesale', value: (r) => r.wholesalePrice, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.wholesalePrice)}</span> },
    { key: 'distributorPrice', header: 'Distributor', value: (r) => r.distributorPrice, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.distributorPrice)}</span> },
    { key: 'gstRate', header: 'GST', value: (r) => r.gstRate, align: 'right', render: (r) => `${r.gstRate}%` },
    { key: 'off', header: 'Off MRP', value: (r) => discountPercent(r.price, r.mrp), align: 'right', render: (r) => `${discountPercent(r.price, r.mrp)}%` },
  ];

  const applyBulk = (percent) => {
    const factor = 1 - percent / 100;
    const affected = priced.filter((p) => {
      const margin = p.price > 0 ? ((p.price - p.purchasePrice) / p.price) * 100 : 0;
      return margin - percent >= rules.minMarginFloor;
    });

    if (!window.confirm(`Apply a ${percent}% discount to ${affected.length} product(s)? Products that would fall below a ${rules.minMarginFloor}% margin are skipped.`)) return;

    affected.forEach((p) => {
      const price = Math.max(p.purchasePrice, Math.floor(p.price * factor / 10) * 10);
      admin.saveProduct({ ...p, price, wholesalePrice: Math.round(price * 0.94), distributorPrice: Math.round(price * 0.88) });
    });
    admin.logAction('product.pricing.edit', `Bulk discount ${percent}% on ${affected.length} products`, 'catalogue');
  };

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Pricing' }]}
        title="Pricing & discount settings"
        subtitle="MRP, tiered pricing, GST rates and margin protection"
      />

      <div className="adm-grid adm-grid--4">
        <StatCard label="Average margin" value={`${stats.avgMargin.toFixed(1)}%`} icon="wallet" tone="green" />
        <StatCard label="Average discount" value={`${stats.avgDiscount.toFixed(1)}%`} icon="bolt" tone="amber" />
        <StatCard label="Below margin floor" value={stats.thin} icon="close" tone={stats.thin ? 'red' : 'green'} />
        <StatCard label="GST collected" value={formatPrice(stats.gstCollected)} icon="truck" tone="blue" hint="Delivered orders, remitted to the government" />
      </div>

      {stats.thin > 0 ? (
        <Alert tone="warn" title={`${stats.thin} product(s) sit below the ${rules.minMarginFloor}% margin floor`}>
          Lower the floor in Discount rules, or raise the selling price. Bulk discounts skip these
          products automatically.
        </Alert>
      ) : null}

      <div className="adm-tabs" role="tablist" aria-label="Pricing sections">
        {[
          ['margins', 'Product margins'],
          ['rules', 'Discount rules'],
          ['coupons', 'Coupons'],
          ['approvals', 'Approvals'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            className={`adm-tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------- margins */}
      {tab === 'margins' ? (
        <div id="panel-margins" role="tabpanel" aria-labelledby="tab-margins">
          <Panel bodyClass="adm-panel__body--flush">
            <DataTable
              columns={columns}
              rows={priced}
              pageSize={12}
              initialSort={{ key: 'margin', dir: 'asc' }}
              empty={{ title: 'No products' }}
            />
          </Panel>
        </div>
      ) : null}

      {/* ----------------------------------------------------------- rules */}
      {tab === 'rules' ? (
        <div id="panel-rules" role="tabpanel" aria-labelledby="tab-rules" className="adm-grid adm-grid--2">
          <Panel title="Tier pricing" subtitle="Items 53–55">
            <div className="adm-grid adm-grid--2 adm-grid--gap">
              <Field label="Distributor discount (%)" hint="0–50%">
                <Input
                  type="number" min="0" max="50" value={rules.distributorDiscount}
                  onChange={(e) => setRules((r) => ({ ...r, distributorDiscount: Math.min(50, Math.max(0, Number(e.target.value))) }))}
                />
              </Field>
              <Field label="Wholesale discount (%)" hint="0–50%">
                <Input
                  type="number" min="0" max="50" value={rules.wholesaleDiscount}
                  onChange={(e) => setRules((r) => ({ ...r, wholesaleDiscount: Math.min(50, Math.max(0, Number(e.target.value))) }))}
                />
              </Field>
            </div>

            <table className="adm-table adm-table--mini adm-mt">
              <caption className="adm-caption">Quantity-based discount</caption>
              <thead>
                <tr><th scope="col">Minimum qty</th><th scope="col">Discount</th></tr>
              </thead>
              <tbody>
                {rules.quantityBreaks.map((b, i) => (
                  <tr key={b.min}>
                    <td className="t-numeric">{b.min}+</td>
                    <td className="t-numeric">{b.off}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Campaigns & protection" subtitle="Items 57–62">
            <div className="adm-grid adm-grid--2 adm-grid--gap">
              <Field label="Festival discount (%)">
                <Input type="number" min="0" max="90" value={rules.festivalDiscount} onChange={(e) => setRules((r) => ({ ...r, festivalDiscount: Number(e.target.value) }))} />
              </Field>
              <Field label="Flash sale discount (%)">
                <Input type="number" min="0" max="90" value={rules.flashSaleDiscount} onChange={(e) => setRules((r) => ({ ...r, flashSaleDiscount: Number(e.target.value) }))} />
              </Field>
              <Field
                label="Minimum margin floor (%)"
                hint="Bulk price updates refuse to go below this."
                className="adm-span-2"
              >
                <Input type="number" min="0" max="90" value={rules.minMarginFloor} onChange={(e) => setRules((r) => ({ ...r, minMarginFloor: Number(e.target.value) }))} />
              </Field>
            </div>

            <div className="adm-actionsrow adm-mt">
              {[5, 10, 15].map((p) => (
                <button key={p} type="button" className="adm-btn adm-btn--outline" onClick={() => applyBulk(p)}>
                  Bulk {p}% off
                </button>
              ))}
            </div>
            <p className="adm-muted adm-note">
              Bulk updates respect the margin floor and skip any product that would breach it. Each
              change is written to the audit trail.
            </p>
          </Panel>
        </div>
      ) : null}

      {/* ---------------------------------------------------------- coupons */}
      {tab === 'coupons' ? (
        <div id="panel-coupons" role="tabpanel" aria-labelledby="tab-coupons">
          <CouponManager />
        </div>
      ) : null}

      {/* -------------------------------------------------------- approvals */}
      {tab === 'approvals' ? (
        <div id="panel-approvals" role="tabpanel" aria-labelledby="tab-approvals">
          <Panel title="Price approval queue" subtitle="Item 64 — changes made by a Manager need an Admin sign-off">
            <Alert tone="info" title="Nothing waiting">
              Manager accounts can edit selling prices, but every change they make is queued here for
              an Admin to approve before it reaches the storefront. No requests are outstanding.
            </Alert>
            <p className="adm-muted adm-note">
              The approval queue is a stub. Wiring it means persisting pending price changes alongside
              the product record and only copying them into the live price on approval.
            </p>
          </Panel>
        </div>
      ) : null}
    </>
  );
}

/* ======================================================================== */

function CouponManager() {
  const state = useAdmin();
  const [form, setForm] = useState({ code: '', type: 'flat', value: 100, minOrder: 999, expires: '' });

  const submit = (e) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code) return;
    if (state.coupons.some((c) => c.code === code)) {
      window.alert(`Coupon ${code} already exists.`);
      return;
    }
    admin.saveCoupon({
      code,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      usageLimit: 1000,
      used: 0,
      expires: form.expires || new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
      status: 'active',
    });
    setForm({ code: '', type: 'flat', value: 100, minOrder: 999, expires: '' });
  };

  return (
    <div className="adm-grid adm-grid--2">
      <Panel title="Create coupon" subtitle="Item 151">
        <form onSubmit={submit} className="stack-4">
          <Field label="Code" required>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAWON200" />
          </Field>
          <div className="adm-grid adm-grid--2 adm-grid--gap">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="flat">Flat amount</option>
                <option value="percent">Percentage</option>
              </Select>
            </Field>
            <Field label={form.type === 'flat' ? 'Amount (₹)' : 'Percent (%)'}>
              <Input type="number" min="1" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            </Field>
          </div>
          <div className="adm-grid adm-grid--2 adm-grid--gap">
            <Field label="Minimum order (₹)">
              <Input type="number" min="0" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} />
            </Field>
            <Field label="Expires">
              <Input type="date" value={form.expires} onChange={(e) => setForm((f) => ({ ...f, expires: e.target.value }))} />
            </Field>
          </div>
          <button type="submit" className="adm-btn adm-btn--primary">Create coupon</button>
        </form>
      </Panel>

      <Panel title="Existing coupons" bodyClass="adm-panel__body--flush">
        <table className="adm-table adm-table--mini">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Value</th>
              <th scope="col" className="is-right">Min order</th>
              <th scope="col" className="is-right">Used</th>
              <th scope="col">Expires</th>
              <th scope="col">Status</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {state.coupons.map((c) => (
              <tr key={c.code}>
                <td className="t-numeric"><strong>{c.code}</strong></td>
                <td>{c.type === 'flat' ? `₹${c.value}` : `${c.value}%`}</td>
                <td className="is-right t-numeric">₹{c.minOrder}</td>
                <td className="is-right t-numeric">{c.used}/{c.usageLimit}</td>
                <td className="t-numeric">{c.expires}</td>
                <td><StatusPill status={c.status} /></td>
                <td>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => admin.deleteCoupon(c.code)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}