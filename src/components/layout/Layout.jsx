import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header.jsx';
import NavBar from './NavBar.jsx';
import TopStrip from './TopStrip.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import ToastStack from '../ui/Toast.jsx';
import BackToTop from '../ui/BackToTop.jsx';
import WhatsAppButton from '../ui/WhatsAppButton.jsx';

/**
 * Persistent page chrome shared by every route.
 *
 * The cart drawer and the toast region are owned here (not per page) so their
 * state — and the scroll lock — survive client-side navigation.
 */
export default function Layout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="app" id="top">
      <a className="skip-link" href="#main-content">
        Main content par jaayein
      </a>

      <TopStrip />
      <Header onOpenCart={() => setCartOpen(true)} />
      <NavBar />

      {/* tabIndex -1 lets the skip link move focus here without adding a tab stop */}
      <main id="main-content" className="app__main" tabIndex={-1}>
        {children ?? <Outlet />}
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <BackToTop />
      <WhatsAppButton />
      <ToastStack />
    </div>
  );
}