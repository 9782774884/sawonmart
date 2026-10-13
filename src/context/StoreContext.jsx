import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const StoreContext = createContext(null);

/** Upper bound per line item — keeps the drawer honest about stock. */
export const MAX_QTY = 10;

/* ========================================================================
   TOAST QUEUE
   A tiny reducer keeps notifications in one place instead of scattering
   setTimeout calls across every component.
   ======================================================================== */

let toastSeq = 0;

function toastReducer(state, action) {
  switch (action.type) {
    case 'push':
      // Keep the stack shallow — drop the oldest when it overflows.
      return [...state.slice(-2), action.payload];

    case 'dismiss':
      return state.filter((toast) => toast.id !== action.payload);

    default:
      return state;
  }
}

/* ========================================================================
   PROVIDER
   ======================================================================== */

export function StoreProvider({ children }) {
  const [cart, setCart] = useLocalStorage(STORAGE_KEYS.cart, []);
  const [wishlist, setWishlist] = useLocalStorage(STORAGE_KEYS.wishlist, []);
  const [toasts, dispatchToast] = useReducer(toastReducer, []);

  /* ---------------------------------------------------------------- toasts */

  const dismissToast = useCallback(
    (id) => dispatchToast({ type: 'dismiss', payload: id }),
    [dispatchToast]
  );

  const pushToast = useCallback(
    ({ title, text = '', tone = 'info' }) => {
      toastSeq += 1;
      const id = `toast-${toastSeq}`;
      dispatchToast({ type: 'push', payload: { id, title, text, tone } });
      window.setTimeout(() => dispatchToast({ type: 'dismiss', payload: id }), 3600);
    },
    [dispatchToast]
  );

  /* ------------------------------------------------------------------ cart */

  const addToCart = useCallback(
    (product, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((line) => line.id === product.id);
        if (existing) {
          return prev.map((line) =>
            line.id === product.id ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY) } : line
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            qty,
          },
        ];
      });
      pushToast({ title: 'Cart mein add ho gaya', text: product.title, tone: 'success' });
    },
    [setCart, pushToast]
  );

  const decrementCart = useCallback(
    (id) => {
      setCart((prev) =>
        prev
          .map((line) => (line.id === id ? { ...line, qty: Math.max(0, line.qty - 1) } : line))
          .filter((line) => line.qty > 0)
      );
    },
    [setCart]
  );

  const incrementCart = useCallback(
    (id) => {
      setCart((prev) =>
        prev.map((line) =>
          line.id === id ? { ...line, qty: Math.min(line.qty + 1, MAX_QTY) } : line
        )
      );
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (id) => setCart((prev) => prev.filter((line) => line.id !== id)),
    [setCart]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

  /* -------------------------------------------------------------- wishlist */

  const isWishlisted = useCallback(
    (id) => wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      const exists = wishlist.some((item) => item.id === product.id);
      pushToast({
        title: exists ? 'Wishlist se hata diya' : 'Wishlist mein daal diya',
        text: product.title,
        tone: exists ? 'info' : 'success',
      });
      setWishlist((prev) =>
        prev.some((item) => item.id === product.id)
          ? prev.filter((item) => item.id !== product.id)
          : [
              ...prev,
              {
                id: product.id,
                title: product.title,
                brand: product.brand,
                price: product.price,
                image: product.image,
              },
            ]
      );
    },
    [setWishlist, wishlist, pushToast]
  );

  /* -------------------------------------------------------------- derived */

  const cartSummary = useMemo(() => {
    const count = cart.reduce((sum, line) => sum + line.qty, 0);
    const mrpTotal = cart.reduce((sum, line) => sum + (line.mrp ?? line.price) * line.qty, 0);
    const total = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
    return { count, total, mrpTotal, savings: Math.max(0, mrpTotal - total) };
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartSummary,
      addToCart,
      decrementCart,
      incrementCart,
      removeFromCart,
      clearCart,
      wishlist,
      isWishlisted,
      toggleWishlist,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      cart,
      cartSummary,
      addToCart,
      decrementCart,
      incrementCart,
      removeFromCart,
      clearCart,
      wishlist,
      isWishlisted,
      toggleWishlist,
      toasts,
      pushToast,
      dismissToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Convenience accessor with a helpful error when used outside the provider. */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore() must be called inside <StoreProvider>');
  return ctx;
}