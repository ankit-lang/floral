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
    // Remove existing toast
    const old = document.getElementById('cart-expiry-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-expiry-toast';
    toast.style.cssText = [
      'position:fixed',
      'top:80px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:9999',
      'max-width:460px',
      'width:calc(100% - 2rem)',
      'background:#fff',
      'border:1.5px solid #fde68a',
      'border-radius:1rem',
      'box-shadow:0 8px 32px rgba(0,0,0,0.12)',
      'padding:1rem 1.25rem',
      'display:flex',
      'align-items:flex-start',
      'gap:0.75rem',
      'font-family:Inter,system-ui,sans-serif',
      'animation:slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both',
    ].join(';');

    const listHtml = removedTitles.map(function(t) {
      return '<li style="margin:2px 0;">• ' + t + '</li>';
    }).join('');

    toast.innerHTML =
      '<div style="font-size:1.4rem;flex-shrink:0;">⏰</div>' +
      '<div style="flex:1;">' +
        '<p style="font-weight:700;color:#92400e;font-size:0.85rem;margin:0 0 4px;">Cart items expired</p>' +
        '<p style="color:#78350f;font-size:0.78rem;margin:0 0 6px;">The following items were reserved for 4 hours and have been removed:</p>' +
        '<ul style="color:#92400e;font-size:0.75rem;margin:0 0 8px;padding:0;list-style:none;">' + listHtml + '</ul>' +
        '<a href="/collections/all" style="font-size:0.75rem;font-weight:700;color:#0e7040;text-decoration:underline;">Shop again →</a>' +
      '</div>' +
      '<button id="cart-expiry-close" style="flex-shrink:0;background:none;border:none;cursor:pointer;font-size:1.1rem;color:#9ca3af;line-height:1;" aria-label="Close">×</button>';

    // Inject keyframe if not already present
    if (!document.getElementById('cart-expiry-style')) {
      const style = document.createElement('style');
      style.id = 'cart-expiry-style';
      style.textContent =
        '@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
        '.cart-expiry-countdown{font-size:0.7rem;color:#b45309;font-weight:600;margin-left:4px;}';
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    document.getElementById('cart-expiry-close').addEventListener('click', function () {
      toast.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 10000);
  }

  // ─── Countdown badges on cart page ─────────────────────────────────────────

  function renderCountdownBadges(cartItems) {
    const ts = getTimestamps();
    cartItems.forEach(function (item) {
      const id  = String(item.variant_id);
      const addedAt = ts[id];
      if (!addedAt) return;

      // Find rows by variant id data attr on cart page
      document.querySelectorAll('[data-cart-expiry-variant="' + id + '"]').forEach(function (el) {
        const remaining = getTimeRemaining(addedAt);
        if (remaining) {
          el.textContent = '⏱ Reserved for ' + remaining;
          el.style.display = '';
        } else {
          el.textContent = 'Expired';
          el.style.color = '#ef4444';
        }
      });
    });
  }

  // ─── Core: fetch cart → remove expired items ───────────────────────────────

  function checkAndExpireCartItems() {
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
                 if (item.handle !== 'peak-season-delivery-surcharge') {
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
      }
      return _fetch.apply(this, arguments);
    };
  }

  // ─── Live countdown updater (for cart page) ────────────────────────────────

  function startLiveCountdown() {
    setInterval(function () {
      const ts = getTimestamps();
      Object.keys(ts).forEach(function (id) {
        document.querySelectorAll('[data-cart-expiry-variant="' + id + '"]').forEach(function (el) {
          const remaining = getTimeRemaining(ts[id]);
          if (remaining) {
            el.textContent = '⏱ Reserved for ' + remaining;
          } else {
            el.textContent = '⚠️ Expired — removing...';
            el.style.color = '#ef4444';
          }
        });
      });
    }, 30000); // update every 30 seconds
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
