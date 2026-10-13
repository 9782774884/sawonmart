/**
 * Firebase web client configuration for project `sawonstore-b`.
 *
 * SECURITY NOTE: this file is intentionally committed. A Firebase *web* config
 * (apiKey, authDomain, projectId …) is a public client identifier, not a
 * credential — Firebase Auth is protected by the OAuth flow and the
 * authorized-domains list, not by hiding this object. The real secrets are the
 * service-account keys, which must never be bundled into a web app.
 *
 * To point at a different project, replace these values or supply the matching
 * VITE_FIREBASE_* environment variables (see .env.example).
 *
 * Generated with:  firebase apps:sdkconfig WEB <appId> --project sawonstore-b
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB18UJqvjKBVJLkBZmgwPRmbgKMGTCKook',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sawonstore-b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sawonstore-b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sawonstore-b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '241947922780',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:241947922780:web:37310ce5d317c04eb6f199',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-NTH3P8TPLG',
};

/** True when every required key is present — guards against a half-filled config. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);