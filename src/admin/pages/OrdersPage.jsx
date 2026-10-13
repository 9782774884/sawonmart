import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DataTable from '../components/DataTable.jsx';
import {
  Alert,
  Field,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusPill,
  Textarea,
} from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { formatPrice } from '../../utils/format.js';

const STATUSES = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled', 'returned', 'refunded'];

/** The fulfilment pipeline. `cancelled` is reachable from any pre-dispatch state. */
const FLOW = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered'];

const fmt = (v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;

export default function OrdersPage() {
  const state = useAdmin();
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const navigate = useNavigate();

  const rows = useMemo(() => {
    let list = state.orders;
    if (status !== 'all') list = list.filter((o) => o.status === status);
    if (payment !== 'all') list = list.filter((o) => o.paymentStatus === payment);
    return list;
  }, [state.orders, status, payment]);

  const totals = useMemo(() => {
    const value = rows.reduce((s, o) => s + o.total, 0);
    const gst = rows.reduce((s, o) => s + o.gst, 0);
    const profit = rows.reduce((s, o) => s + o.profit, 0);
    return { value, gst, profit };
  }, [rows]);

  if (useParams().id) return <OrderDetailPage />;

  const columns = [
    {
      key: 'id',
      header: 'Order',
      value: (r) => `${r.id} ${r.customerName}`,
      render: (r) => (
        <span>
          <span className="adm-cellmain">{r.id}</span>
          <span className="adm-muted">{r.customerName} · {r.placedAt.slice(0, 10)}</span>
        </span>
      ),
    },
    { key: 'items', header: 'Items', value: (r) => r.items.reduce((s, i) => s + i.qty, 0), align: 'right' },
    { key: 'city', header: 'Ship to', value: (r) => `${r.city} ${r.state}`, render: (r) => <span>{r.city}<span className="adm-muted"> · {r.pincode}</span></span> },
    { key: 'paymentMode', header: 'Mode', value: (r) => r.paymentMode },
    {
      key: 'total',
      header: 'Total',
      value: (r) => r.total,
      sortValue: (r) => r.total,
      align: 'right',
      render: (r) => (
        <span>
          <span className="adm-cellmain t-numeric">{fmt(r.total)}</span>
          <span className="adm-muted">incl. {fmt(r.gst)} GST</span>
        </span>
      ),
    },
    { key: 'paymentStatus', header: 'Payment', value: (r) => r.paymentStatus, render: (r) => <StatusPill status={r.paymentStatus} /> },
    { key: 'status', header: 'Status', value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Orders' }]}
        title="Order management"
        subtitle={`${rows.length} order(s) · ${fmt(totals.value)} gross value · ${fmt(totals.profit)} realised profit`}
      />

      <Panel bodyClass="adm-panel__body--flush">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={15}
          initialSort={{ key: 'id', dir: 'desc' }}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          empty={{ title: 'No orders match these filters' }}
          toolbar={
            <div className="adm-filters">
              <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <Select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Filter by payment status">
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          }
        />
      </Panel>
    </>
  );
}
