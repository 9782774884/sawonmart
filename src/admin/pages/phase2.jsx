import { useState } from 'react';

import PhasePlaceholderPage from './PhasePlaceholderPage.jsx';
import { PageHeader, Panel, StatusPill } from '../components/AdminUI.jsx';
import DataTable from '../components/DataTable.jsx';
import { useAdmin } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

/* ------------------------------------------------------------------ shipping */

const ZONES = [
  { id: 'in', name: 'Intra-state (Bihar)', charge: 40, eta: '1–2 days', freeAbove: 500 },
  { id: 'zn', name: 'Zone 1 — North India', charge: 70, eta: '2–4 days', freeAbove: 999 },
  { id: 'z2', name: 'Zone 2 — Rest of India', charge: 95, eta: '4–7 days', freeAbove: 1499 },
];

export function ShippingPage() {
  const state = useAdmin();

  // Serviceability is genuinely computable from the order data we already have.
  const byPin = new Map();
  for (const o of state.orders) {
    const row = byPin.get(o.pincode) ?? { pincode: o.pincode, city: o.city, state: o.state, orders: 0, delivered: 0 };
    row.orders += 1;
    if (o.status === 'delivered') row.delivered += 1;
    byPin.set(o.pincode, row);
  }
  const serviceable = [...byPin.values()].sort((a, b) => b.orders - a.orders);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Shipping' }]}
        title="Delivery & logistics"
        subtitle="Charges, zones and observed delivery performance"
      />

      <div className="adm-grid adm-grid--3">
        {ZONES.map((z) => (
          <Panel key={z.id} title={z.name}>
            <dl className="adm-kv adm-kv--stack">
              <div><dt>Charge</dt><dd className="t-numeric">{formatPrice(z.charge)}</dd></div>
              <div><dt>Free above</dt><dd className="t-numeric">{formatPrice(z.freeAbove)}</dd></div>
              <div><dt>Estimated delivery</dt><dd>{z.eta}</dd></div>
            </dl>
          </Panel>
        ))}
      </div>

      <Panel title="PIN-code serviceability" subtitle="Item 143 — derived from real order history" bodyClass="adm-panel__body--flush">
        <DataTable
          columns={[
            { key: 'pincode', header: 'PIN code', value: (r) => r.pincode },
            { key: 'city', header: 'City', value: (r) => r.city },
            { key: 'state', header: 'State', value: (r) => r.state },
            { key: 'orders', header: 'Orders', value: (r) => r.orders, align: 'right' },
            {
              key: 'rate',
              header: 'Delivery rate',
              value: (r) => (r.orders ? (r.delivered / r.orders) * 100 : 0),
              align: 'right',
              render: (r) => {
                const rate = r.orders ? (r.delivered / r.orders) * 100 : 0;
                return <StatusPill status={rate >= 70 ? 'ok' : rate >= 50 ? 'warn' : 'bad'}>{rate.toFixed(0)}%</StatusPill>;
              },
            },
          ]}
          rows={serviceable}
          pageSize={10}
          initialSort={{ key: 'orders', dir: 'desc' }}
          empty={{ title: 'No orders yet' }}
        />
      </Panel>

      <PhasePlaceholderPage
        title=""
        phase="Phase 2"
        items={[
          'Delivery partner integration and API adapters',
          'Automated tracking-number polling',
          'Shipping label generation (Shiprocket / Delhivery / Blue Dart)',
          'Delivery staff assignment and route planning',
          'Failed delivery management and re-attempt scheduling',
          'Return-to-origin tracking with reverse pickup',
        ]}
        notes={[
          'Shipping charges currently live as constants in this screen and in the seed data — they need to be per-warehouse, weight-based and slab-based in production.',
          'Estimated delivery dates are currently plain text on the storefront, not computed from a courier SLA.',
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ payments */

export function PaymentsPage() {
  const state = useAdmin();
  const pending = state.orders.filter((o) => o.paymentStatus === 'pending');
  const paid = state.orders.filter((o) => o.paymentStatus === 'paid');
  const gst = paid.reduce((s, o) => s + o.gst, 0);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Payments' }]}
        title="Payment & finance"
        subtitle="Collections, reconciliation and tax"
      />

      <div className="adm-grid adm-grid--4">
        <Panel><p className="adm-mini">Collected</p><p className="adm-mini__v t-numeric">{formatPrice(paid.reduce((s, o) => s + o.total, 0))}</p></Panel>
        <Panel><p className="adm-mini">Pending</p><p className="adm-mini__v t-numeric">{formatPrice(pending.reduce((s, o) => s + o.total, 0))}</p></Panel>
        <Panel><p className="adm-mini">GST to remit</p><p className="adm-mini__v t-numeric">{formatPrice(gst)}</p></Panel>
        <Panel><p className="adm-mini">Transactions</p><p className="adm-mini__v t-numeric">{formatCompact(state.orders.length)}</p></Panel>
      </div>

      <Panel title="Reconciliation queue" subtitle="Item 131 — orders awaiting a settled payment" bodyClass="adm-panel__body--flush">
        <DataTable
          columns={[
            { key: 'id', header: 'Order', value: (r) => r.id },
            { key: 'mode', header: 'Mode', value: (r) => r.paymentMode },
            { key: 'status', header: 'Order status', value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
            { key: 'total', header: 'Amount', value: (r) => r.total, align: 'right', render: (r) => <span className="t-numeric">{formatPrice(r.total)}</span> },
            { key: 'placedAt', header: 'Placed', value: (r) => r.placedAt },
          ]}
          rows={pending.slice(0, 40)}
          pageSize={10}
          initialSort={{ key: 'id', dir: 'desc' }}
          empty={{ title: 'Nothing pending', text: 'Every order has a settled payment.' }}
        />
      </Panel>

      <PhasePlaceholderPage
        title=""
        phase="Phase 2"
        items={[
          'Payment gateway integration (Razorpay / Cashfree) with server-side signature verification',
          'UPI mandate and collect-request flows',
          'Automatic webhooks for settlement and refunds',
          'Daily settlement reconciliation against the bank',
          'Refund processing with gateway-initiated refunds',
          'GST invoice PDFs, credit notes and e-invoicing (IRN) if turnover requires it',
          'Credit-note and expense ledgers, and Excel/CSV export',
        ]}
        notes={[
          'Payment state must be driven by gateway webhooks, never by the browser. A client can claim a payment succeeded.',
          'Refund and credit-note numbers need a sequential, gap-free series per financial year for audit.',
          'Any card or UPI data must stay with the gateway — never proxy it through this server.',
        ]}
      />
    </>
  );
}

/* ----------------------------------------------------------------- marketing */

export function MarketingPage() {
  const state = useAdmin();
  const byChannel = new Map();
  for (const o of state.orders) byChannel.set(o.channel, (byChannel.get(o.channel) ?? 0) + 1);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Marketing' }]}
        title="Marketing & promotion"
        subtitle="Coupons, banners and channels"
      />

      <div className="adm-grid adm-grid--3">
        {[...byChannel.entries()].map(([channel, count]) => (
          <Panel key={channel} title={channel}>
            <p className="adm-mini__v t-numeric">{formatCompact(count)}</p>
            <p className="adm-muted">orders from this channel</p>
          </Panel>
        ))}
      </div>

      <PhasePlaceholderPage
        title=""
        phase="Phase 2"
        items={[
          'Coupon creation and rules engine (already partly built under Pricing → Coupons)',
          'Homepage slider and promotional banner management',
          'Festival offer scheduling',
          'Referral programme',
          'SMS, WhatsApp and email campaign integration',
          'Push notifications',
          'Abandoned-cart recovery',
          'Loyalty campaigns and review moderation',
          'Cross-sell / upsell rules and campaign reporting',
        ]}
        notes={[
          'WhatsApp Business API requires a verified business and pre-approved template messages — promotional templates are rejected outside the 24-hour customer-service window.',
          'Marketing consent and opt-out handling must be stored, not inferred. TRAI and the DPDP Act both apply.',
          'Cross-sell recommendations should read from real basket co-occurrence rather than hand-picked pairs.',
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ security */

export function SecurityPage() {
  const state = useAdmin();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Security' }]}
        title="Security & audit"
        subtitle="Audit trail and access review"
      />

      <div className="adm-grid adm-grid--2">
        <Panel title="Audit trail" subtitle="Items 203–204" bodyClass="adm-panel__body--flush">
          <ul className="adm-feed">
            {state.audit.slice(0, 40).map((a) => (
              <li key={a.id} className="adm-feed__row">
                <span className={`adm-feed__dot adm-feed__dot--${a.type.split('.')[0]}`} aria-hidden="true" />
                <span className="adm-feed__body">
                  <span className="adm-feed__action">{a.action}</span>
                  <span className="adm-feed__meta">{a.actor} · {a.target}</span>
                </span>
                <time className="adm-feed__time" dateTime={a.at.replace(' ', 'T')}>{a.at}</time>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Critical: what is not protected" tone="danger">
          <ul className="adm-notes">
            <li><strong>No authentication.</strong> The admin gate is a demo dropdown. Anyone who can reach the URL is "an admin".</li>
            <li><strong>No server.</strong> All data is in the browser's localStorage, so it is not shared, not backed up, and trivially edited.</li>
            <li><strong>No server-side permission enforcement.</strong> The permission matrix decides what is drawn; a modified client bypasses it entirely.</li>
            <li><strong>Audit trail is client-writable.</strong> Clearing site data erases it. A real audit log must be append-only on the server.</li>
            <li><strong>No encryption at rest.</strong> Phone numbers and addresses are stored as plain text in the browser.</li>
          </ul>
          <p className="adm-muted adm-note">
            These are listed plainly rather than implied, because an audit trail you cannot trust is
            worse than none — it creates a false record of compliance.
          </p>
        </Panel>
      </div>

      <PhasePlaceholderPage
        title=""
        phase="Phase 2"
        items={[
          'Firebase Auth staff sign-in with mandatory MFA',
          'Server-enforced RBAC on every endpoint',
          'Append-only audit log with a hash chain',
          'Login history and device management',
          'Suspicious-activity alerts and session revocation',
          'Automated backup and tested restore',
          'API access keys with scoped, rotatable credentials',
          'Database monitoring and disaster-recovery runbooks',
        ]}
        notes={[
          'Enforce MFA for any account that can issue refunds, change prices, or export customer data.',
          'Never store service-account keys in the browser bundle. They belong on the server only.',
          'Test a restore before trusting a backup. An untested backup is a hypothesis.',
        ]}
      />
    </>
  );
}