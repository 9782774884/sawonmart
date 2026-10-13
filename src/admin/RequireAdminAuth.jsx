import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Alert, Field, Select } from './components/AdminUI.jsx';
import { ROLES } from './data/permissions.js';

/**
 * Admin route guard.
 *
 * WARNING: THIS IS NOT AUTHENTICATION. It is a demo gate.
 *
 * No staff authentication is wired up, so this component cannot stop a
 * determined user — the role sits in a dropdown and the data lives in their own
 * localStorage. It exists so the admin area is not accidentally published, and
 * so the permission matrix can be exercised by switching roles.
 *
 * Before this goes anywhere real, replace the body with a Firebase Auth check:
 *
 *   const user = useAuth().user;
 *   if (!user) return <Navigate to="/admin/login" replace />;
 *   const staff = await lookupStaffRecord(user.email);   // server-side
 *   if (!staff?.roles.includes(requiredRole)) return <Navigate to="/" replace />;
 *
 * The permission matrix must also be enforced by the API. A client-side check
 * only decides what to draw; it cannot protect the data.
 */

const SESSION_KEY = 'sawonmart:admin:role';

const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  return (
    useContext(AdminAuthContext) ?? {
      role: 'superadmin',
      signedIn: true,
      signOut: () => {},
      chooseRole: () => {},
      isDemo: true,
      label: 'Super Admin',
    }
  );
}

const DEMO_ROLES = [
  { value: 'superadmin', label: 'Super Admin', description: 'Everything, including staff and security.' },
  { value: 'admin', label: 'Admin', description: 'Full access per the permission matrix.' },
  { value: 'manager', label: 'Manager', description: 'Price and refund changes need approval.' },
  { value: 'staff', label: 'Staff', description: 'Orders and products only. No pricing.' },
];

export default function RequireAdminAuth() {
  const [signedIn, setSignedIn] = useState(true);
  const [role, setRole] = useState('superadmin');

  // Restore the demo role from storage, guarded for private mode.
  useMemo(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored && DEMO_ROLES.some((r) => r.value === stored)) setRole(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const chooseRole = useCallback((next) => {
    setRole(next);
    setSignedIn(true);
    try {
      localStorage.setItem(SESSION_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => setSignedIn(false), []);

  if (!signedIn) {
    return (
      <div className="adm-gate">
        <div className="adm-gate__card">
          <p className="adm-gate__brand">SAWON E-Commerce · Admin Control Panel</p>
          <h1 className="adm-gate__title">Staff sign-in</h1>

          <Alert tone="warn" title="Demo only — this is not authentication">
            No staff account system is connected. Pick a role to explore the permission matrix; it
            protects nothing.
          </Alert>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              chooseRole(role);
            }}
          >
            <Field label="Sign in as" hint={DEMO_ROLES.find((r) => r.value === role)?.description}>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                {DEMO_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </Field>

            <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block">
              Enter admin panel
            </button>
          </form>

          <p className="adm-gate__foot">
            <a href="/">← Back to storefront</a>
          </p>
        </div>
      </div>
    );
  }

  const value = useMemo(
    () => ({
      role,
      signedIn,
      signOut,
      chooseRole,
      isDemo: true,
      label: ROLES[role]?.label ?? 'Super Admin',
    }),
    [role, signedIn, signOut, chooseRole]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}