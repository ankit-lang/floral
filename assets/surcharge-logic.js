/**
 * Floral India — Peak Season Surcharge Logic
 * 
 * Reads peak dates + surcharge percentages from Shopify theme settings
 * (injected via Liquid in the product page). Listens for delivery date changes
 * and dynamically updates the displayed price with surcharge info.
 */
(function() {
  'use strict';

  // These will be populated by Liquid in the product template
  const PEAK_DATES = window.__peakSeasonDates || [];
  const PRODUCT_SURCHARGE_PCT = window.__peakProductSurcharge || 15;
  const DELIVERY_SURCHARGE_PCT = window.__peakDeliverySurcharge || 20;

  // Store the TRUE original base price (never modified)
  let originalBasePrice = 0;
  // The current variant's base price (updated on variant change, never includes surcharge)
  let currentVariantBasePrice = 0;
  // Track whether surcharge is currently applied
  let surchargeActive = false;
  // Last selected delivery date
  let lastSelectedDate = '';

  console.log('[Surcharge] Peak dates configured:', PEAK_DATES);
  console.log('[Surcharge] Product surcharge %:', PRODUCT_SURCHARGE_PCT);

  function init() {
    // Read the original base price from the page
    const priceEl = document.getElementById('product-display-price');
    if (priceEl) {
      originalBasePrice = parseFloat(priceEl.dataset.basePrice || '0');
      currentVariantBasePrice = originalBasePrice;
      console.log('[Surcharge] Original base price:', originalBasePrice);
    }

    // Intercept form submission to add the Hidden Surcharge Product
    // Intercept form submission to add main product and any selected add-ons via AJAX
    const form = document.querySelector('form[action*="/cart/add"]');
    if (form) {
      form.addEventListener('submit', async function(e) {
        if (e.defaultPrevented) return; // Validation failed from delivery-date-picker

        e.preventDefault(); // Stop native submission to handle via AJAX

        const submitBtn = form.querySelector('[type="submit"], button[name="add"], #add-to-cart-btn');
        const crossSellBtn = document.getElementById('cross-sell-add-btn');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        const origCrossSellText = crossSellBtn ? crossSellBtn.textContent : '';

        if (submitBtn) {
          submitBtn.innerHTML = 'Adding...';
          submitBtn.disabled = true;
        }
        if (crossSellBtn) {
          crossSellBtn.textContent = 'Adding to Cart...';
          crossSellBtn.disabled = true;
        }

        try {
          const formData = new FormData(form);
          
          // Ensure Peak Surcharge property is added if active
          const isPeakActive = (typeof surchargeActive !== 'undefined' && surchargeActive && typeof PRODUCT_SURCHARGE_PCT !== 'undefined');
          
          // Ensure International Delivery property is added if active
          const isInternational = (localStorage.getItem('delivery_mode') || 'india') === 'international';

          // Extract properties for main product
          const mainProperties = {};
          for (const [key, value] of formData.entries()) {
            if (key.startsWith('properties[') && key.endsWith(']')) {
              const propName = key.slice(11, -1);
              if (!propName.startsWith('Add-on:')) {
                mainProperties[propName] = value;
              }
            }
          }

          if (isPeakActive) {
            mainProperties['_Peak Surcharge'] = 'Applied (+' + PRODUCT_SURCHARGE_PCT + '%)';
          }
          if (isInternational) {
            mainProperties['_For International Delivery'] = 'True';
          }

          const mainVariantId = parseInt(formData.get('id') || (form.querySelector('input[name="id"]') ? form.querySelector('input[name="id"]').value : ''), 10);
          const rawQty = parseInt(formData.get('quantity') || (form.querySelector('input[name="quantity"]') ? form.querySelector('input[name="quantity"]').value : '1'), 10);
          const mainQty = isNaN(rawQty) || rawQty < 1 ? 1 : rawQty;

          if (!mainVariantId || isNaN(mainVariantId)) {
            throw new Error('Please select a product option.');
          }

          // Build main product payload item
          const itemsToAdd = [
            {
              id: mainVariantId,
              quantity: mainQty,
              properties: mainProperties
            }
          ];

          // Collect any selected "Make It Extra Special" add-on products
          const addonItems = (typeof window.getSelectedCrossSellItems === 'function')
            ? window.getSelectedCrossSellItems()
            : [];

          const mainTitle = (document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : 'Main Product');
          const groupToken = 'grp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

          mainProperties['_is_main_product'] = 'true';
          mainProperties['_group_id'] = groupToken;

          addonItems.forEach(function(addon) {
            const addonProps = {};
            if (mainProperties['Delivery Date']) {
              addonProps['Delivery Date'] = mainProperties['Delivery Date'];
            }
            if (mainProperties['Delivery Time']) {
              addonProps['Delivery Time'] = mainProperties['Delivery Time'];
            }
            if (mainProperties['City']) {
              addonProps['City'] = mainProperties['City'];
            }
            if (isInternational) {
              addonProps['_For International Delivery'] = 'True';
            }
            addonProps['_Addon_For'] = mainTitle;
            addonProps['_is_addon'] = 'true';
            addonProps['_parent_title'] = mainTitle;
            addonProps['_parent_group_id'] = groupToken;
            addonProps['_parent_variant_id'] = String(mainVariantId);

            itemsToAdd.push({
              id: addon.id,
              quantity: 1,
              properties: addonProps
            });
          });

          const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) ? window.Shopify.routes.root : '/';
          const addRes = await fetch(rootUrl + 'cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ items: itemsToAdd })
          });

          if (!addRes.ok) {
            const errorData = await addRes.json();
            throw new Error(errorData.description || 'Could not add item to cart.');
          }

          // Redirect to cart on success
          window.location.href = rootUrl + 'cart';

        } catch (err) {
          console.error('[Cart Add Error]', err);
          
          if (submitBtn) {
            submitBtn.innerHTML = origText;
            submitBtn.disabled = false;
          }
          if (crossSellBtn) {
            crossSellBtn.textContent = origCrossSellText;
            crossSellBtn.disabled = false;
          }

          // Show a nice inline error message instead of an alert
          let errorDiv = document.getElementById('ajax-cart-error');
          if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'ajax-cart-error';
            errorDiv.className = 'mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center';
            form.appendChild(errorDiv);
          }
          errorDiv.innerHTML = '⚠️ ' + err.message;
        }
      });
    }

    // Listen for delivery date changes
    document.addEventListener('deliveryDateChanged', function(e) {
      const selectedDate = e.detail;
      console.log('[Surcharge] Delivery date changed to:', selectedDate);
      lastSelectedDate = selectedDate;
      handleDateChange(selectedDate);
    });

    // Listen for variant price changes (from variant tabs)
    document.addEventListener('variantPriceChanged', function(e) {
      // Always store the clean base price from the variant (no surcharge)
      currentVariantBasePrice = e.detail.price;
      console.log('[Surcharge] Variant price changed to:', currentVariantBasePrice);
      // Re-check surcharge with the new variant price
      if (lastSelectedDate) {
        handleDateChange(lastSelectedDate);
      } else {
        const currentDate = document.getElementById('selected-delivery-date');
        if (currentDate && currentDate.value) {
          handleDateChange(currentDate.value);
        }
      }
    });

    // Check if a delivery date is already selected (handles the case where
    // the date picker fires before this script initializes)
    const existingDateInput = document.getElementById('selected-delivery-date');
    if (existingDateInput && existingDateInput.value) {
      console.log('[Surcharge] Found pre-selected delivery date:', existingDateInput.value);
      lastSelectedDate = existingDateInput.value;
      handleDateChange(existingDateInput.value);
    }
  }

  function isPeakDate(dateStr) {
    if (!dateStr) return false;
    const normalized = dateStr.trim();
    const deliveryMode = localStorage.getItem('delivery_mode') || 'india';
    
    const peakMatch = PEAK_DATES.find(p => p.date === normalized);
    if (!peakMatch) {
      console.log('[Surcharge] Checking if', normalized, 'is peak date: false');
      return false;
    }

    let isMatch = false;
    if (peakMatch.region === 'ALL') isMatch = true;
    else if (deliveryMode === 'india' && peakMatch.region === 'IN') isMatch = true;
    else if (deliveryMode === 'international') {
      const intlCountry = localStorage.getItem('intl_country');
      if (peakMatch.region === 'INTL') isMatch = true;
      else if (intlCountry && peakMatch.region === intlCountry) isMatch = true;
    }
    
    console.log('[Surcharge] Checking if', normalized, 'is peak date:', isMatch, '(Mode:', deliveryMode, ', Region:', peakMatch.region, ')');
    return isMatch;
  }

  function handleDateChange(dateStr) {
    const surchargeNotice = document.getElementById('peak-surcharge-notice');
    const priceEl = document.getElementById('product-display-price');

    if (isPeakDate(dateStr)) {
      surchargeActive = true;

      // Calculate surcharge from the CLEAN base price (never from a previously surcharged price)
      const surchargeAmount = Math.round(currentVariantBasePrice * (PRODUCT_SURCHARGE_PCT / 100));
      const surchargedPrice = currentVariantBasePrice + surchargeAmount;

      console.log('[Surcharge] Applying surcharge:', currentVariantBasePrice, '+', surchargeAmount, '=', surchargedPrice);

      // Update displayed price via Currency Manager
      if (priceEl) {
        priceEl.dataset.basePrice = surchargedPrice;
        if (window.FloralCurrencyManager) {
          window.FloralCurrencyManager.updateDOM();
        } else {
          priceEl.textContent = formatMoney(surchargedPrice);
        }
      }

      // Show surcharge notice
      if (surchargeNotice) {
        surchargeNotice.innerHTML = '⚡ Peak season surcharge of ' + PRODUCT_SURCHARGE_PCT + '% applied for this delivery date.';
        surchargeNotice.classList.remove('hidden');
      }

      // No longer inject hidden input here, as it's handled in the submit interceptor
    } else {
      surchargeActive = false;

      // Remove surcharge — restore original variant base price
      console.log('[Surcharge] Removing surcharge, restoring price to:', currentVariantBasePrice);

      if (priceEl) {
        priceEl.dataset.basePrice = currentVariantBasePrice;
        if (window.FloralCurrencyManager) {
          window.FloralCurrencyManager.updateDOM();
        } else {
          priceEl.textContent = formatMoney(currentVariantBasePrice);
        }
      }
      if (surchargeNotice) {
        surchargeNotice.classList.add('hidden');
      }
    }
  }

  function formatMoney(amountInSubunits) {
    if (window.FloralCurrencyManager) {
      return window.FloralCurrencyManager.formatBasePrice(amountInSubunits);
    }
    const rupees = (amountInSubunits / 100).toFixed(2);
    return '₹' + rupees.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
