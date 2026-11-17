# Floral India shipping rates (carrier-calculated)

Domestic (India) shipping = **₹450 per distinct delivery date** in the order.
International orders get no rate from here and keep their weight-based rates.
This folder is not part of the theme (see `.shopifyignore`).

To change the amount, edit `PER_DATE_PAISE` in `worker.js` and redeploy.

## 1. Deploy the service (Cloudflare Workers, free)
```
cd carrier-service
npx wrangler login
npx wrangler deploy
```
Note the URL it prints, e.g. `https://floral-shipping-rates.<account>.workers.dev`.

## 2. Get an Admin API token
Shopify admin → Settings → Apps and sales channels → Develop apps → Create an app →
Configure Admin API scopes → tick **write_shipping** (and read_shipping) → Install → copy the Admin API access token (`shpat_...`).

## 3. Register it with Shopify (once)
```
SHOP=2par4t-10.myshopify.com TOKEN=shpat_xxx \
CALLBACK_URL=https://floral-shipping-rates.<account>.workers.dev \
node register.mjs
```
If Shopify answers that carrier-calculated shipping is not enabled, ask Shopify Support to enable it.

## 4. Use it for India
Settings → Shipping and delivery → India zone → Add rate → **Carrier or app calculated** →
choose **Floral Delivery Rates** → Done. Then delete the old flat ₹450 "Standard Shipping" rate in that zone.
