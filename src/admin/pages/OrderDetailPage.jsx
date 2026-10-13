import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  Alert,
  Field,
  PageHeader,
  Panel,
  StatusPill,
  Textarea,
} from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { formatPrice } from '../../utils/format.js';

/** The fulfilment pipeline. `cancelled` is reachable from any pre-dispatch state. */
const FLOW = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered'];

const fmt = (v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`;

export default function OrderDetailPage() {
  const { id } = useParams();
  const state = useAdmin();
  const order = state.orders.find((o) => o.id === id);
  const [note, setNote] = useState('');

  if (!order) {
    return (
      <Panel title="Order not found">
        <p>
          No order with id <code>{id}</code>. <Link to="/admin/orders">Back to orders</Link>
        </p>
      </Panel>
    );
  }

  const stepIndex = FLOW.indexOf(order.status);
  const terminal = ['cancelled', 'returned', 'refunded'].includes(order.status);
  const remaining = FLOW.slice(stepIndex + 1);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Orders', to: '/admin/orders' }, { label: order.id }]}
        title={`Order ${order.id}`}
        subtitle={`Placed ${order.placedAt} · ${order.channel} · ${order.customerName}`}
        actions={
          <>
            <button type="button" className="adm-btn adm-btn--outline" onClick={() => window.print()}>
              Print invoice
            </button>
            <Link className="adm-btn adm-btn--ghost" to="/admin/orders">Back</Link>
          </>
        }
      />

      {/* ------------------------------------------- fulfilment pipeline */}
      <Panel title="Fulfilment status" subtitle="Items 87–98">
        <ol className="adm-steps">
          {FLOW.map((step, i) => {
            const done = !terminal && stepIndex >= i;
            const current = !terminal && stepIndex === i;
            return (
              <li
                key={step}
                className={`adm-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
                aria-current={current ? 'step' : undefined}
              >
                <span className="adm-step__dot" aria-hidden="true">{done ? '✓' : i + 1}</span>
                <span className="adm-step__label">{step}</span>
              </li>
            );
          })}
        </ol>

        {terminal ? (
          <Alert tone={order.status === 'delivered' ? 'ok' : 'warn'} title={`Order ${order.status}`}>
            {order.status === 'cancelled' && 'Stock was returned to inventory if it had already been dispatched.'}
            {order.status === 'returned' && 'A return request is open. Refund once the item is received and inspected.'}
            {order.status === 'refunded' && 'Refund has been initiated to the original payment method.'}
          </Alert>
        ) : (
          <div className="adm-actionsrow">
            {remaining.map((step) => (
              <button
                key={step}
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => admin.updateOrderStatus(order.id, step)}
              >
                Mark {step}
              </button>
            ))}
            {stepIndex >= 0 && stepIndex < 4 ? (
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                onClick={() => {
                  if (window.confirm(`Cancel order ${order.id}?`)) admin.updateOrderStatus(order.id, 'cancelled');
                }}
              >
                Cancel order
              </button>
            ) : null}
          </div>
        )}
      </Panel>

      <div className="adm-grid adm-grid--2">
        <Panel title="Items" bodyClass="adm-panel__body--flush">
          <table className="adm-table adm-table--mini">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col" className="is-right">Qty</th>
                <th scope="col" className="is-right">Unit</th>
                <th scope="col" className="is-right">GST</th>
                <th scope="col" className="is-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((line) => (
                <tr key={`${line.productId}-${line.sku}`}>
                  <td>
                    <span className="adm-cellmain">{line.name}</span>
                    <span className="adm-muted t-numeric">{line.sku}</span>
                  </td>
                  <td className="is-right t-numeric">{line.qty}</td>
                  <td className="is-right t-numeric">{fmt(line.unitPrice)}</td>
                  <td className="is-right t-numeric">{line.gstRate}%</td>
                  <td className="is-right t-numeric">{fmt((line.unitPrice - line.discount) * line.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="adm-kv adm-kv--right">
            <div><dt>Gross</dt><dd>{fmt(order.gross)}</dd></div>
            <div><dt>Discount</dt><dd>− {fmt(order.discount)}</dd></div>
            <div><dt>Taxable value</dt><dd>{fmt(order.gross - order.discount)}</dd></div>
            <div><dt>CGST + SGST</dt><dd>{fmt(order.gst)}</dd></div>
            <div><dt>Shipping</dt><dd>{order.shipping ? fmt(order.shipping) : 'Free'}</dd></div>
            <div className="is-total"><dt>Total payable</dt><dd>{fmt(order.total)}</dd></div>
            <div><dt>Cost of goods</dt><dd>{fmt(order.cost)}</dd></div>
            <div className={order.profit > 0 ? 'is-good' : undefined}>
              <dt>Profit</dt><dd>{fmt(order.profit)}</dd>
            </div>
          </dl>
        </Panel>

        <div className="stack-4">
          <Panel title="Customer & delivery">
            <dl className="adm-kv adm-kv--stack">
              <div><dt>Customer</dt><dd>{order.customerName}</dd></div>
              <div><dt>Phone</dt><dd className="t-numeric">{order.phone}</dd></div>
              <div><dt>Ship to</dt><dd>{order.city}, {order.state} — {order.pincode}</dd></div>
              <div><dt>Warehouse</dt><dd>{order.warehouseId}</dd></div>
              <div><dt>Payment mode</dt><dd>{order.paymentMode}</dd></div>
              <div><dt>Tracking</dt><dd className="t-numeric">{order.trackingNumber ?? 'Not dispatched'}</dd></div>
              {order.deliveredAt ? <div><dt>Delivered</dt><dd>{order.deliveredAt}</dd></div> : null}
            </dl>
          </Panel>

          <Panel title="GST invoice" subtitle="Item 133">
            <dl className="adm-kv adm-kv--stack">
              <div><dt>Seller GSTIN</dt><dd className="t-numeric">{order.gstin}</dd></div>
              <div><dt>Invoice no.</dt><dd className="t-numeric">INV-{order.id.replace('SM-', '')}</dd></div>
              <div><dt>Invoice date</dt><dd>{order.placedAt.slice(0, 10)}</dd></div>
            </dl>
            <p className="adm-muted adm-note">
              A printable tax invoice has not been generated as a PDF in this build. The figures above
              are the source for it.
            </p>
          </Panel>

          <Panel title="Internal note" subtitle="Feeds the audit trail">
            <Field label="">
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the audit trail…"
              />
            </Field>
            <button
              type="button"
              className="adm-btn adm-btn--outline adm-btn--sm"
              disabled={!note.trim()}
              onClick={() => {
                admin.logAction('order.note', `Note: ${note.trim()}`, order.id);
                setNote('');
              }}
            >
              Save note
            </button>
          </Panel>
        </div>
      </div>

      <p className="adm-muted adm-note">
        Order profit shown here is {formatPrice(order.profit)} — revenue minus cost of goods. It does
        not yet deduct rent, salaries or platform fees.
      </p>
    </>
  );
}