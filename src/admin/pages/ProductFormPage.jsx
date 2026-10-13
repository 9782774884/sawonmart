import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  Alert,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Panel,
  Select,
  StatusPill,
  Switch,
  Textarea,
} from '../components/AdminUI.jsx';
import { useAdmin, admin } from '../data/store.js';
import { GST_RATES, SUBCATEGORIES } from '../data/seed.js';
import { can } from '../data/permissions.js';
import { cx, discountPercent, formatPrice } from '../../utils/format.js';

/** Current session role. The admin panel ships as Super Admin. */
const ROLE = 'superadmin';

const BLANK = {
  title: '', brand: '', category: 'mobiles', subcategory: SUBCATEGORIES.mobiles[0],
  description: '', sku: '', hsn: '', barcode: '', image: 'products/phone-1.svg',
  videoUrl: '',
  mrp: 0, price: 0, purchasePrice: 0, wholesalePrice: 0, distributorPrice: 0,
  gstRate: 18, weightKg: 0.5, dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
  variants: { size: [], color: [], capacity: [] },
  stock: 0, reorderLevel: 10, minOrderQty: 1, maxOrderQty: 10, lowStockThreshold: 10,
  status: 'active', featured: false, newArrival: false, archived: false,
  highlights: [], delivery: 'Tomorrow by 8 PM',
  seo: { title: '', description: '', keywords: '', slug: '' },
};

