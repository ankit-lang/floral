/**
 * Floral India: per-delivery-date shipping rate (Shopify carrier-calculated shipping).
 *
 * Shopify POSTs the checkout/cart contents here and shows whatever rate we return.
 * Domestic (India): ₹450 for each distinct "Delivery Date" in the order.
 *   1 date -> ₹450, 2 dates -> ₹900, 3 dates -> ₹1,350 ...
 * Other countries: no rate from here (international keeps its weight-based rates).
 *
 * Deploy: Cloudflare Workers (see README.md in this folder).
 */

const PER_DATE_PAISE = 45000; // ₹450.00
const SERVICE_NAME = 'Standard Shipping';

function isFeeItem(item) {
  const name = String(item.name || '').toLowerCase();
  const props = item.properties || {};
  return props['_For Surcharge'] === 'True' ||
    props['_For International Delivery'] === 'True' ||
    name.includes('surcharge') ||
    name.includes('delivery charge');
}

function deliveryDateOf(item) {
  const props = item.properties || {};
  const raw = props['Delivery Date'] || props['Delivery_Date'] || props['Date'] || '';
  return String(raw).trim().slice(0, 10); // "2026-11-19"
}

export function buildRates(rate) {
  const destination = (rate && rate.destination) || {};
  if (String(destination.country || '').toUpperCase() !== 'IN') return [];

  const items = ((rate && rate.items) || []).filter(it => it.requires_shipping !== false && !isFeeItem(it));
  if (items.length === 0) return [];

  const dates = new Set();
  for (const it of items) {
    const d = deliveryDateOf(it);
    if (d) dates.add(d);
  }
  // Items without a date ship with the others; an order always has at least one delivery
  const count = Math.max(1, dates.size);

  return [{
    service_name: SERVICE_NAME,
    service_code: 'per_delivery_date',
    total_price: String(PER_DATE_PAISE * count),
    currency: (rate && rate.currency) || 'INR',
    description: count > 1 ? `${count} delivery dates × ₹450` : 'Delivery on your selected date',
  }];
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Floral India shipping rates service', { status: 200 });
    }
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const rates = buildRates(body.rate);
    return new Response(JSON.stringify({ rates }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
