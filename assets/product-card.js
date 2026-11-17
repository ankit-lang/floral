/**
 * Floral India - Product Card Interaction & Filtering System
 * Extracted from snippets/product-card.liquid for optimal caching & high-performance page loads.
 */

// --- Inline Add-to-Cart handler (works on every card click immediately) -------
window.handleProductCardAddToCart = window.handleProductCardAddToCart || function(btn) {
  if (!btn || btn.disabled) return;
  const form = btn.closest('.card-ajax-form');
  if (!form) return;
  const variantId = form.dataset.variantId;
  if (!variantId) return;

  btn.disabled = true;
  const btnText = btn.querySelector('.btn-text');
  const origText = btnText ? btnText.textContent : 'Add to Cart';
  if (btnText) btnText.textContent = 'Adding...';

  const isInternational = (localStorage.getItem('delivery_mode') || 'india') === 'international';
  
  let properties = {};
  if (isInternational) {
    properties['_For International Delivery'] = 'True';
    properties['Country'] = localStorage.getItem('user_country') || 'International';
  } else {
    const city = localStorage.getItem('user_city');
    const pincode = localStorage.getItem('user_pincode');
    if (city) properties['City'] = city;
    if (pincode) properties['_Pincode'] = pincode;
  }

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      items: [{ 
        id: parseInt(variantId, 10), 
        quantity: 1,
        properties: properties
      }] 
    })
  })
  .then(r => {
    if (!r.ok) {
       return r.json().then(err => { throw new Error(err.description || 'Could not add to cart'); });
    }
    return r.json();
  })
  .then(() => {
    window.location.href = '/cart';
  })
  .catch((err) => {
    btn.disabled = false;
    if (btnText) btnText.textContent = origText;
    
    let errorDiv = form.querySelector('.card-error-msg');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'card-error-msg text-red-600 text-[10px] font-bold mt-1 text-center leading-tight';
      form.appendChild(errorDiv);
    }
    errorDiv.textContent = '⚠️ ' + err.message;
    
    setTimeout(() => { if (errorDiv) errorDiv.remove(); }, 4000);
  });
};

