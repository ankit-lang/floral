// One-time: register the rate service with Shopify (carrier-calculated shipping).
//
// Usage:
//   SHOP=2par4t-10.myshopify.com TOKEN=shpat_xxx CALLBACK_URL=https://floral-shipping-rates.<you>.workers.dev node register.mjs
//
// TOKEN = Admin API access token of a custom app with the "write_shipping" scope.
// Run with LIST=1 to just list existing carrier services.

// Or, for an app from the Dev Dashboard, pass CLIENT_ID + CLIENT_SECRET (shpss_...) instead of TOKEN;
// the script exchanges them for a short-lived token (client credentials grant).

const { SHOP, CALLBACK_URL, LIST, CLIENT_ID, CLIENT_SECRET } = process.env;
let { TOKEN } = process.env;

if (!SHOP || (!TOKEN && !(CLIENT_ID && CLIENT_SECRET))) {
  console.error('Set SHOP and either TOKEN, or CLIENT_ID + CLIENT_SECRET (and CALLBACK_URL to register).');
  process.exit(1);
}

if (!TOKEN) {
  const tokenRes = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const tokenJson = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error('Could not get an access token:', tokenRes.status, JSON.stringify(tokenJson));
    process.exit(1);
  }
  TOKEN = tokenJson.access_token;
  console.log('Got access token, scopes:', tokenJson.scope);
}

const API = `https://${SHOP}/admin/api/2025-01/carrier_services.json`;
const headers = { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' };

const existing = await fetch(API, { headers }).then(r => r.json());
console.log('Existing carrier services:', JSON.stringify(existing, null, 2));
if (LIST) process.exit(0);

if (!CALLBACK_URL) {
  console.error('Set CALLBACK_URL to the deployed worker URL.');
  process.exit(1);
}

const name = 'Floral Delivery Rates';
const found = (existing.carrier_services || []).find(c => c.name === name);
const payload = { carrier_service: { name, callback_url: CALLBACK_URL, service_discovery: true, active: true } };

const res = found
  ? await fetch(`https://${SHOP}/admin/api/2025-01/carrier_services/${found.id}.json`, { method: 'PUT', headers, body: JSON.stringify(payload) })
  : await fetch(API, { method: 'POST', headers, body: JSON.stringify(payload) });

console.log(res.status, JSON.stringify(await res.json(), null, 2));