/** Generates a barcode as a real EAN-13 code (mod-10 check digit). */
function ean13(base12) {
  const digits = base12.padEnd(12, '0').slice(0, 12).split('').map(Number);
  const sum = digits.reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0);
  return base12.padEnd(12, '0').slice(0, 12) + String((10 - (sum % 10)) % 10);
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAdmin();

  // "/admin/products/new" is a *static* route segment, so `id` is undefined
  // there rather than the string "new". Both mean "create a new product".
  const isNew = id === undefined || id === 'new';

  const existing = useMemo(() => state.products.find((p) => p.id === id), [state.products, id]);

  const [form, setForm] = useState(() => existing ?? BLANK);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [variantText, setVariantText] = useState({
    size: (existing?.variants?.size ?? []).join(', '),
    capacity: (existing?.variants?.capacity ?? []).join(', '),
  });
  const barcodeRef = useRef(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setDeep = (path, value) =>
    setForm((f) => {
      const next = { ...f };
      let cur = next;
      const keys = path.split('.');
      keys.slice(0, -1).forEach((k) => {
        cur[k] = { ...cur[k] };
        cur = cur[k];
      });
      cur[keys.at(-1)] = value;
      return next;
    });

  /* ---- permissions drive which fields are editable ---- */
  const canMrp = can(ROLE, 'product.mrp.edit') === 'yes';
  const canPrice = can(ROLE, 'product.pricing.edit') === 'yes';
  const canCost = can(ROLE, 'product.cost.edit') === 'yes';
  const canArchive = can(ROLE, 'product.archive') === 'yes';

  /* ---- derived pricing guidance ---- */
  const margin = form.purchasePrice > 0 && form.price > 0
    ? ((form.price - form.purchasePrice) / form.price) * 100
    : null;
  const off = form.mrp > 0 ? discountPercent(form.price, form.mrp) : 0;
  const lowMargin = margin !== null && margin < 15;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Product name is required.';
    if (!form.brand.trim()) e.brand = 'Brand is required.';
    if (!form.sku.trim()) e.sku = 'SKU is required.';
    if (!/^\d{4,8}$/.test(form.hsn)) e.hsn = 'HSN must be 4–8 digits (e.g. 85171290).';
    if (form.mrp <= 0) e.mrp = 'MRP must be greater than zero.';
    if (form.price <= 0) e.price = 'Selling price must be greater than zero.';
    if (form.price > form.mrp) e.price = 'Selling price cannot exceed MRP.';
    if (form.purchasePrice > form.price) e.purchasePrice = 'Purchase price cannot exceed the selling price.';
    if (form.stock < 0) e.stock = 'Stock cannot be negative.';
    if (form.maxOrderQty < form.minOrderQty) e.maxOrderQty = 'Maximum must be at least the minimum.';
    if (!form.image.trim()) e.image = 'Choose an image.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      document.querySelector('.adm-field__msg.is-error')?.scrollIntoView({ block: 'center' });
      return;
    }

    const record = {
      ...form,
      // A real SKU/HSN pair must be unique, so a duplicate is rejected up front.
      sku: form.sku.toUpperCase().trim(),
      hsn: form.hsn.trim(),
      id: existing?.id ?? `p-${Date.now().toString(36)}`,
      slug: form.seo.slug || form.sku.toLowerCase(),
      // Compute the secondary price tiers from the selling price unless set.
      wholesalePrice: form.wholesalePrice || Math.round(form.price * 0.94),
      distributorPrice: form.distributorPrice || Math.round(form.price * 0.88),
      variants: {
        ...form.variants,
        size: variantText.size.split(',').map((s) => s.trim()).filter(Boolean),
        capacity: variantText.capacity.split(',').map((s) => s.trim()).filter(Boolean),
      },
      seo: {
        ...form.seo,
        title: form.seo.title || `${form.title} | Buy online`,
        slug: form.seo.slug || form.sku.toLowerCase(),
      },
    };

    admin.saveProduct(record);
    setSaved(true);
    if (isNew) navigate(`/admin/products/${record.id}`, { replace: true });
    window.setTimeout(() => setSaved(false), 3500);
  };

  const generateBarcode = () => {
    const code = ean13('890' + String(Date.now()).slice(0, 9));
    set({ barcode: code });
    barcodeRef.current?.select();
  };

  if (!isNew && !existing) {
    return (
      <Panel title="Product not found">
        <p>
          No product with id <code>{id}</code>. It may have been deleted.{' '}
          <Link to="/admin/products">Back to products</Link>
        </p>
      </Panel>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Products', to: '/admin/products' }, { label: isNew ? 'Add product' : form.title || 'Edit' }]}
        title={isNew ? 'Add new product' : 'Edit product'}
        subtitle={existing ? `${existing.sku} · last updated ${existing.updatedAt ?? existing.createdAt}` : 'Complete the catalogue and pricing details.'}
        actions={
          <>
            <Link className="adm-btn adm-btn--ghost" to="/admin/products">Cancel</Link>
            <button type="submit" className="adm-btn adm-btn--primary">Save product</button>
          </>
        }
      />

      {saved ? <Alert tone="ok" title="Saved">Changes are stored locally in this browser.</Alert> : null}

      <div className="adm-form">
        {/* ------------------------------------------------ 24–27 identity */}
        <Panel title="Product details" subtitle="Items 24–27">
          <div className="adm-grid adm-grid--2 adm-grid--gap">
            <Field label="Product name" required error={errors.title} className="adm-span-2">
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} invalid={errors.title} placeholder="e.g. 5G Phone (Cosmic Black, 128 GB)" />
            </Field>

            <Field label="Brand" required error={errors.brand}>
              <Input value={form.brand} onChange={(e) => set({ brand: e.target.value })} invalid={errors.brand} list="brand-list" />
              <datalist id="brand-list">
                {['Samsung', 'Dell', 'boAt', 'Sony', 'Noise', 'Xiaomi', 'Canon', 'Nike', 'Puma', 'IFB', 'Voltas'].map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>

            <Field label="Category" required>
              <Select
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  set({ category, subcategory: SUBCATEGORIES[category][0] });
                }}
              >
                {Object.keys(SUBCATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>

            <Field label="Sub-category" required>
              <Select value={form.subcategory} onChange={(e) => set({ subcategory: e.target.value })}>
                {(SUBCATEGORIES[form.category] ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>

            <Field label="Product description" hint="Shown on the product page. Plain text." className="adm-span-2">
              <Textarea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>

            <Field label="Key highlights" hint="One per line — shown as a bullet list." className="adm-span-2">
              <Textarea
                rows={3}
                value={(form.highlights ?? []).join('\n')}
                onChange={(e) => set({ highlights: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              />
            </Field>
          </div>
        </Panel>

        {/* ------------------------------------------- 29–33 codes & media */}
        <Panel title="Codes, media & SEO" subtitle="Items 29–33, 50">
          <div className="adm-grid adm-grid--2 adm-grid--gap">
            <Field label="Product SKU" required error={errors.sku} hint="Must be unique across the catalogue.">
              <Input value={form.sku} onChange={(e) => set({ sku: e.target.value.toUpperCase() })} invalid={errors.sku} placeholder="SM-PHO-0001" />
            </Field>

            <Field label="HSN code" required error={errors.hsn} hint="6–8 digits. Mandatory on Indian GST invoices.">
              <Input value={form.hsn} onChange={(e) => set({ hsn: e.target.value.replace(/\D/g, '') })} invalid={errors.hsn} placeholder="85171290" />
            </Field>

            <Field label="Barcode" hint="EAN-13 with a valid check digit." className="adm-span-2">
              <div className="adm-inline">
                <Input ref={barcodeRef} value={form.barcode} onChange={(e) => set({ barcode: e.target.value })} />
                <button type="button" className="adm-btn adm-btn--outline" onClick={generateBarcode}>
                  Generate
                </button>
              </div>
              {form.barcode ? <Barcode value={form.barcode} /> : null}
            </Field>

            <Field label="Product image" required error={errors.image} hint="Path under /assets/images/. Keep the .svg extension for generated artwork." className="adm-span-2">
              <div className="adm-inline">
                <Input value={form.image} onChange={(e) => set({ image: e.target.value })} invalid={errors.image} />
                <img className="adm-thumb" src={`/assets/images/${form.image}`} alt="" width={54} height={54} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              </div>
            </Field>

            <Field label="Product video" hint="YouTube or Vimeo URL. Optional." className="adm-span-2">
              <Input type="url" value={form.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>

            <Field label="SEO title" hint="Defaults to the product name." className="adm-span-2">
              <Input value={form.seo.title} onChange={(e) => setDeep('seo.title', e.target.value)} placeholder="5G Phone 128GB | Buy online" />
            </Field>
            <Field label="SEO slug" className="adm-span-2">
              <Input value={form.seo.slug} onChange={(e) => setDeep('seo.slug', e.target.value)} placeholder="5g-phone-128gb" />
            </Field>
            <Field label="SEO meta description" className="adm-span-2">
              <Textarea rows={2} value={form.seo.description} onChange={(e) => setDeep('seo.description', e.target.value)} />
            </Field>
            <Field label="SEO keywords" hint="Comma separated." className="adm-span-2">
              <Input value={form.seo.keywords} onChange={(e) => setDeep('seo.keywords', e.target.value)} placeholder="samsung, mobile, 5g" />
            </Field>
          </div>
        </Panel>

        {/* ------------------------------------------------ 34–40 pricing */}
        <Panel
          title="Pricing & GST"
          subtitle="Items 34–40"
          actions={<StatusPill tone={lowMargin ? 'warn' : 'ok'}>{margin !== null ? `${margin.toFixed(1)}% margin` : 'no cost set'}</StatusPill>}
        >
          <div className="adm-grid adm-grid--3 adm-grid--gap">
            <Field label="MRP" required error={errors.mrp} hint={canMrp ? 'Inclusive of all taxes' : 'Requires approval — read only'}>
              <Input type="number" min="0" value={form.mrp} disabled={!canMrp} invalid={errors.mrp} onChange={(e) => set({ mrp: Number(e.target.value) })} />
            </Field>

            <Field label="Selling price" required error={errors.price} hint={canPrice ? `Customer pays ${formatPrice(form.price)}` : 'Read only'}>
              <Input type="number" min="0" value={form.price} disabled={!canPrice} invalid={errors.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            </Field>

            <Field label="Purchase price" error={errors.purchasePrice} hint="What you pay the supplier">
              <Input type="number" min="0" value={form.purchasePrice} disabled={!canCost} invalid={errors.purchasePrice} onChange={(e) => set({ purchasePrice: Number(e.target.value) })} />
            </Field>

            <Field label="Wholesale price" hint="Auto 94% of selling price if blank">
              <Input type="number" min="0" value={form.wholesalePrice} onChange={(e) => set({ wholesalePrice: Number(e.target.value) })} />
            </Field>

            <Field label="Distributor price" hint="Auto 88% of selling price if blank">
              <Input type="number" min="0" value={form.distributorPrice} onChange={(e) => set({ distributorPrice: Number(e.target.value) })} />
            </Field>

            <Field label="GST rate" required>
              <Select value={form.gstRate} onChange={(e) => set({ gstRate: Number(e.target.value) })}>
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </Select>
            </Field>

            <Field label="Weight (kg)">
              <Input type="number" step="0.01" min="0" value={form.weightKg} onChange={(e) => set({ weightKg: Number(e.target.value) })} />
            </Field>

            <Field label="Dimensions (cm)" className="adm-span-3" hint="Length × width × height — used for shipping labels and volumetric weight.">
              <div className="adm-inline adm-inline--3">
                <Input type="number" step="0.1" value={form.dimensions.length} aria-label="Length" onChange={(e) => setDeep('dimensions.length', Number(e.target.value))} />
                <Input type="number" step="0.1" value={form.dimensions.width} aria-label="Width" onChange={(e) => setDeep('dimensions.width', Number(e.target.value))} />
                <Input type="number" step="0.1" value={form.dimensions.height} aria-label="Height" onChange={(e) => setDeep('dimensions.height', Number(e.target.value))} />
              </div>
            </Field>
          </div>

          <dl className="adm-kv">
            <div><dt>Customer discount</dt><dd>{off}% off MRP</dd></div>
            <div><dt>Unit margin</dt><dd className={lowMargin ? 'is-bad' : undefined}>{margin !== null ? `${formatPrice(form.price - form.purchasePrice)} (${margin.toFixed(1)}%)` : '—'}</dd></div>
            <div><dt>GST per unit</dt><dd>{formatPrice((form.price * form.gstRate) / (100 + form.gstRate))}</dd></div>
            <div><dt>Value incl. GST</dt><dd>{formatPrice(form.price + (form.price * form.gstRate) / (100 + form.gstRate))}</dd></div>
          </dl>

          {lowMargin ? (
            <Alert tone="warn" title="Thin margin">
              Margin is below 15%. Check the purchase price or the selling price before publishing.
            </Alert>
          ) : null}
        </Panel>

        {/* ------------------------------------------- 42–48 variants & stock */}
        <Panel title="Variants, stock & status" subtitle="Items 42–48">
          <div className="adm-grid adm-grid--3 adm-grid--gap">
            <Field label="Sizes" hint="Comma separated. Leave blank if not applicable.">
              <Input value={variantText.size} onChange={(e) => setVariantText((v) => ({ ...v, size: e.target.value }))} placeholder="S, M, L, XL" />
            </Field>
            <Field label="Capacities" hint="Comma separated.">
              <Input value={variantText.capacity} onChange={(e) => setVariantText((v) => ({ ...v, capacity: e.target.value }))} placeholder="500 ml, 1 L" />
            </Field>
            <Field label="Colours" hint="Hex codes, comma separated." className="adm-span-3">
              <Input value={(form.variants.color ?? []).join(', ')} onChange={(e) => setDeep('variants.color', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="#12161f, #f1f3f6" />
            </Field>

            <Field label="Stock quantity" error={errors.stock}>
              <Input type="number" min="0" value={form.stock} invalid={errors.stock} onChange={(e) => set({ stock: Number(e.target.value) })} />
            </Field>
            <Field label="Reorder level" hint="Alert threshold for purchasing.">
              <Input type="number" min="0" value={form.reorderLevel} onChange={(e) => set({ reorderLevel: Number(e.target.value) })} />
            </Field>
            <Field label="Low-stock threshold">
              <Input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: Number(e.target.value) })} />
            </Field>

            <Field label="Minimum order quantity">
              <Input type="number" min="1" value={form.minOrderQty} onChange={(e) => set({ minOrderQty: Number(e.target.value) })} />
            </Field>
            <Field label="Maximum order quantity" error={errors.maxOrderQty}>
              <Input type="number" min="1" value={form.maxOrderQty} invalid={errors.maxOrderQty} onChange={(e) => set({ maxOrderQty: Number(e.target.value) })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </div>

          <div className="adm-switchrow">
            <Switch checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} label="Featured product" hint="Shown in the Featured rail on the storefront." />
            <Switch checked={form.newArrival} onChange={(e) => set({ newArrival: e.target.checked })} label="New arrival" hint="Shown with a New Arrival badge." />
            <Switch checked={form.archived} disabled={!canArchive} onChange={(e) => set({ archived: e.target.checked })} label="Archived" hint="Hidden from the storefront but kept for order history." />
          </div>
        </Panel>
      </div>

      <div className="adm-formfoot">
        <Link className="adm-btn adm-btn--ghost" to="/admin/products">Cancel</Link>
        <button type="submit" className="adm-btn adm-btn--primary">Save product</button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

/** Minimal EAN-13 barcode rendered as SVG. Not a substitute for a scanner. */
function Barcode({ value }) {
  const digits = String(value).slice(0, 13).split('').map(Number);
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const R = L.map((c) => c.split('').map((b) => (b === '1' ? '01' : '00')).join(''));
  const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

  let bits = '101';
  digits.slice(0, 6).forEach((d, i) => { bits += R[d][+(PARITY[0][i] === 'L') ? 0 : 1]; });
  bits += '01010';
  digits.slice(6, 12).forEach((d) => { bits += G[d]; });
  bits += '101';

  let x = 0;
  const bars = [];
  for (const bit of bits) {
    const w = Number(bit) === 1 ? 2 : 1;
    if (bit === '1') bars.push({ x, w });
    x += w;
  }

  return (
    <div className="adm-barcode">
      <svg viewBox={`0 0 ${x} 34`} height="52" role="img" aria-label={`Barcode ${value}`} preserveAspectRatio="none" style={{ width: '100%' }}>
        <rect width={x} height="34" fill="#fff" />
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={30} fill="#111" />
        ))}
      </svg>
      <p className="adm-barcode__num t-numeric">{value}</p>
    </div>
  );
}