// --- Global product card logic (runs once per page) --------------------------
if (!window.__productCardGlobalScriptLoaded) {
  window.__productCardGlobalScriptLoaded = true;

  (function() {
    let pincodeMapData = null;

    // -- Cart count helper ----------------------------------------------
    function updateCartCountHeader() {
      fetch('/cart.js')
        .then(r => r.json())
        .then(cart => {
          let realCount = 0;
          if (cart.items) {
             cart.items.forEach(function(item) {
               if (item.handle !== 'peak-season-delivery-surcharge' && item.handle !== 'international-delivery-charge') {
                 realCount += item.quantity;
               }
             });
          } else {
             realCount = cart.item_count;
          }
          const badge = document.getElementById('cart-count-badge');
          if (badge) badge.textContent = realCount;
          document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = realCount);
        })
        .catch(() => {});
    }

    function syncCardQuantitiesWithCart() {
      fetch('/cart.js')
        .then(r => r.json())
        .then(cart => {
          document.querySelectorAll('.card-ajax-form').forEach(form => {
            const variantId = parseInt(form.dataset.variantId, 10);
            const productId = parseInt(form.dataset.productId, 10);
            const addBtn = form.querySelector('.card-add-to-cart-btn');
            const qtyWrapper = form.querySelector('.card-qty-wrapper');
            const qtyText = form.querySelector('.card-qty-count');
            const item = (cart.items || []).find(i => i.product_id === productId || i.variant_id === variantId);
            if (item && item.quantity > 0) {
              if (addBtn) addBtn.classList.add('hidden');
              if (qtyWrapper) qtyWrapper.classList.remove('hidden');
              if (qtyText) qtyText.textContent = item.quantity + ' in Cart';
              form.dataset.currentQty = item.quantity;
            } else {
              if (addBtn) addBtn.classList.remove('hidden');
              if (qtyWrapper) qtyWrapper.classList.add('hidden');
              form.dataset.currentQty = 0;
            }
          });
        })
        .catch(() => {});
    }

    function setFormQtyUI(form, qty) {
      const addBtn = form.querySelector('.card-add-to-cart-btn');
      const qtyWrapper = form.querySelector('.card-qty-wrapper');
      const qtyText = form.querySelector('.card-qty-count');
      form.dataset.currentQty = qty;
      if (qty > 0) {
        if (addBtn) addBtn.classList.add('hidden');
        if (qtyWrapper) qtyWrapper.classList.remove('hidden');
        if (qtyText) qtyText.textContent = qty + ' in Cart';
      } else {
        if (addBtn) addBtn.classList.remove('hidden');
        if (qtyWrapper) qtyWrapper.classList.add('hidden');
      }
    }

    function optimisticChangeHeaderCartCount(delta) {
      const badge = document.getElementById('cart-count-badge');
      if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent || '0', 10) + delta);
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = Math.max(0, parseInt(el.textContent || '0', 10) + delta);
      });
    }

    // -- Click delegation for +/- quantity buttons --------------------------
    if (!window.__productCardClickHandlersBound) {
      window.__productCardClickHandlersBound = true;

      document.addEventListener('click', function(e) {
        const addBtn = e.target.closest('.card-add-to-cart-btn');
        const minusBtn = e.target.closest('.card-qty-minus');
        const plusBtn = e.target.closest('.card-qty-plus');

        if (addBtn && !addBtn.disabled) {
          e.preventDefault();
          e.stopPropagation();
          window.handleProductCardAddToCart(addBtn);
        }

        if (plusBtn) {
          e.preventDefault();
          e.stopPropagation();
          const form = plusBtn.closest('.card-ajax-form');
          if (!form) return;
          const variantId = parseInt(form.dataset.variantId, 10);
          const currentQty = parseInt(form.dataset.currentQty || '1', 10);
          const newQty = currentQty + 1;
          setFormQtyUI(form, newQty);
          optimisticChangeHeaderCartCount(1);
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: String(variantId), quantity: newQty })
          }).then(r => r.json()).then(() => updateCartCountHeader()).catch(() => syncCardQuantitiesWithCart());
        }

        if (minusBtn) {
          e.preventDefault();
          e.stopPropagation();
          const form = minusBtn.closest('.card-ajax-form');
          if (!form) return;
          const variantId = parseInt(form.dataset.variantId, 10);
          const currentQty = parseInt(form.dataset.currentQty || '1', 10);
          const newQty = Math.max(0, currentQty - 1);
          setFormQtyUI(form, newQty);
          optimisticChangeHeaderCartCount(-1);
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: String(variantId), quantity: newQty })
          }).then(r => r.json()).then(() => updateCartCountHeader()).catch(() => syncCardQuantitiesWithCart());
        }
      });
    }

    // -- Cookie helper --------------------------------------------------
    function getCardCookie(name) {
      let nameEQ = name + '=';
      let ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
      }
      return null;
    }

    function getCookieVal(name) {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
    }

    function normalizeTier(str) {
      if (!str) return '';
      let s = str.trim().toLowerCase().replace('tier:', '');
      s = s.replace(/\s+/g, '-');
      if (s === 'tier1') s = 'tier-1';
      if (s === 'tier2') s = 'tier-2';
      if (s === 'tier3') s = 'tier-3';
      return s;
    }

    // -- Tier / pincode logic -----------------------------------------------
    async function getOrFetchUserTier() {
      let userPincode = getCardCookie('user_pincode') || localStorage.getItem('user_pincode') || '110001';
      let cachedTier = getCardCookie('user_tier') || localStorage.getItem('user_tier');
      let cachedPincode = localStorage.getItem('cached_tier_pincode');

      // Fast-path cache: if user tier is already known for current pincode, avoid network fetch!
      if (cachedTier && cachedPincode === userPincode) {
        return normalizeTier(cachedTier);
      }

      if (!pincodeMapData) {
        try {
          const mapUrl = window.__pincodesTierMapUrl || '/assets/pincodes_tier_map.json';
          const res = await fetch(mapUrl);
          pincodeMapData = await res.json();
        } catch(e) {}
      }
      let userTier = cachedTier;
      if (pincodeMapData && pincodeMapData[userPincode]) {
        userTier = pincodeMapData[userPincode];
        localStorage.setItem('user_tier', userTier);
        localStorage.setItem('cached_tier_pincode', userPincode);
        document.cookie = 'user_tier=' + encodeURIComponent(userTier) + '; path=/; max-age=31536000; SameSite=Lax';
      } else if (!userTier) {
        userTier = 'Tier-1';
      }
      return normalizeTier(userTier || 'Tier-1');
    }

    async function filterCards() {
      const userTier = await getOrFetchUserTier();

      document.querySelectorAll('.product-card[data-tiers]').forEach(card => {
        const rawTags = card.dataset.tiers || '';
        const tags = rawTags.split(',').map(t => t.trim());
        const allowedTiers = tags.map(normalizeTier).filter(t => t.startsWith('tier-'));
        if (allowedTiers.length === 0 || allowedTiers.includes('tier-all')) {
          delete card.dataset.tierBlocked;
        } else {
          if (!allowedTiers.includes(userTier)) {
            card.dataset.tierBlocked = 'true';
          } else {
            delete card.dataset.tierBlocked;
          }
        }
      });

      document.querySelectorAll('.tier-product-grid').forEach(grid => {
        const limit = grid.dataset.limit ? parseInt(grid.dataset.limit, 10) : 9999;
        let visibleCount = 0;
        grid.querySelectorAll('.product-card[data-tiers]').forEach(card => {
          const wrapper = (card.parentElement && card.parentElement !== grid) ? card.parentElement : card;
          const isAllowed = !card.dataset.tierBlocked;
          if (isAllowed && visibleCount < limit) {
            visibleCount++;
            card.style.removeProperty('display');
            card.classList.remove('hidden');
            if (wrapper !== card) { wrapper.style.removeProperty('display'); wrapper.classList.remove('hidden'); }
          } else {
            card.style.setProperty('display', 'none', 'important');
            card.classList.add('hidden');
            if (wrapper !== card) { wrapper.style.setProperty('display', 'none', 'important'); wrapper.classList.add('hidden'); }
          }
        });
      });

      document.querySelectorAll('.product-card[data-tiers]').forEach(card => {
        if (card.closest('.tier-product-grid')) return;
        const wrapper = (card.parentElement && card.parentElement !== document.body && card.parentElement.children.length === 1) ? card.parentElement : card;
        const isAllowed = !card.dataset.tierBlocked;
        if (!isAllowed) {
          card.style.setProperty('display', 'none', 'important');
          card.classList.add('hidden');
          if (wrapper !== card) { wrapper.style.setProperty('display', 'none', 'important'); wrapper.classList.add('hidden'); }
        } else {
          card.style.removeProperty('display');
          card.classList.remove('hidden');
          if (wrapper !== card) { wrapper.style.removeProperty('display'); wrapper.classList.remove('hidden'); }
        }
      });

      syncDeliveryModeCards();
    }

    // -- Load remaining collection pages (international mode) ---------------
    async function loadAllCollectionPages(grid) {
      if (grid.dataset.allPagesLoading || grid.dataset.allPagesLoaded) return;
      const total = parseInt(grid.dataset.totalPages, 10) || 1;
      const current = parseInt(grid.dataset.currentPage, 10) || 1;
      const sectionId = grid.dataset.sectionId;
      if (total <= 1 || !sectionId) { grid.dataset.allPagesLoaded = 'true'; return; }
      grid.dataset.allPagesLoading = 'true';

      const fetchPage = async (page) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        url.searchParams.set('section_id', sectionId);
        const res = await fetch(url.toString(), { credentials: 'same-origin' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const g = doc.getElementById('collection-product-grid');
        return g ? Array.from(g.children).filter(el => el.querySelector('.product-card')) : [];
      };

      try {
        const pages = [];
        for (let p = 1; p <= total; p++) if (p !== current) pages.push(p);
        const results = await Promise.all(pages.map(fetchPage));
        const firstExisting = grid.firstElementChild;
        pages.forEach((p, i) => {
          results[i].forEach(el => {
            el.setAttribute('data-extra-page', p);
            if (p < current && firstExisting) grid.insertBefore(el, firstExisting);
            else grid.appendChild(el);
          });
        });
        grid.dataset.allPagesLoaded = 'true';
      } catch (err) {
        console.warn('[product-card] Could not load remaining collection pages:', err);
      } finally {
        delete grid.dataset.allPagesLoading;
      }
      if (grid.dataset.allPagesLoaded) {
        filterCards();
        syncCardQuantitiesWithCart();
      }
    }

    // -- Delivery mode filtering --------------------------------------------
    function syncDeliveryModeCards(eventDetail) {
      const mode = (eventDetail && eventDetail.mode) ? eventDetail.mode : (localStorage.getItem('delivery_mode') || getCookieVal('delivery_mode') || 'india');
      const userCountry = ((eventDetail && eventDetail.country) ? eventDetail.country : (localStorage.getItem('user_country') || getCookieVal('user_country') || '')).toLowerCase().trim();
      const userCountryCode = ((eventDetail && eventDetail.countryCode) ? eventDetail.countryCode : (localStorage.getItem('user_country_code') || getCookieVal('user_country_code') || '')).toLowerCase().trim();
      const userLocality = ((eventDetail && eventDetail.locality) ? eventDetail.locality : (localStorage.getItem('user_intl_locality') || getCookieVal('user_intl_locality') || '')).toLowerCase().trim();

      const isUsaActive = mode === 'international' && (userCountry.includes('usa') || userCountry.includes('united states') || userCountry === 'us' || userCountryCode === 'us' || userCountryCode === 'usa');
      const isLondonActive = mode === 'international' && (userCountry.includes('london') || userCountry.includes('united kingdom') || userCountry === 'uk' || userCountryCode === 'gb' || userCountryCode === 'uk');
      const isUaeActive = mode === 'international' && (userCountry.includes('uae') || userCountry.includes('dubai') || userCountryCode === 'ae');
      const isCanadaActive = mode === 'international' && (userCountry.includes('canada') || userCountryCode === 'ca');
      const isAustraliaActive = mode === 'international' && (userCountry.includes('australia') || userCountryCode === 'au');
      const savedCity = (localStorage.getItem('user_city') || getCookieVal('user_city') || '').toLowerCase().trim();
      const allowedMetroCities = ['delhi', 'new delhi', 'noida', 'greater noida', 'gautam buddha nagar', 'gurgaon', 'gurugram', 'faridabad', 'mumbai', 'kolkata', 'pune', 'bangalore', 'bengaluru'];

      document.querySelectorAll('.product-card').forEach(card => {
        const isEligible = card.dataset.intlEligible === 'true';
        const cardTagsRaw = (card.dataset.tags || '').toLowerCase();
        const cardTagsList = cardTagsRaw.split(',').map(t => t.trim());
        const cardTitle = (card.dataset.title || '').toLowerCase();

        const isCarltonLondon = cardTitle.includes('carlton london') || cardTagsRaw.includes('carlton london');
        const isDomesticOnly = card.dataset.domesticOnly === 'true' || isCarltonLondon || cardTagsList.includes('domestic') || cardTagsList.includes('domestic only') || cardTagsList.includes('domestic-only') || cardTagsList.includes('india only') || cardTagsList.includes('india-only');

        const cleanUkTags = cardTagsList.filter(t => !t.includes('carlton london'));
        const isLondonProd = !isDomesticOnly && (card.dataset.isLondon === 'true' || cleanUkTags.includes('london') || cleanUkTags.includes('uk') || (cardTitle.includes('london') && !isCarltonLondon));
        const isUsaProd = !isDomesticOnly && (card.dataset.isUsa === 'true' || cardTagsList.includes('usa') || cardTagsList.includes('us') || cardTagsList.includes('united states') || cardTitle.includes('usa'));
        const isUaeProd = !isDomesticOnly && (cardTagsList.includes('uae') || cardTagsList.includes('dubai') || cardTagsList.includes('ae'));
        const isCanadaProd = !isDomesticOnly && (cardTagsList.includes('canada') || cardTagsList.includes('ca') || cardTitle.includes('canada'));
        const isAusProd = !isDomesticOnly && (cardTagsList.includes('australia') || cardTagsList.includes('au'));
        const isExoticProd = card.dataset.isExotic === 'true' || cardTagsRaw.includes('exotic');

        const intlBadge = card.querySelector('.intl-badge');
        const indiaOnlyBadge = card.querySelector('.intl-badge-india-only');
        const btn = card.querySelector('.card-add-to-cart-btn');
        const parentWrapper = card.closest('li') || card.closest('.grid__item') || card.closest('.swiper-slide') || card.closest('.anim-scale') || (card.parentElement && card.parentElement !== document.body ? card.parentElement : null);

        if (mode === 'international') {
          let showCard = false;
          if (isDomesticOnly) showCard = false;
          else if (isUsaActive) showCard = isUsaProd;
          else if (isLondonActive) showCard = isLondonProd;
          else if (isUaeActive) showCard = isUaeProd;
          else if (isCanadaActive) showCard = isCanadaProd;
          else if (isAustraliaActive) showCard = isAusProd;
          else {
            const matchesCountryTag = (userCountry && cardTagsList.includes(userCountry)) || (userCountryCode && cardTagsList.includes(userCountryCode));
            showCard = isEligible && (matchesCountryTag || (!isUsaProd && !isLondonProd && !isUaeProd && !isCanadaProd && !isAusProd));
          }

          if (showCard) {
            card.style.removeProperty('display');
            card.classList.remove('hidden');
            if (parentWrapper) { parentWrapper.style.removeProperty('display'); parentWrapper.classList.remove('hidden'); }
            if (intlBadge) intlBadge.classList.remove('hidden');
            if (indiaOnlyBadge) indiaOnlyBadge.classList.add('hidden');
            if (btn) btn.disabled = false;
          } else {
            card.style.setProperty('display', 'none', 'important');
            card.classList.add('hidden');
            if (parentWrapper) { parentWrapper.style.setProperty('display', 'none', 'important'); parentWrapper.classList.add('hidden'); }
          }
        } else {
          const isCountrySpecific = isLondonProd || isUsaProd || isUaeProd || isCanadaProd || isAusProd;
          
          let hideCard = isCountrySpecific;
          if (isExoticProd && savedCity) {
            if (!allowedMetroCities.some(c => savedCity.includes(c))) {
              hideCard = true;
            }
          }

          if (hideCard) {
            card.style.setProperty('display', 'none', 'important');
            card.classList.add('hidden');
            if (parentWrapper) { parentWrapper.style.setProperty('display', 'none', 'important'); parentWrapper.classList.add('hidden'); }
          } else {
            card.style.removeProperty('display');
            card.classList.remove('hidden');
            if (parentWrapper) { parentWrapper.style.removeProperty('display'); parentWrapper.classList.remove('hidden'); }
            if (isEligible) {
              if (intlBadge) intlBadge.classList.remove('hidden');
              if (indiaOnlyBadge) indiaOnlyBadge.classList.add('hidden');
            } else {
              if (intlBadge) intlBadge.classList.add('hidden');
              if (indiaOnlyBadge) indiaOnlyBadge.classList.remove('hidden');
            }
          }
        }
      });

      // Hide empty sections
      document.querySelectorAll('.filtered-grid-section, .plant-grid-section, section').forEach(sec => {
        const gridContainer = sec.querySelector('.product-slider, .product-grid, .tier-product-grid');
        if (!gridContainer) return;
        const visibleCards = Array.from(gridContainer.querySelectorAll('.product-card')).filter(card => {
          const wrapper = (card.parentElement && card.parentElement !== gridContainer) ? card.parentElement : card;
          return !card.classList.contains('hidden') && card.style.display !== 'none' && !wrapper.classList.contains('hidden') && wrapper.style.display !== 'none';
        });
        if (visibleCards.length === 0) {
          sec.style.setProperty('display', 'none', 'important');
          sec.classList.add('hidden');
        } else {
          sec.style.removeProperty('display');
          sec.classList.remove('hidden');
        }
      });

      // Country filtering is client-side, so in international mode every page of the
      // collection must be on screen; otherwise country products on later pages are lost.
      const colGrid = document.getElementById('collection-product-grid');
      if (colGrid) {
        const pager = document.getElementById('collection-pagination');
        const isIntl = mode === 'international';
        if (isIntl) loadAllCollectionPages(colGrid);
        if (pager) pager.style.display = (isIntl && colGrid.dataset.allPagesLoaded === 'true') ? 'none' : '';
        if (!isIntl) {
          colGrid.querySelectorAll('[data-extra-page]').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
            el.classList.add('hidden');
          });
        }
      }

      // Handle collection empty state
      if (colGrid) {
        let emptyNotice = document.getElementById('intl-collection-empty-notice');
        if (mode === 'international') {
          const visibleCards = colGrid.querySelectorAll('.product-card:not(.hidden)');
          const totalCards = colGrid.querySelectorAll('.product-card');
          if (totalCards.length > 0 && visibleCards.length === 0) {
            if (!emptyNotice) {
              emptyNotice = document.createElement('div');
              emptyNotice.id = 'intl-collection-empty-notice';
              emptyNotice.className = 'w-full my-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-full';
              colGrid.appendChild(emptyNotice);
            }
            emptyNotice.classList.remove('hidden');
            emptyNotice.style.display = '';
            const countryDisplay = (userCountry ? userCountry.toUpperCase() : 'INTERNATIONAL');
            emptyNotice.innerHTML = '<div class="text-3xl mb-2">-</div>' +
              '<h3 class="text-base font-bold text-amber-900 mb-1">Products for ' + countryDisplay + ' Delivery</h3>' +
              '<p class="text-xs text-amber-700 mb-4 max-w-md mx-auto">Showing items tagged for ' + countryDisplay + ' delivery. Change destination to view other products.</p>' +
              '<button type="button" onclick="openPincodeModal(\'international\')" class="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer">Change Destination -</button>';
          } else if (emptyNotice) {
            emptyNotice.classList.add('hidden');
            emptyNotice.style.display = 'none';
          }
        } else if (emptyNotice) {
          emptyNotice.classList.add('hidden');
          emptyNotice.style.display = 'none';
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        filterCards();
        syncDeliveryModeCards();
        syncCardQuantitiesWithCart();
      });
    } else {
      filterCards();
      syncDeliveryModeCards();
      syncCardQuantitiesWithCart();
    }
    window.addEventListener('load', syncDeliveryModeCards);
    document.addEventListener('deliveryModeChanged', (e) => syncDeliveryModeCards(e.detail));
    window.addEventListener('pincodeTierUpdated', filterCards);
    window.addEventListener('pincodeUpdated', filterCards);
  })();
}
