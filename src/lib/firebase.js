/**
 * Firebase app + Auth singletons.
 *
 * Initialised once at module scope and imported wherever needed, so we never
 * create two competing app instances (which would break auth state).
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig.js';

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

/** null when the project is misconfigured — consumers must handle that. */
export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export const googleProvider = new GoogleAuthProvider();

/**
 * Ask only for what the app actually uses. Fewer scopes means a shorter consent
 * screen and a higher completion rate.
 */
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/** Scopes the sign-in modal claims to read. */
export const AUTH_SCOPES = ['email', 'public_profile'];