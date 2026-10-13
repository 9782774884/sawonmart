import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';

import { auth, googleProvider } from '../lib/firebase.js';

const AuthContext = createContext(null);

/**
 * Turns a Firebase Auth error code into something a shopper can act on.
 * Returning a real message instead of `auth/some-code` is the difference
 * between a useful error and a support ticket.
 */
export function describeAuthError(error) {
  switch (error?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Login cancel kar diya gaya.';
    case 'auth/popup-blocked':
      return 'Popup block ho gaya. Redirect use karke try kar rahe hain.';
    case 'auth/unauthorized-domain':
      return 'Ye website Firebase me authorized nahi hai.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in Firebase console me enable nahi hai. Admin → Authentication → Sign-in method → Google.';
    case 'auth/network-request-failed':
      return 'Network error. Apna internet check karein.';
    case 'auth/account-exists-with-different-credential':
      return 'Ye email pehle se dusre tarike se login hai.';
    default:
      return 'Login nahi ho paya. Thodi der baad dobara try karein.';
  }
}

/** Popups are unreliable on mobile browsers, so detect them up front. */
const prefersRedirect = () =>
  window.matchMedia('(max-width: 900px), (display-mode: standalone)').matches;

/**
 * Marker written immediately before leaving for Google.
 *
 * It exists because of a silent-failure mode: when the provider is not
 * configured, Google returns without a credential and `getRedirectResult`
 * RESOLVES to `null` instead of rejecting. The page reloads looking exactly
 * like a fresh visit, so without this marker the user clicks "Continue with
 * Google", is bounced through two redirects, returns, and gets no explanation
 * whatsoever. Comparing the result against a known intent is what turns that
 * into a visible error.
 */
const REDIRECT_MARKER = 'sawonmart:auth:redirect-attempted';

function markRedirectAttempt() {
  try {
    sessionStorage.setItem(REDIRECT_MARKER, '1');
  } catch {
    /* private mode — the popup path still reports errors normally */
  }
}

function consumeRedirectAttempt() {
  try {
    const had = sessionStorage.getItem(REDIRECT_MARKER) === '1';
    if (had) sessionStorage.removeItem(REDIRECT_MARKER);
    return had;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingError, setPendingError] = useState(null);

  /* --------------------------------------------------------- lifecycle */

  useEffect(() => {
    if (!auth) {
      setInitialising(false);
      return undefined;
    }

    let active = true;
    let unsubscribe;

    /**
     * A redirect sign-in is only complete once getRedirectResult resolves, so
     * the listener must not attach before that settles.
     *
     * Three outcomes, and all three have to be handled or the failure is
     * invisible:
     *   1. a credential  → signed in
     *   2. null, no marker → the user simply landed here; nothing went wrong
     *   3. null, marker set → we left for Google and came back empty-handed.
     *      This is what a disabled Google provider looks like, and without this
     *      branch the user is dropped on the homepage with no message at all.
     */
    getRedirectResult(auth)
      .then((result) => {
        if (!active) return;
        if (result) {
          consumeRedirectAttempt();
          setPendingError(null);
          return;
        }
        if (consumeRedirectAttempt()) {
          setPendingError(
            'Google sign-in complete nahi hua. Firebase console me Google provider enable nahi hai ya domain authorized nahi hai.'
          );
        }
      })
      .catch((error) => {
        if (!active) return;
        consumeRedirectAttempt();
        // The benign case: the user pressed Back and returned unauthenticated.
        if (error?.code === 'auth/operation-not-pending') return;
        setPendingError(describeAuthError(error));
      })
      .finally(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setInitialising(false);
        });
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  /* ------------------------------------------------------------ actions */

  const signIn = useCallback(async () => {
    if (!auth) {
      return { ok: false, message: 'Firebase config missing hai.' };
    }

    setBusy(true);
    try {
      // Skip the popup entirely where it is known to misbehave.
      //
      // NOTE: the redirect flow does NOT resolve as a successful sign-in. This
      // promise resolves the moment the browser starts navigating away, and the
      // real result arrives via getRedirectResult() on the way back. Reporting
      // `ok` here would close the dialog and discard the context, so a failure
      // afterwards looked like the user had simply dismissed a dialog.
      if (prefersRedirect()) {
        markRedirectAttempt();
        await signInWithRedirect(auth, googleProvider);
        return { ok: false, redirecting: true, message: '' };
      }

      await signInWithPopup(auth, googleProvider);
      return { ok: true };
    } catch (error) {
      // Desktop popups can still be blocked by the browser or an extension —
      // a redirect is the reliable fallback.
      if (error?.code === 'auth/popup-blocked') {
        try {
          markRedirectAttempt();
          await signInWithRedirect(auth, googleProvider);
          return { ok: false, redirecting: true, message: '' };
        } catch (redirectError) {
          return { ok: false, message: describeAuthError(redirectError) };
        }
      }

      return { ok: false, message: describeAuthError(error) };
    } finally {
      setBusy(false);
    }
  }, []);

  const logOut = useCallback(async () => {
    if (!auth) return { ok: false };
    try {
      await signOut(auth);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  }, []);

  // Stable identity: the header runs an effect on this, and a fresh closure
  // each render would restart its dismiss timer forever.
  const clearPendingError = useCallback(() => setPendingError(null), []);

  const value = useMemo(
    () => ({
      user,
      initialising,
      busy,
      signIn,
      logOut,
      /** Error from a completed redirect attempt, surfaced by the header. */
      pendingError,
      clearPendingError,
      isAuthenticated: Boolean(user),
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
      photoURL: user?.photoURL ?? '',
      initials: (user?.displayName ?? user?.email ?? '?')
        .split(/\s|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    }),
    [user, initialising, busy, signIn, logOut, pendingError, clearPendingError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be called inside <AuthProvider>');
  return ctx;
}