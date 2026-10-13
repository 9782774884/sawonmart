import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import './styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      {/* AuthProvider wraps StoreProvider so the header can read the signed-in
          user while still being able to raise toasts. */}
      <AuthProvider>
        <StoreProvider>
          {/* BrowserRouter gives real, shareable URLs (/product/:id) instead of
              hash fragments, which search engines can index. */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);