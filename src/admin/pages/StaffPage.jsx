import { useMemo, useState } from 'react';

import {
  Alert,
  Field,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusPill,
  Switch,
} from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { GRANT, PERMISSIONS, ROLES, can, defaultMatrix } from '../data/permissions.js';
import { formatPrice } from '../../utils/format.js';

const DEPARTMENTS = ['Management', 'Operations', 'Sales', 'Support', 'Warehouse', 'Accounts'];

export default function StaffPage() {
  const state = useAdmin();
  const [overrides, setOverrides] = useState({});
  const [tab, setTab] = useState('staff');

  const staffSales = useMemo(() => {
    const map = new Map();
    for (const o of state.orders) {
      if (o.status !== 'delivered' || !o.staffId) continue;
      map.set(o.staffId, (map.get(o.staffId) ?? 0) + o.total);
    }
    return map;
  }, [state.orders]);

  const cycleGrant = (role, permission) => {
    const order = [GRANT.YES, GRANT.APPROVAL, GRANT.LIMITED, GRANT.NO];
    const current = can(role, permission, overrides);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setOverrides((o) => ({ ...o, [`${role}.${permission}`]: next }));
  };

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Staff & Roles' }]}
        title="Staff & permission control"
        subtitle={`${state.staff.filter((s) => s.status === 'active').length} active · ${state.staff.filter((s) => s.status === 'suspended').length} suspended`}
      />

      <div className="adm-tabs" role="tablist" aria-label="Staff sections">
        {[
          ['staff', 'Staff accounts'],
          ['roles', 'Permission matrix'],
          ['logs', 'Activity & attendance'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`stab-${key}`}
            aria-selected={tab === key}
            aria-controls={`spanel-${key}`}
            className={`adm-tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------ staff */}
      {tab === 'staff' ? (
        <div id="spanel-staff" role="tabpanel" aria-labelledby="stab-staff">
          <div className="adm-grid adm-grid--2">
            <Panel title="Team" subtitle="Items 66–69, 77–78, 84" bodyClass="adm-panel__body--flush">
              <table className="adm-table adm-table--mini">
                <thead>
                  <tr>
                    <th scope="col">Staff</th>
                    <th scope="col">Role</th>
                    <th scope="col">Dept.</th>
                    <th scope="col" className="is-right">Sales</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {state.staff.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className="adm-prod">
                          <span className="adm-initials" aria-hidden="true">{m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                          <span className="adm-prod__text">
                            <span className="adm-cellmain">{m.name}</span>
                            <span className="adm-muted t-numeric">{m.id} · {m.email}</span>
                          </span>
                        </span>
                      </td>
                      <td><StatusPill tone={ROLES[m.role]?.color ?? 'grey'}>{ROLES[m.role]?.label ?? m.role}</StatusPill></td>
                      <td>{m.department}</td>
                      <td className="is-right t-numeric">{m.role === 'superadmin' ? '—' : formatPrice(staffSales.get(m.id) ?? 0)}</td>
                      <td><StatusPill status={m.status} /></td>
                      <td>
                        {m.role !== 'superadmin' ? (
                          <button
                            type="button"
                            className="adm-btn adm-btn--ghost adm-btn--sm"
                            onClick={() => admin.toggleStaffStatus(m.id)}
                          >
                            {m.status === 'active' ? 'Suspend' : 'Reinstate'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <StaffForm />
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ roles */}
      {tab === 'roles' ? (
        <div id="spanel-roles" role="tabpanel" aria-labelledby="stab-roles">
          <Alert tone="info" title="How this matrix works">
            Each cell cycles Full → Needs approval → Limited → None. Super Admin always has full
            access and is not listed. Changes apply immediately in this browser.
          </Alert>

          <Panel title="Permission matrix" subtitle="Configurable by the Super Admin">
            <div className="adm-table__scroll" role="region" aria-label="Permission matrix" tabIndex={0}>
              <table className="adm-table adm-matrix">
                <thead>
                  <tr>
                    <th scope="col">Permission</th>
                    {Object.values(ROLES).map((r) => (
                      <th key={r.id} scope="col" className="is-center">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((p) => (
                    <tr key={p.id}>
                      <th scope="row" className="adm-matrix__perm">
                        <span className="adm-cellmain">{p.label}</span>
                        <span className="adm-muted">{p.group}</span>
                      </th>
                      {Object.values(ROLES).map((role) => {
                        const grant = can(role.id, p.id, overrides);
                        return (
                          <td key={role.id} className="is-center">
                            <button
                              type="button"
                              className={`adm-grant adm-grant--${grant}`}
                              onClick={() => cycleGrant(role.id, p.id)}
                              aria-label={`${p.label} for ${role.label}: ${grant}. Click to change.`}
                            >
                              {grant === 'yes' ? 'Full' : grant === 'approval' ? 'Approval' : grant === 'limited' ? 'Limited' : 'None'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="adm-actionsrow adm-mt">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setOverrides(defaultMatrix())}>
                Reset to defaults
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setOverrides({})}>
                Clear overrides
              </button>
            </div>
          </Panel>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- logs */}
      {tab === 'logs' ? (
        <div id="spanel-logs" role="tabpanel" aria-labelledby="stab-logs">
          <div className="adm-grid adm-grid--2">
            <Panel title="Attendance & hours" subtitle="Items 77–78" bodyClass="adm-panel__body--flush">
              <table className="adm-table adm-table--mini">
                <thead>
                  <tr>
                    <th scope="col">Staff</th>
                    <th scope="col">Shift</th>
                    <th scope="col" className="is-right">Attendance</th>
                    <th scope="col" className="is-right">2FA</th>
                  </tr>
                </thead>
                <tbody>
                  {state.staff.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td className="t-numeric">{m.workingHours}</td>
                      <td className="is-right t-numeric">{m.attendance}%</td>
                      <td className="is-right">
                        {m.twoFactor ? <StatusPill status="ok">On</StatusPill> : <StatusPill status="warn">Off</StatusPill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="adm-muted adm-note adm-pad">
                Attendance is a static figure in this build. Real attendance needs a check-in endpoint
                and a server-side log — it must not be editable from the client.
              </p>
            </Panel>

            <Panel title="Staff activity log" subtitle="Item 80" bodyClass="adm-panel__body--flush">
              <ul className="adm-feed">
                {state.audit.slice(0, 20).map((a) => (
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
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ======================================================================== */

function StaffForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'staff', department: 'Sales', salary: 18000, workingHours: '10:00–18:00' });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Panel title="Create staff account" subtitle="Items 66–71, 83–84">
      <form
        className="stack-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim() || !form.email.includes('@')) {
            window.alert('Name and a valid email are required.');
            return;
          }
          admin.saveStaff({
            ...form,
            status: 'active',
            attendance: 100,
            sales: 0,
            twoFactor: false,
            avatar: 'brand/avatar-a.svg',
          });
          setForm({ name: '', email: '', phone: '', role: 'staff', department: 'Sales', salary: 18000, workingHours: '10:00–18:00' });
        }}
      >
        <Field label="Full name" required>
          <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="8503988085" />
        </Field>
        <div className="adm-grid adm-grid--2 adm-grid--gap">
          <Field label="Role" hint={ROLES[form.role].description}>
            <Select value={form.role} onChange={(e) => set({ role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </Select>
          </Field>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => set({ department: e.target.value })}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="adm-grid adm-grid--2 adm-grid--gap">
          <Field label="Monthly salary (₹)">
            <Input type="number" min="0" value={form.salary} onChange={(e) => set({ salary: Number(e.target.value) })} />
          </Field>
          <Field label="Working hours">
            <Input value={form.workingHours} onChange={(e) => set({ workingHours: e.target.value })} placeholder="10:00–18:00" />
          </Field>
        </div>
        <Switch checked={false} readOnly label="Two-factor authentication" hint="Enable after the account signs in once." />
        <button type="submit" className="adm-btn adm-btn--primary">Create account</button>
        <p className="adm-muted adm-note">
          Staff IDs (STF-xxxx) are generated automatically. Sign-in for staff is not wired to Firebase
          Auth yet — see the README for what is needed.
        </p>
      </form>
    </Panel>
  );
}