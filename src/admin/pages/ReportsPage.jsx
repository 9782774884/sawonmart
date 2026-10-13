import { useMemo } from 'react';

import { LocationChart, OrderVolumeChart, ProfitLossChart, RevenueChart, StatusDonut } from '../components/charts.jsx';
import { PageHeader, Panel, Select, StatCard, StatusPill } from '../components/AdminUI.jsx';
import { useAdmin, selectDashboard } from '../data/store.js';
import { formatCompact, formatPrice } from '../../utils/format.js';

const PAYMENT_METHODS = ['UPI', 'Card', 'Net Banking', 'COD', 'Wallet'];

export default function ReportsPage() {
  const state = useAdmin();
  const d = useMemo(() => selectDashboard(state, 365), [state]);

  /* ---- sales by payment method ---- */
  const byMethod = useMemo(() => {
    const map = new Map(PAYMENT_METHODS.map((m) => [m, { method: m, orders: 0, revenue: 0, pending: 0 }]));
    for (const o of state.orders) {
      const row = map.get(o.paymentMode);
      if (!row) continue;
      row.orders += 1;
      row.revenue += o.total;
      if (o.paymentStatus === 'pending') row.pending += 1;
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [state.orders]);

  /* ---- GST summary, split CGST / SGST as an intra-state sale ---- */
  const gst = useMemo(() => {
    const delivered = state.orders.filter((o) => o.status === 'delivered');
    const total = delivered.reduce((s, o) => s + o.gst, 0);
    return {
      taxable: delivered.reduce((s, o) => s + (o.gross - o.discount), 0),
      total,
      cgst: total / 2,
      sgst: total / 2,
      invoiceCount: delivered.length,
    };
  }, [state.orders]);

  /* ---- expense estimate, so the P&L is not just revenue ---- */
  const expenses = useMemo(() => {
    const payroll = state.staff.reduce((s, m) => s + (m.salary || 0), 0) * 12;
    const marketing = Math.round(d.extras.rangeRevenue * 0.04);
    const shipping = state.orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.shipping, 0) * 0.55;
    const platform = Math.round(d.extras.rangeRevenue * 0.02);
    return { payroll, marketing, shipping, platform, total: payroll + marketing + shipping + platform };
  }, [state.staff, state.orders, d.extras.rangeRevenue]);

  const netProfit = d.extras.profit - expenses.total;
  const netMargin = d.cards.totalSales ? (netProfit / d.cards.totalSales) * 100 : 0;

  const statusData = [
    { name: 'Delivered', value: d.cards.deliveredOrders },
    { name: 'Pending', value: d.cards.pendingOrders },
    { name: 'Cancelled', value: d.cards.cancelledOrders },
    { name: 'Returned', value: d.cards.returnedOrders },
  ].filter((x) => x.value > 0);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Reports' }]}
        title="Reports"
        subtitle="Sales, profit and loss, GST and payment mix"
        actions={<button type="button" className="adm-btn adm-btn--outline" onClick={() => window.print()}>Export / Print</button>}
      />

      <div className="adm-grid adm-grid--4">
        <StatCard label="Gross revenue" value={formatPrice(d.cards.totalSales)} icon="wallet" tone="blue" />
        <StatCard label="Gross profit" value={formatPrice(d.extras.profit)} icon="star" tone="green" hint={`${d.extras.grossMargin.toFixed(1)}% margin`} />
        <StatCard label="Estimated opex" value={formatPrice(expenses.total)} icon="truck" tone="amber" hint="Payroll, marketing, shipping, platform" />
        <StatCard label="Net profit" value={formatPrice(netProfit)} icon="check" tone={netProfit > 0 ? 'green' : 'red'} hint={`${netMargin.toFixed(1)}% net margin`} />
      </div>

      <div className="adm-grid adm-grid--2">
        <RevenueChart data={d.monthly} months />
        <ProfitLossChart data={d.monthly} />
        <OrderVolumeChart data={d.series} />
        <LocationChart data={d.locations} />
      </div>

      <div className="adm-grid adm-grid--2">
        {/* -------------------------------------------------- payment mix */}
        <Panel title="Payment mix" subtitle="Items 126–137" bodyClass="adm-panel__body--flush">
          <table className="adm-table adm-table--mini">
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col" className="is-right">Orders</th>
                <th scope="col" className="is-right">Value</th>
                <th scope="col" className="is-right">Share</th>
                <th scope="col" className="is-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              {byMethod.map((m) => {
                const share = d.cards.totalOrders ? (m.orders / d.cards.totalOrders) * 100 : 0;
                return (
                  <tr key={m.method}>
                    <td>{m.method}</td>
                    <td className="is-right t-numeric">{formatCompact(m.orders)}</td>
                    <td className="is-right t-numeric">{formatPrice(m.revenue)}</td>
                    <td className="is-right t-numeric">{share.toFixed(1)}%</td>
                    <td className="is-right t-numeric">{m.pending}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        {/* ------------------------------------------------------ GST report */}
        <Panel title="GST summary" subtitle="Item 135 · intra-state supply, CGST + SGST" bodyClass="adm-panel__body--flush">
          <dl className="adm-kv adm-kv--right adm-pad">
            <div><dt>Tax invoices issued</dt><dd className="t-numeric">{formatCompact(gst.invoiceCount)}</dd></div>
            <div><dt>Taxable value</dt><dd className="t-numeric">{formatPrice(gst.taxable)}</dd></div>
            <div><dt>CGST @ 9%</dt><dd className="t-numeric">{formatPrice(gst.cgst)}</dd></div>
            <div><dt>SGST @ 9%</dt><dd className="t-numeric">{formatPrice(gst.sgst)}</dd></div>
            <div className="is-total"><dt>Total GST collected</dt><dd className="t-numeric">{formatPrice(gst.total)}</dd></div>
            <div><dt>Seller GSTIN</dt><dd className="t-numeric">10FSRPS8895F1ZW</dd></div>
          </dl>
          <p className="adm-muted adm-note adm-pad">
            Figures cover delivered orders only. GST collected is held on behalf of the government and
            is payable on the next GSTR-3B filing regardless of profit.
          </p>
        </Panel>
      </div>

      <div className="adm-grid adm-grid--2">
        <Panel title="Profit & loss summary" subtitle="Item 138–139">
          <table className="adm-table adm-table--mini">
            <caption className="sr-only">Profit and loss summary</caption>
            <tbody>
              <tr><th scope="row">Gross revenue</th><td className="is-right t-numeric">{formatPrice(d.cards.totalSales)}</td></tr>
              <tr><th scope="row">Less: cost of goods sold</th><td className="is-right t-numeric is-bad">− {formatPrice(d.extras.cogs)}</td></tr>
              <tr className="is-subtotal"><th scope="row">Gross profit</th><td className="is-right t-numeric">{formatPrice(d.extras.profit)}</td></tr>
              <tr><th scope="row">Less: staff payroll (annual)</th><td className="is-right t-numeric is-bad">− {formatPrice(expenses.payroll)}</td></tr>
              <tr><th scope="row">Less: marketing (~4% of revenue)</th><td className="is-right t-numeric is-bad">− {formatPrice(expenses.marketing)}</td></tr>
              <tr><th scope="row">Less: shipping subsidy</th><td className="is-right t-numeric is-bad">− {formatPrice(expenses.shipping)}</td></tr>
              <tr><th scope="row">Less: platform fees (~2%)</th><td className="is-right t-numeric is-bad">− {formatPrice(expenses.platform)}</td></tr>
              <tr className="is-total"><th scope="row">Net profit (estimated)</th><td className="is-right t-numeric">{formatPrice(netProfit)}</td></tr>
            </tbody>
          </table>
          <p className="adm-muted adm-note adm-pad">
            Operating expenses are <strong>estimates</strong> (percentages of revenue, not ledger
            entries). Treat this as a directional figure, not a filed P&amp;L. Rent, utilities, interest
            and capital expenditure are not yet modelled.
          </p>
        </Panel>

        <StatusDonut data={statusData} />
      </div>

      {/* -------------------------------------------------- staff-wise sales */}
      <Panel title="Staff-wise sales" subtitle="Item 85 · revenue attributed to the handling staff member" bodyClass="adm-panel__body--flush">
        <table className="adm-table adm-table--mini">
          <thead>
            <tr>
              <th scope="col">Staff</th>
              <th scope="col">Role</th>
              <th scope="col">Department</th>
              <th scope="col" className="is-right">Orders</th>
              <th scope="col" className="is-right">Delivered value</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.staff.map((m) => {
              const orders = state.orders.filter((o) => o.staffId === m.id);
              const delivered = orders.filter((o) => o.status === 'delivered');
              const value = delivered.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.role}</td>
                  <td>{m.department}</td>
                  <td className="is-right t-numeric">{formatCompact(orders.length)}</td>
                  <td className="is-right t-numeric">{formatPrice(value)}</td>
                  <td><StatusPill status={m.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}