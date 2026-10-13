/**
 * Admin role definitions and the permission matrix.
 *
 * This mirrors the matrix agreed for the project:
 *
 *   Permission              Admin   Manager   Staff
 *   Add product             yes     yes       yes
 *   Change MRP              yes     approve   no
 *   View orders             yes     yes       yes
 *   Issue refund            yes     approve   no
 *   Manage staff           yes     limited   no
 *   Financial reports      yes     limited   no
 *
 * Every permission is a plain boolean so a Super Admin can toggle it at
 * runtime (persisted in the store) rather than it being hard-coded in the UI.
 */

export const PERMISSIONS = [
  { id: 'product.view', label: 'View products', group: 'Products' },
  { id: 'product.create', label: 'Add product', group: 'Products' },
  { id: 'product.edit', label: 'Edit product', group: 'Products' },
  { id: 'product.archive', label: 'Archive / delete product', group: 'Products' },
  { id: 'product.pricing.edit', label: 'Change selling price', group: 'Products' },
  { id: 'product.mrp.edit', label: 'Change MRP', group: 'Products' },
  { id: 'product.cost.edit', label: 'Change purchase price', group: 'Products' },
  { id: 'stock.view', label: 'View stock', group: 'Inventory' },
  { id: 'stock.adjust', label: 'Adjust stock', group: 'Inventory' },
  { id: 'order.view', label: 'View orders', group: 'Orders' },
  { id: 'order.update', label: 'Update order status', group: 'Orders' },
  { id: 'order.cancel', label: 'Cancel order', group: 'Orders' },
  { id: 'refund.issue', label: 'Issue refund', group: 'Finance' },
  { id: 'refund.approve', label: 'Approve refund', group: 'Finance' },
  { id: 'pricing.approve', label: 'Approve price changes', group: 'Pricing' },
  { id: 'discount.manage', label: 'Manage discounts & coupons', group: 'Pricing' },
  { id: 'report.view', label: 'View reports', group: 'Reports' },
  { id: 'report.financial', label: 'Financial reports', group: 'Reports' },
  { id: 'staff.view', label: 'View staff', group: 'Staff' },
  { id: 'staff.manage', label: 'Manage staff', group: 'Staff' },
  { id: 'staff.salary', label: 'View salary records', group: 'Staff' },
  { id: 'settings.edit', label: 'Edit site settings', group: 'System' },
  { id: 'security.view', label: 'View audit log', group: 'System' },
  { id: 'security.manage', label: 'Manage security', group: 'System' },
];

/** How a role satisfies a permission. */
export const GRANT = {
  YES: 'yes',
  APPROVAL: 'approval',
  LIMITED: 'limited',
  NO: 'no',
};

export const ROLES = {
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Full access, including staff management and security.',
    color: 'blue',
  },
  manager: {
    id: 'manager',
    label: 'Manager',
    description: 'Operational access. Price and refund changes need approval.',
    color: 'violet',
  },
  staff: {
    id: 'staff',
    label: 'Staff',
    description: 'Day-to-day order and product handling. No pricing or refunds.',
    color: 'green',
  },
};

/** Default matrix, mirroring the table above. */
const DEFAULTS = {
  admin: Object.fromEntries(PERMISSIONS.map((p) => [p.id, GRANT.YES])),

  manager: {
    'product.view': GRANT.YES,
    'product.create': GRANT.YES,
    'product.edit': GRANT.YES,
    'product.archive': GRANT.NO,
    'product.pricing.edit': GRANT.YES,
    'product.mrp.edit': GRANT.APPROVAL,
    'product.cost.edit': GRANT.NO,
    'stock.view': GRANT.YES,
    'stock.adjust': GRANT.LIMITED,
    'order.view': GRANT.YES,
    'order.update': GRANT.YES,
    'order.cancel': GRANT.APPROVAL,
    'refund.issue': GRANT.APPROVAL,
    'refund.approve': GRANT.YES,
    'pricing.approve': GRANT.YES,
    'discount.manage': GRANT.LIMITED,
    'report.view': GRANT.YES,
    'report.financial': GRANT.LIMITED,
    'staff.view': GRANT.LIMITED,
    'staff.manage': GRANT.NO,
    'staff.salary': GRANT.NO,
    'settings.edit': GRANT.NO,
    'security.view': GRANT.NO,
    'security.manage': GRANT.NO,
  },

  staff: {
    'product.view': GRANT.YES,
    'product.create': GRANT.YES,
    'product.edit': GRANT.LIMITED,
    'product.archive': GRANT.NO,
    'product.pricing.edit': GRANT.NO,
    'product.mrp.edit': GRANT.NO,
    'product.cost.edit': GRANT.NO,
    'stock.view': GRANT.YES,
    'stock.adjust': GRANT.NO,
    'order.view': GRANT.YES,
    'order.update': GRANT.YES,
    'order.cancel': GRANT.NO,
    'refund.issue': GRANT.NO,
    'refund.approve': GRANT.NO,
    'pricing.approve': GRANT.NO,
    'discount.manage': GRANT.NO,
    'report.view': GRANT.LIMITED,
    'report.financial': GRANT.NO,
    'staff.view': GRANT.NO,
    'staff.manage': GRANT.NO,
    'staff.salary': GRANT.NO,
    'settings.edit': GRANT.NO,
    'security.view': GRANT.NO,
    'security.manage': GRANT.NO,
  },
};

/**
 * Effective permission for a role.
 * Super Admins bypass everything — the matrix is advisory for them.
 */
export function can(role, permission, overrides = {}) {
  if (role === 'superadmin') return GRANT.YES;

  const key = `${role}.${permission}`;
  if (overrides && Object.hasOwn(overrides, key)) return overrides[key];

  return DEFAULTS[role]?.[permission] ?? GRANT.NO;
}

export const defaultMatrix = () => structuredClone(DEFAULTS);