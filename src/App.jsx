import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout.jsx';
import ScrollToTopOnNavigate from './components/ui/ScrollToTopOnNavigate.jsx';

import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import RequireAdminAuth from './admin/RequireAdminAuth.jsx';

/**
 * The admin panel is code-split.
 *
 * Recharts plus the admin screens add ~550 kB of JavaScript that no shopper
 * should download. Everything under /admin is loaded on demand, so the
 * storefront bundle stays lean and first paint is unaffected.
 */
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage.jsx'));
const ProductsPage = lazy(() => import('./admin/pages/ProductsPage.jsx'));
const ProductFormPage = lazy(() => import('./admin/pages/ProductFormPage.jsx'));
const OrdersPage = lazy(() => import('./admin/pages/OrdersPage.jsx'));
const OrderDetailPage = lazy(() => import('./admin/pages/OrderDetailPage.jsx'));
const CustomersPage = lazy(() => import('./admin/pages/CustomersPage.jsx'));
const InventoryPage = lazy(() => import('./admin/pages/InventoryPage.jsx'));
const PricingPage = lazy(() => import('./admin/pages/PricingPage.jsx'));
const StaffPage = lazy(() => import('./admin/pages/StaffPage.jsx'));
const ReportsPage = lazy(() => import('./admin/pages/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage.jsx'));
const DistributorsPage = lazy(() => import('./admin/pages/DistributorsPage.jsx'));

/* Phase 2/3 screens share one module, so it loads as a single chunk.
   `lazy()` requires a module object with a `default` key — handing it the
   component function directly makes React render `undefined`. */
const phase2 = () => import('./admin/pages/phase2.jsx');
const fromPhase2 = (name) => lazy(async () => ({ default: (await phase2())[name] }));

const ShippingPage = fromPhase2('ShippingPage');
const PaymentsPage = fromPhase2('PaymentsPage');
const MarketingPage = fromPhase2('MarketingPage');
const SecurityPage = fromPhase2('SecurityPage');

/** Wraps a storefront page in the shared header/nav/footer chrome. */
const Shop = ({ children }) => <Layout>{children}</Layout>;

function AdminFallback() {
  return (
    <div className="adm" style={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
      <p className="t-text-muted">Loading admin panel…</p>
    </div>
  );
}

/**
 * Route table.
 *
 *   /            storefront homepage
 *   /product/:id product description page
 *   /admin/*     admin control panel (noindex, separate chunk)
 *   *            404
 */
export default function App() {
  return (
    <>
      <ScrollToTopOnNavigate />

      <Routes>
        {/* ============================================ admin control panel */}
        <Route element={<RequireAdminAuth />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            {/* AdminLayout wraps <Outlet/> in its own Suspense boundary, so
                these routes need no per-element wrapper. */}
            <Route index element={<DashboardPage />} />

            <Route path="products" element={<ProductsPage />} />
            {/* /new must be declared before /:id so it is not read as an id */}
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />

            <Route path="pricing" element={<PricingPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Phase 2 / 3 — routed so the sidebar is honest about what exists */}
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="distributors" element={<DistributorsPage />} />

            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* ================================================== storefront */}
        <Route path="/" element={<Shop><HomePage /></Shop>} />
        <Route path="/product/:id" element={<Shop><ProductPage /></Shop>} />
        <Route path="*" element={<Shop><NotFoundPage /></Shop>} />
      </Routes>
    </>
  );
}