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
    const form = document.querySelector('form[action*="/cart/add"]');
    if (form) {
      form.addEventListener('submit', async function(e) {
        if (!surchargeActive) return; // Proceed normally if no surcharge
        if (e.defaultPrevented) return; // Validation failed from delivery-date-picker

        e.preventDefault(); // Stop native submission

        const submitBtn = form.querySelector('[type="submit"], button[name="add"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.innerHTML = 'Adding...';
          submitBtn.disabled = true;
        }

        try {
          // Use the variant ID pre-injected by Liquid (avoids auth issues on local dev)
          const surchargeVariantId = window.__surchargeVariantId;
          if (!surchargeVariantId) {
            throw new Error('Surcharge product not found or unavailable. Please make sure the "Peak Season Delivery Surcharge" product is Active, published to Online Store, and has "Track quantity" unchecked.');
          }

          const formData = new FormData(form);
          const qty = parseInt(formData.get('quantity') || '1', 10);
          
          // Calculate the total surcharge amount (and thus quantity of 1 INR product)
          // currentVariantBasePrice is in cents/paise (e.g., 299900 = 2999 INR).
          // We convert it to standard format. Wait, if currentVariantBasePrice is 299900,
          // then (299900 / 100) = 2999. Surcharge = 2999 * 0.15 = 450.
          const basePriceRupees = currentVariantBasePrice >= 100 ? currentVariantBasePrice / 100 : currentVariantBasePrice;
          const surchargePerUnit = Math.round(basePriceRupees * (PRODUCT_SURCHARGE_PCT / 100));
          const totalSurchargeQty = surchargePerUnit * qty; 

          let props = {};
          for (let [key, value] of formData.entries()) {
             if (key.startsWith('properties[')) {
                let propName = key.replace('properties[', '').replace(']', '');
                props[propName] = value;
             }
          }
          props['_Peak Surcharge'] = 'Applied (+' + PRODUCT_SURCHARGE_PCT + '%)';

          const mainItemId = formData.get('id');

          const items = [
            {
               id: mainItemId,
               quantity: qty,
               properties: props
            }
          ];

          if (totalSurchargeQty > 0) {
            items.push({
               id: surchargeVariantId,
               quantity: totalSurchargeQty,
               properties: {
                 '_For Surcharge': 'True'
               }
            });
          }

          const addRes = await fetch(window.Shopify.routes.root + 'cart/add.js', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ items: items })
          });
          
          if (!addRes.ok) {
            let errMsg = 'Failed to add to cart';
            try {
              const errData = await addRes.json();
              errMsg = errData.description || errData.message || errMsg;
            } catch(e) {}
            throw new Error(errMsg);
          }
          window.location.href = window.Shopify.routes.root + 'cart';

        } catch (err) {
          console.error('[Surcharge Error]', err);
          alert('⚠️ Could not apply Peak Season Surcharge.\n\nError Details: ' + err.message + '\n\nIf you are the admin, please check that the "Peak Season Delivery Surcharge" product is Active, published to Online Store AND International Markets, and has "Track quantity" unchecked.');
          // Fallback: Submit form natively
          form.submit();
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
