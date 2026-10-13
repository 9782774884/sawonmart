import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompact, formatPrice } from '../../utils/format.js';

/**
 * Chart wrappers.
 *
 * Recharts renders SVG, which means every chart here is inspectable, scalable
 * and readable by assistive tech via its accompanying table/summary. The
 * visual is decorative; the numbers are also rendered as text.
 */

const AXIS = { stroke: '#8b93a5', fontSize: 11 };
const GRID = '#e6e9ef';
const TIP = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #dfe3ea',
    boxShadow: '0 8px 24px rgba(0,0,0,.08)',
    fontSize: 12,
  },
};

export const PALETTE = ['#2169e0', '#0f9d58', '#ff9f00', '#7c4dff', '#ff4747', '#00a3bf', '#e0a33e', '#5a6a89'];

const money = (v) => `₹${formatCompact(v ?? 0)}`;

function Frame({ title, subtitle, height = 260, children, footer }) {
  return (
    <figure className="adm-chart">
      <figcaption className="adm-chart__head">
        <span className="adm-chart__title">{title}</span>
        {subtitle ? <span className="adm-chart__sub">{subtitle}</span> : null}
      </figcaption>
      <div className="adm-chart__body" style={{ height }}>
        {children}
      </div>
      {footer ? <p className="adm-chart__foot">{footer}</p> : null}
    </figure>
  );
}

/* ------------------------------------------------------------ revenue chart */

export function RevenueChart({ data, months = false }) {
  return (
    <Frame
      title={months ? 'Revenue — last 12 months' : 'Revenue — selected range'}
      subtitle="Gross sales value of delivered orders"
      height={280}
      footer="Counts delivered orders only. Revenue is recognised on delivery, not on checkout."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="admRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2169e0" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#2169e0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey={months ? 'month' : 'date'} {...AXIS} tickLine={false} axisLine={false} />
          <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={money} width={58} />
          <Tooltip {...TIP} formatter={(v, n) => [formatPrice(v), n === 'revenue' ? 'Revenue' : 'Profit']} />
          <Area type="monotone" dataKey="revenue" stroke="#2169e0" strokeWidth={2.5} fill="url(#admRev)" />
        </AreaChart>
      </ResponsiveContainer>
    </Frame>
  );
}

/* ------------------------------------------------------ profit & loss chart */

export function ProfitLossChart({ data }) {
  // Waterfall-ish view: revenue minus cost is profit, so plotting all three
  // makes the gap between them legible at a glance.
  const rows = data.map((d) => ({
    ...d,
    expense: Math.max(0, d.revenue - d.profit),
  }));

  return (
    <Frame
      title="Profit & loss"
      subtitle="Revenue vs cost of goods sold"
      height={280}
      footer="Profit = delivered revenue − cost of goods sold − shipping. Cancelled and returned orders contribute no profit."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="date" {...AXIS} tickLine={false} axisLine={false} />
          <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={money} width={58} />
          <Tooltip {...TIP} formatter={(v, n) => [formatPrice(v), n]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" fill="#2169e0" radius={[3, 3, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expense" name="Cost of goods" fill="#9aa3b2" radius={[3, 3, 0, 0]} maxBarSize={18} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke="#0f9d58" strokeWidth={2.5} dot={false} />
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  );
}

/* ------------------------------------------------------------ order volume */

export function OrderVolumeChart({ data }) {
  return (
    <Frame title="Order volume" subtitle="Orders placed per day" height={220}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="date" {...AXIS} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis {...AXIS} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <Tooltip {...TIP} />
          <Line type="monotone" dataKey="orders" stroke="#7c4dff" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  );
}

/* ----------------------------------------------------- sales by location */

export function LocationChart({ data }) {
  return (
    <Frame title="Sales by location" subtitle="Top cities by revenue" height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" {...AXIS} tickLine={false} axisLine={false} tickFormatter={money} />
          <YAxis type="category" dataKey="city" {...AXIS} tickLine={false} axisLine={false} width={92} />
          <Tooltip {...TIP} formatter={(v, n) => [n === 'revenue' ? formatPrice(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
          <Bar dataKey="revenue" fill="#2169e0" radius={[0, 3, 3, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  );
}

/* ------------------------------------------------------------ order status */

export function StatusDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Frame title="Orders by status" subtitle={`${formatCompact(total)} total`} height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip {...TIP} formatter={(v, n) => [`${formatCompact(v)} orders`, n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </Frame>
  );
}

export { Frame as ChartFrame };