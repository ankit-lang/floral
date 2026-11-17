/**
 * Floral India — Cart Expiry System
 *
 * Items are auto-removed from the Shopify cart after EXPIRY_MS (4 hours).
 * Timestamps are stored in localStorage keyed by variant ID.
 *
 * Flow:
 *  1. On add-to-cart → record timestamp in localStorage
 *  2. On every page load → scan cart via AJAX, remove expired items
 *  3. Show a dismissible toast banner if items were removed
 */
(function () {
  'use strict';

  const EXPIRY_MS   = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const STORAGE_KEY = 'floral_cart_timestamps';

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function getTimestamps() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveTimestamps(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    catch (e) {}
  }

  function recordItem(variantId) {
    const ts = getTimestamps();
    if (!ts[variantId]) {              // only set once (don't reset on re-add)
      ts[variantId] = Date.now();
      saveTimestamps(ts);
    }
  }

  function pruneTimestamps(cartItems) {
    // Remove timestamps for items no longer in cart
    const ts = getTimestamps();
    const liveIds = new Set(cartItems.map(i => String(i.variant_id)));
    let changed = false;
    Object.keys(ts).forEach(function (id) {
      if (!liveIds.has(id)) { delete ts[id]; changed = true; }
    });
    if (changed) saveTimestamps(ts);
  }

  function getTimeRemaining(addedAt) {
    const ms  = EXPIRY_MS - (Date.now() - addedAt);
    if (ms <= 0) return null;
    const h   = Math.floor(ms / 3600000);
    const m   = Math.floor((ms % 3600000) / 60000);
    return (h > 0 ? h + 'h ' : '') + m + 'm';
  }

  // ─── Toast Banner ──────────────────────────────────────────────────────────

  function showExpiredToast(removedTitles) {
    // Disabled: do not show toast notification for reserved/expired time
    return;
  }

  // ─── Countdown badges on cart page ─────────────────────────────────────────

  function renderCountdownBadges(cartItems) {
    // Disabled: do not show notification/countdown badge for reserved for time
    return;
  }

  // ─── Core: fetch cart → remove expired items ───────────────────────────────

  function checkAndExpireCartItems() {
    const ts = getTimestamps();
    const now = Date.now();
    const isCartPage = window.location.pathname.includes('/cart');
    const ids = Object.keys(ts);

    // Skip network roundtrip on reload if no items are tracked or none are expired (unless on cart page)
    if (!isCartPage) {
      if (ids.length === 0) return;
      let hasExpired = false;
      for (let i = 0; i < ids.length; i++) {
        if ((now - ts[ids[i]]) >= EXPIRY_MS) {
          hasExpired = true;
          break;
        }
      }
      if (!hasExpired) return;
    }

    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        if (!cart.items || cart.items.length === 0) {
          saveTimestamps({});
          return;
        }

        pruneTimestamps(cart.items);
        renderCountdownBadges(cart.items);

        const ts      = getTimestamps();
        const now     = Date.now();
        const expired = cart.items.filter(function (item) {
          const addedAt = ts[String(item.variant_id)];
          return addedAt && (now - addedAt) >= EXPIRY_MS;
        });

        if (expired.length === 0) return;

        // Remove expired items one by one
        const titles   = expired.map(function (i) { return i.product_title; });
        const promises = expired.map(function (item) {
          return fetch('/cart/change.js', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: item.key, quantity: 0 })
          }).then(function (r) { return r.json(); });
        });

        Promise.all(promises).then(function () {
          // Clean up timestamps for removed items
          const updatedTs = getTimestamps();
          expired.forEach(function (item) {
            delete updatedTs[String(item.variant_id)];
          });
          saveTimestamps(updatedTs);

          // Update cart count badge in header
          fetch('/cart.js').then(function (r) { return r.json(); }).then(function (updatedCart) {
            let realCount = 0;
            if (updatedCart.items) {
               updatedCart.items.forEach(function(item) {
                 if (item.handle !== 'peak-season-delivery-surcharge' && item.handle !== 'international-delivery-charge') {
                   realCount += item.quantity;
                 }
               });
            } else {
               realCount = updatedCart.item_count;
            }
            const badge = document.getElementById('cart-count-badge');
            if (badge) badge.textContent = realCount;

            // Mobile badge
            document.querySelectorAll('[data-cart-count]').forEach(function (el) {
              el.textContent = realCount;
            });

            // If on cart page, reload to reflect removal
            if (window.location.pathname.includes('/cart')) {
              window.location.reload();
            }
          });

          showExpiredToast(titles);
        });
      })
      .catch(function (e) { console.warn('[CartExpiry] fetch error:', e); });
  }

  // ─── Intercept add-to-cart ─────────────────────────────────────────────────

  function interceptAddToCart() {
    // Listen for form submit (native add-to-cart forms)
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.getAttribute('action') && !form.getAttribute('action').includes('/cart/add')) return;

      const idInput = form.querySelector('input[name="id"]');
      if (idInput && idInput.value) {
        recordItem(idInput.value);
      }
    }, true);

    // Listen for AJAX add-to-cart (fetch/XHR intercept via custom event)
    document.addEventListener('cart:item-added', function (e) {
      if (e.detail && e.detail.variant_id) {
        recordItem(String(e.detail.variant_id));
      }
    });

    // Patch fetch to catch /cart/add.js calls
    const _fetch = window.fetch;
    window.fetch = function (url, options) {
      const urlStr = typeof url === 'string' ? url : (url && url.url) || '';
      if (urlStr.includes('/cart/add') && options && options.body) {
        try {
          const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          if (body && body.id) recordItem(String(body.id));
          if (body && Array.isArray(body.items)) {
            body.items.forEach(function(it) {
              if (it && it.id) recordItem(String(it.id));
            });
          }
        } catch (e) {}

        try {
          const mode = localStorage.getItem('delivery_mode') || 'india';
          const iso = (mode === 'india' ? 'IN' : (localStorage.getItem('user_country_code') || 'IN')).toUpperCase();
          const full = (iso === 'IN' ? 'India' : (localStorage.getItem('user_country') || iso));
          setTimeout(function() {
            _fetch('/cart/update.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attributes: { 'Delivery_Country': iso, 'Delivery Country': full } })
            }).catch(function() {});
          }, 300);
        } catch(e) {}
      }
      return _fetch.apply(this, arguments);
    };
  }

  // ─── Live countdown updater (for cart page) ────────────────────────────────

  function startLiveCountdown() {
    // Disabled: do not show reserved for time notification / countdown badges
    return;
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  function init() {
    interceptAddToCart();
    checkAndExpireCartItems();
    startLiveCountdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
