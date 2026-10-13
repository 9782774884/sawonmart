# Replacing the demo backend

The admin panel currently persists to `localStorage`. That is a **working demo
backend** — it survives refresh and supports create/edit/archive — but it is
single-browser, not backed up, and trivially edited. This file records what to
swap in before real orders flow through it.

## The seam

Every read and write goes through `src/admin/data/store.js`:

- `useAdmin()` — subscribes to the store snapshot (`useSyncExternalStore`)
- `admin.saveProduct()`, `admin.updateOrderStatus()`, `admin.adjustStock()`, …
- `selectDashboard(state, rangeDays)` — every derived figure on the dashboard

Swap those three things and no component needs to change.

## Option A — Firestore (matches the existing Firebase setup)

The project already has Hosting and Auth on `sawonstore-b`, so Firestore is the
path of least resistance.

```js
// src/lib/firebase.js — add alongside the existing initialisation
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const db = getFirestore(firebaseApp);
```

Then replace the store's internals:

```js
import {
  collection, doc, getDocs, onSnapshot, setDoc, addDoc, updateDoc, query,
} from 'firebase/firestore';

const SNAPSHOT = async () => {
  const [products, orders, customers, staff, coupons, audit] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'orders')),
    // …
  ]);
  return { products: products.docs.map(toData), /* … */ };
};
```

`onSnapshot` gives you the live updates for free, so `useAdmin` becomes a thin
wrapper and the manual `listeners` set disappears.

Collections to create: `products`, `orders`, `customers`, `staff`, `coupons`,
`audit`, `warehouses`, `suppliers`.

### Security rules are the whole point

A client-side permission matrix is a UI hint, not a control. Write rules that
enforce it server-side:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isAdmin() {
      return request.auth != null
        && get(/databases/$(db)/documents/staff/$(request.auth.token)).data.role == 'admin';
    }
    function canEditPrice() {
      return isAdmin() || request.resource.data.price
                            == resource.data.price;   // price changes need an admin
    }

    match /products/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      // Delete is archive-only: order history must keep its product reference.
      allow delete: if false;
      allow update: if request.auth != null
        && canEditPrice()
        && request.resource.data.id == resource.data.id;
    }

    match /orders/{id} {
      allow read, update: if request.auth != null;
      // Only an admin may move an order backwards or issue a refund.
      allow update: if isAdmin() || request.resource.data.status == 'delivered';
    }

    // The audit log is append-only and never client-editable.
    match /audit/{id} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }
  }
}
```

Points worth keeping:

- **`allow delete: if false` on products.** Archive (`status: 'inactive'`)
  instead, or historical orders lose their product reference. The UI already
  treats archive as the default and only offers hard delete behind a warning.
- **Price changes are conditional.** That is how "Manager needs approval"
  becomes real rather than advisory.
- **The audit log is append-only.** Currently a user can edit or erase it in
  devtools, which is why the Security page says an untrusted audit trail is
  worse than none.

## Option B — REST API

If the catalogue eventually comes from a real backend, keep the same shape:
have `store.js` fetch a snapshot and POST mutations, and every component keeps
working unchanged.

## Before either option

1. **Staff authentication.** `RequireAdminAuth.jsx` is a demo dropdown, not a
   login. Wire it to Firebase Auth (the storefront already has Google sign-in)
   and look the staff record up server-side by email.
2. **Mandatory MFA** for anyone who can issue refunds, change prices, or export
   customer data.
3. **Server-side profit and margin protection.** The bulk-discount button in
   Pricing refuses to breach the margin floor, but that check currently runs in
   the browser and can be bypassed.
4. **Sequential, gap-free invoice and credit-note numbers** per financial year.
5. **Payment state from gateway webhooks**, never from the client.

## What the demo data is

`src/admin/data/seed.js` generates 1,450 orders across 12 months, 240 customers
and 37 products from a fixed-seed PRNG, so the figures are identical on every
machine. It is illustrative, not accounting data.