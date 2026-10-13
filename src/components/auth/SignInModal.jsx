import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Icon from '../ui/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';

/** Google's official multi-colour mark, inlined so there is no extra request. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.17 7.09-10.32 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const BENEFITS = [
  { icon: 'truck', text: 'Orders track karein aur delivery status dekhein' },
  { icon: 'heart', text: 'Wishlist aur saved addresses sync rahega' },
  { icon: 'bolt', text: 'Aapke liye personal offers aur early access' },
];

/**
 * Google sign-in dialog.
 *
 * Replaces the old mock phone/OTP form — authentication is now entirely
 * Firebase + Google OAuth, so there is no credential field to submit.
 */
export default function SignInModal({ open, onClose }) {
  const { signIn, busy, initialising, pendingError, clearPendingError } = useAuth();
  const { pushToast } = useStore();
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  /** Dismissing the dialog means the message has been read. */
  const close = () => {
    clearPendingError();
    setError(null);
    setRedirecting(false);
    onClose();
  };

  const onSignIn = async () => {
    setError(null);
    clearPendingError();
    const result = await signIn();

    if (result.ok) {
      close();
      return;
    }

    // The browser is leaving for Google. Hold the dialog open and let the page
    // unload — the outcome arrives on the return trip via pendingError.
    if (result.redirecting) {
      setRedirecting(true);
      return;
    }

    setError(result.message);
    pushToast({ title: 'Login nahi ho paya', text: result.message, tone: 'error' });
  };

  // A popup sign-in fails here; a redirect sign-in fails on the return trip.
  // Either way the user comes back to this dialog and must see why.
  const shown = error ?? pendingError;
  const locked = busy || redirecting;

  return (
    <Modal open={open} onClose={close} title="Login karein" size="sm">
      <p className="signin__lead">
        Apne Google account se login karein — koi password ya OTP yaad rakhne ki zaroorat
        nahi.
      </p>

      <button
        type="button"
        className="signin__google"
        onClick={onSignIn}
        disabled={locked || initialising}
        aria-describedby={shown ? 'signin-error' : undefined}
      >
        <span className="signin__google-mark">
          <GoogleMark />
        </span>
        <span>
          {locked ? 'Google khol rahe hain…' : busy ? 'Login ho raha hai…' : 'Continue with Google'}
        </span>
      </button>

      {shown ? (
        <p className="signin__error" id="signin-error" role="alert">
          {shown}
        </p>
      ) : null}

      <ul className="signin__benefits">
        {BENEFITS.map((item) => (
          <li key={item.text}>
            <Icon name={item.icon} size={17} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <p className="signin__legal">
        Login karke aap{' '}
        <a href="#terms" className="link">
          Terms
        </a>{' '}
        aur{' '}
        <a href="#privacy" className="link">
          Privacy Policy
        </a>{' '}
        se sehmat hain. Google humein sirf aapka naam, email aur photo deta hai.
      </p>
    </Modal>
  );
}