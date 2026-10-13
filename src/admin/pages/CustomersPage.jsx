import { useMemo, useState } from 'react';

import DataTable from '../components/DataTable.jsx';
import { PageHeader, Panel, Select, StatusPill } from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

const SEGMENTS = [
  { value: 'all', label: 'All customers' },
  { value: 'active', label: 'Active (90 days)' },
  { value: 'lapsed', label: 'Lapsed (>90 days)' },
  { value: 'repeat', label: 'Repeat buyers' },
  { value: 'blocked', label: 'Blocked' },
];

export default function CustomersPage() {
  const state = useAdmin();
  const [segment, setSegment] = useState('all');

  const rows = useMemo(() => {
    const ninety = Date.now() - 90 * 86_400_000;
    let list = state.customers;

    if (segment === 'active') list = list.filter((c) => c.status === 'active' && new Date(c.lastOrderAt.replace(' ', 'T')).getTime() >= ninety);
    if (segment === 'lapsed') list = list.filter((c) => c.status === 'active' && new Date(c.lastOrderAt.replace(' ', 'T')).getTime() < ninety);
    if (segment === 'repeat') list = list.filter((c) => c.orders >= 2);
    if (segment === 'blocked') list = list.filter((c) => c.status === 'blocked');
    if (segment === 'all') list = list.filter((c) => c.status !== 'blocked');

    return [...list].sort((a, b) => b.spent - a.spent);
  }, [state.customers, segment]);

  const totals = useMemo(
    () => ({
      spend: rows.reduce((s, c) => s + c.spent, 0),
      orders: rows.reduce((s, c) => s + c.orders, 0),
      wallet: state.customers.reduce((s, c) => s + c.wallet, 0),
      points: state.customers.reduce((s, c) => s + c.loyaltyPoints, 0),
    }),
    [rows, state.customers]
  );

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      value: (r) => `${r.name} ${r.email}`,
      render: (r) => (
        <span className="adm-prod">
          <span className="adm-initials" aria-hidden="true">
            {r.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <span className="adm-prod__text">
            <span className="adm-cellmain">{r.name}</span>
            <span className="adm-muted">{r.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'phone', header: 'Phone', value: (r) => r.phone },
    { key: 'city', header: 'Location', value: (r) => `${r.city} ${r.state}`, render: (r) => <span>{r.city}<span className="adm-muted"> · {r.pincode}</span></span> },
    { key: 'orders', header: 'Orders', value: (r) => r.orders, sortValue: (r) => r.orders, align: 'right' },
    { key: 'spent', header: 'Lifetime value', value: (r) => r.spent, sortValue: (r) => r.spent, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.spent)}</span> },
    { key: 'loyaltyPoints', header: 'Points', value: (r) => r.loyaltyPoints, align: 'right' },
    { key: 'wallet', header: 'Wallet', value: (r) => r.wallet, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.wallet)}</span> },
    { key: 'lastOrderAt', header: 'Last order', value: (r) => r.lastOrderAt },
    {
      key: 'status',
      header: 'Account',
      value: (r) => r.status,
      render: (r) => (
        <button
          type="button"
          className="adm-btn adm-btn--ghost adm-btn--sm"
          onClick={(e) => {
            e.stopPropagation();
            admin.setCustomerStatus(r.id, r.status === 'blocked' ? 'active' : 'blocked');
          }}
          aria-label={`${r.status === 'blocked' ? 'Unblock' : 'Block'} ${r.name}`}
        >
          <StatusPill status={r.status} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Customers' }]}
        title="Customer management"
        subtitle={`${formatCompact(rows.length)} customer(s) · ${formatPrice(totals.spend)} lifetime value in view`}
      />

      <div className="adm-grid adm-grid--4">
        <Panel><p className="adm-mini">Customers in view</p><p className="adm-mini__v t-numeric">{formatCompact(rows.length)}</p></Panel>
        <Panel><p className="adm-mini">Lifetime value</p><p className="adm-mini__v t-numeric">{formatPrice(totals.spend)}</p></Panel>
        <Panel><p className="adm-mini">Wallet float</p><p className="adm-mini__v t-numeric">{formatPrice(totals.wallet)}</p></Panel>
        <Panel><p className="adm-mini">Loyalty points issued</p><p className="adm-mini__v t-numeric">{formatCompact(totals.points)}</p></Panel>
      </div>

      <Panel bodyClass="adm-panel__body--flush">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={12}
          initialSort={{ key: 'spent', dir: 'desc' }}
          empty={{ title: 'No customers in this segment' }}
          toolbar={
            <div className="adm-filters">
              <Select value={segment} onChange={(e) => setSegment(e.target.value)} aria-label="Customer segment">
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          }
        />
      </Panel>
    </>
  );
}