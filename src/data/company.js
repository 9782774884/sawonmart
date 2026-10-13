/**
 * Registered company details.
 *
 * Kept apart from `SITE` (which holds the consumer-facing brand) because these
 * are legal/registry facts, not marketing copy. Both the footer and any future
 * invoice or Terms page should read from here so the GSTIN and addresses are
 * never typed twice.
 *
 * The GSTIN prefix "10" is the GST state code for Bihar, which is consistent
 * with the Madhubani registered office.
 */

export const COMPANY = {
  /** Legal / registered entity name. The storefront brand is SITE.name. */
  legalName: 'Sawon Store',

  gstin: '10FSRPS8895F1ZW',

  /** Official GST portal, for buyers who want to verify the tax registration. */
  gstinUrl: 'https://services.gst.gov.in/services/searchtp',

  registeredOffice: {
    label: 'Registered Office',
    address: ['Kisan Bhawan Road', 'Jaynagar', 'District - Madhubani', 'Bihar 847226'],
  },

  branchOffice: {
    label: 'Branch Office',
    address: ['Near Zero Mile Metro Station', 'Patna 800030'],
  },
};

/** Joins an address array into a single comma-separated line. */
export const addressToLine = (office) => office.address.join(', ');