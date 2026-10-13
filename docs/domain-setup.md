# Custom domain setup — `www.sawonstore.in`

The live production origin is **`https://www.sawonstore.in`**. It is declared once
in `src/utils/constants.js` as `SITE.origin`, and every absolute URL in the
project — canonical tags, Open Graph, JSON-LD, the sitemap — is derived from it.

Two steps are required, and **both** must be done. The second is the one that
silently breaks Google sign-in if you skip it.

---

## Step 1 — Point the domain at Firebase

In the Firebase Console: **Hosting → Add custom domain**, then enter:

```
www.sawonstore.in
```

Firebase will show you a **domain verification** step and then ask for the DNS
records to create. It does this for you, but here is what you are looking at.

### If you are using the `www` host only

| Type | Name | Value |
| ---- | ---- | ----- |
| `A` | `www` | `199.36.153.4` |
| `A` | `www` | `199.36.153.5` |
| `A` | `www` | `199.36.153.6` |
| `A` | `www` | `199.36.153.7` |
| `AAAA` | `www` | `2001:4860:4802:32::34` |
| `AAAA` | `www` | `2001:4860:4802:33::34` |

If your DNS provider supports a CNAME, the equivalent single record is:

| Type | Name | Value |
| ---- | ---- | ----- |
| `CNAME` | `www` | `sawonstore-b.web.app` |

> **Verify these against the console.** Google reserves the right to change
> Firebase Hosting's edge IPs. Copy exactly what the console shows rather than
> trusting this table.

### Domain verification (often skipped, and it matters)

Firebase asks you to prove you control the domain by adding a `TXT` record.
Without it the certificate is never issued:

| Type | Name | Value |
| ---- | ---- | ----- |
| `TXT` | `www` | the exact `firebase-site-verification=…` string the console gives you |

`TXT` records are the one type that must be **literal text**. If your DNS form has
a quotes field, paste without quotes; if it does not, paste as plain text. Do not
split it across lines.

### SSL

Automatic. Once the `TXT` and address records resolve, Firebase provisions a
Google-managed certificate. This usually takes minutes but can take up to 24
hours. The site will keep serving over HTTPS on `sawonstore-b.web.app`
throughout — there is no downtime.

Check progress: **Hosting → your domain**, which shows *Provisioning* then
*Active*.

---

## Step 2 — Authorize the domain for Google sign-in

**This is the step that breaks login, and it is easy to miss.**

Go to **Authentication → Settings → Authorized domains** and add:

```
www.sawonstore.in
```

If you also add the bare apex (below), add `sawonstore.in` as well.

Until this is done, tapping *Continue with Google* on your new domain redirects
to Google, comes back, and reports:

> Google sign-in complete nahi hua. Firebase console me Google provider enable
> nahi hai ya domain authorized nahi hai.

That message is deliberately vague because Firebase reports an unauthorized
domain and a disabled provider with the same symptom. Check this list first.

`localhost` is already authorized for development, so nothing changes there.

---

## Optional but recommended — the bare apex

Without this, a visitor typing `sawonstore.in` (no `www`) gets nothing, because
`www` is the only host pointed at Firebase.

### DNS

Point the apex at the same addresses:

| Type | Name | Value |
| ---- | ---- | ----- |
| `A` | `@` | `199.36.153.4` |
| `A` | `@` | `199.36.153.5` |
| `A` | `@` | `199.36.153.6` |
| `A` | `@` | `199.36.153.7` |

### Hosting

Add `sawonstore.in` in **Hosting → Add custom domain** too, then add a redirect:

| Source | Destination | Type |
| ------ | ----------- | ---- |
| `sawonstore.in` | `https://www.sawonstore.in` | **Permanent (301)** |

That keeps exactly one canonical host, which is what `SITE.origin` assumes. Two
hosts serving the same content without a redirect splits your search ranking and
makes every canonical tag ambiguous.

**If your DNS provider does not allow both an apex A record and a CNAME** (some
do not), you cannot use a CNAME for `www` *and* an apex A record at the same
time. Use the four `A` records for both hosts — they work everywhere.

---

## After it is live

1. **Google Search Console** → add `sawonstore.in` as a **Domain** property
   (covers all subdomains), or a **URL prefix** for
   `https://www.sawonstore.in/`. Then **Sitemaps** → submit
   `sitemap.xml`.
2. Confirm `https://www.sawonstore.in/sitemap.xml` returns XML, not HTML.
3. `https://www.sawonstore.in/robots.txt` should point at the same host. If it
   still names `sawonmart.com`, `SITE.origin` and `public/robots.txt` have
   drifted apart.

### Changing the domain later

Change `SITE.origin` in `src/utils/constants.js`, update `ORIGIN` in
`scripts/generate-sitemap.mjs`, and update the `Sitemap:` line in
`public/robots.txt`. The build **fails** if the script and `index.html` disagree,
so the sitemap can never silently point somewhere else.

---

## Troubleshooting

| Symptom | Cause |
| ------- | ----- |
| `ERR_NAME_NOT_RESOLVED` | DNS records not added, or not propagated yet. `nslookup www.sawonstore.in` to check. |
| Certificate error | The `TXT` verification record is missing or wrong. Certificates are not issued without it. |
| "Connection is private" / cert pending | Still provisioning. Check Hosting → your domain. |
| Sign-in bounces back with an error | Domain missing from **Authentication → Authorized domains**. |
| Sign-in works on `web.app` but not the new domain | Same as above — the authorized-domains list is per-domain. |
| `www` loads, bare domain does not | Apex not added, or the redirect is not configured. |