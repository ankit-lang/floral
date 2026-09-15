
  (function initCartPhoneEngine() {
    window.PhoneCountryMap = {
      'GB': { name: 'UK', iso: 'GB', dialCode: '+44', flag: '🇬🇧' },
      'IN': { name: 'India', iso: 'IN', dialCode: '+91', flag: '🇮🇳' },
      'US': { name: 'USA', iso: 'US', dialCode: '+1', flag: '🇺🇸' },
      'CA': { name: 'Canada', iso: 'CA', dialCode: '+1', flag: '🇨🇦' },
      'AE': { name: 'UAE', iso: 'AE', dialCode: '+971', flag: '🇦🇪' },
      'AU': { name: 'Australia', iso: 'AU', dialCode: '+61', flag: '🇦🇺' },
      'SG': { name: 'Singapore', iso: 'SG', dialCode: '+65', flag: '🇸🇬' },
      'DE': { name: 'Germany', iso: 'DE', dialCode: '+49', flag: '🇩🇪' },
      'FR': { name: 'France', iso: 'FR', dialCode: '+33', flag: '🇫🇷' },
      'IT': { name: 'Italy', iso: 'IT', dialCode: '+39', flag: '🇮🇹' },
      'ES': { name: 'Spain', iso: 'ES', dialCode: '+34', flag: '🇪🇸' },
      'NL': { name: 'Netherlands', iso: 'NL', dialCode: '+31', flag: '🇳🇱' },
      'NZ': { name: 'New Zealand', iso: 'NZ', dialCode: '+64', flag: '🇳🇿' },
      'IE': { name: 'Ireland', iso: 'IE', dialCode: '+353', flag: '🇮🇪' }
    };

    function resolveCountryISO(formEl, overrideISO) {
      if (overrideISO && window.PhoneCountryMap[overrideISO.toUpperCase()]) {
        return overrideISO.toUpperCase();
      }

      const countryInput = formEl ? formEl.querySelector('[data-prop="Delivery_Country"]') : null;
      const text = (countryInput ? countryInput.value : '').trim().toUpperCase();

      if (text) {
        if (text.includes('INDIA') || text.includes('BHARAT') || text === 'IN') return 'IN';
        if (text.includes('UK') || text.includes('UNITED KINGDOM') || text.includes('GREAT BRITAIN') || text.includes('ENGLAND') || text.includes('SCOTLAND') || text.includes('WALES') || text.includes('NORTHERN IRELAND') || text === 'GB') return 'GB';
        if (text.includes('US') || text.includes('USA') || text.includes('UNITED STATES') || text.includes('AMERICA')) return 'US';
        if (text.includes('UAE') || text.includes('EMIRATES') || text.includes('DUBAI') || text.includes('ABU DHABI') || text === 'AE') return 'AE';
        if (text.includes('CANADA') || text === 'CA') return 'CA';
        if (text.includes('AUSTRALIA') || text === 'AU') return 'AU';
        if (text.includes('SINGAPORE') || text === 'SG') return 'SG';
        if (text.includes('GERMANY') || text.includes('DEUTSCHLAND') || text === 'DE') return 'DE';
        if (text.includes('FRANCE') || text === 'FR') return 'FR';
        if (text.includes('ITALY') || text === 'IT') return 'IT';
        if (text.includes('SPAIN') || text === 'ES') return 'ES';
        if (text.includes('NETHERLANDS') || text === 'NL') return 'NL';
        if (text.includes('NEW ZEALAND') || text === 'NZ') return 'NZ';
        if (text.includes('IRELAND') || text === 'IE') return 'IE';
      }

      const storeCode = (localStorage.getItem('user_country_code') || 'US').toUpperCase();
      if (['UK', 'GB'].includes(storeCode)) return 'GB';
      if (['IN', 'INDIA'].includes(storeCode)) return 'IN';
      if (['US', 'USA'].includes(storeCode)) return 'US';
      if (['AE', 'UAE'].includes(storeCode)) return 'AE';
      if (['CA'].includes(storeCode)) return 'CA';
      if (['AU'].includes(storeCode)) return 'AU';
      if (['SG'].includes(storeCode)) return 'SG';
      if (['DE'].includes(storeCode)) return 'DE';

      return 'US';
    }

    function fallbackPhoneValidation(digits, iso) {
      if (iso === 'GB') {
        return (digits.startsWith('07') && digits.length === 11) ||
               (digits.startsWith('7') && digits.length === 10) ||
               (/^0[123]/.test(digits) && (digits.length === 10 || digits.length === 11)) ||
               (/^[123]/.test(digits) && digits.length === 10);
      }
      if (iso === 'IN') {
        return digits.length === 10 && /^[6-9]/.test(digits);
      }
      if (iso === 'US' || iso === 'CA') {
        return digits.length === 10 && /^[2-9]/.test(digits) && /^[2-9]/.test(digits.charAt(3));
      }
      if (iso === 'AE') {
        return digits.length === 9 && /^5/.test(digits);
      }
      if (iso === 'AU') {
        return (digits.startsWith('04') && digits.length === 10) || (digits.startsWith('4') && digits.length === 9);
      }
      return digits.length >= 8 && digits.length <= 12;
    }

    function validateSinglePhoneField(inputEl, forceISO) {
      if (!inputEl) return true;
      const formEl = inputEl.closest('.delivery-address-form') || document;
      const groupEl = inputEl.closest('.phone-field-group') || inputEl.parentNode;
      const selectEl = groupEl ? groupEl.querySelector('.phone-country-select') : null;

      const currentISO = resolveCountryISO(formEl, forceISO || (selectEl ? selectEl.value : null));
      const countryInfo = window.PhoneCountryMap[currentISO] || { name: currentISO, iso: currentISO, dialCode: '+1', flag: '🌐' };

      if (selectEl && selectEl.value !== currentISO) {
        selectEl.value = currentISO;
      }

      const flagEl = groupEl ? groupEl.querySelector('.flag-icon') : null;
      const dialEl = groupEl ? groupEl.querySelector('.dial-code') : null;
      if (flagEl) flagEl.textContent = countryInfo.flag;
      if (dialEl) dialEl.textContent = countryInfo.dialCode;

      const raw = inputEl.value.trim();
      const cleanDigits = raw.replace(/[^\d+]/g, '');

      let parentContainer = groupEl.parentNode;
      let hintEl = parentContainer ? parentContainer.querySelector('.tel-input-hint') : null;
      if (!hintEl && parentContainer) {
        hintEl = document.createElement('p');
        hintEl.className = 'tel-input-hint text-[11px] font-semibold mt-1 transition-all';
        parentContainer.appendChild(hintEl);
      }

      const isRequired = inputEl.hasAttribute('required');

      if (!raw) {
        if (isRequired) {
          if (hintEl) {
            hintEl.textContent = `Please enter a valid ${countryInfo.name} phone number.`;
            hintEl.style.color = '#dc2626';
            hintEl.style.display = 'block';
          }
          inputEl.classList.add('border-red-500', 'ring-2', 'ring-red-500');
          delete inputEl.dataset.e164;
          return false;
        } else {
          if (hintEl) {
            hintEl.textContent = '';
            hintEl.style.display = 'none';
          }
          inputEl.classList.remove('border-red-500', 'ring-2', 'ring-red-500', 'border-emerald-500');
          delete inputEl.dataset.e164;
          return true;
        }
      }

      const lib = window.libphonenumber;
      let isValid = false;
      let e164 = '';
      let isMismatch = false;

      if (lib && typeof lib.parsePhoneNumber === 'function') {
        try {
          const parsed = lib.parsePhoneNumber(cleanDigits, currentISO);
          if (parsed && parsed.isValid()) {
            if (parsed.country && parsed.country !== currentISO) {
              isMismatch = true;
              isValid = false;
            } else {
              isValid = true;
              e164 = parsed.format('E.164');
            }
          }
        } catch (e) {
          isValid = false;
        }
      } else {
        isValid = fallbackPhoneValidation(cleanDigits.replace(/[^0-9]/g, ''), currentISO);
      }

      if (isValid) {
        if (hintEl) {
          hintEl.textContent = `✓ Valid ${countryInfo.name} phone number`;
          hintEl.style.color = '#059669';
          hintEl.style.display = 'block';
        }
        inputEl.classList.remove('border-red-500', 'ring-2', 'ring-red-500', 'border-amber-400');
        inputEl.classList.add('border-emerald-500');
        inputEl.dataset.e164 = e164 || `${countryInfo.dialCode}${cleanDigits.replace(/[^0-9]/g, '').replace(/^0/, '')}`;
        return true;
      } else {
        if (hintEl) {
          hintEl.textContent = isMismatch ? `Invalid phone number for ${countryInfo.name}.` : `Please enter a valid ${countryInfo.name} phone number.`;
          hintEl.style.color = '#dc2626';
          hintEl.style.display = 'block';
        }
        inputEl.classList.add('border-red-500', 'ring-2', 'ring-red-500');
        inputEl.classList.remove('border-emerald-500');
        delete inputEl.dataset.e164;
        return false;
      }
    }

    function syncAllTelInputs(formEl) {
      const scope = formEl || document;
      scope.querySelectorAll('input[type="tel"]').forEach(input => {
        validateSinglePhoneField(input);
      });
    }

    window.validateSinglePhoneField = validateSinglePhoneField;
    window.syncAllTelInputs = syncAllTelInputs;

    document.addEventListener('keydown', (e) => {
      if (e.target.matches && e.target.matches('input[type="tel"]')) {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
      }
    });

    ['input', 'change', 'blur', 'keyup'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (e.target.matches && e.target.matches('input[type="tel"]')) {
          validateSinglePhoneField(e.target);
        } else if (e.target.matches && e.target.matches('[data-prop="Delivery_Country"]')) {
          const form = e.target.closest('.delivery-address-form');
          syncAllTelInputs(form);
        } else if (e.target.matches && e.target.matches('.phone-country-select')) {
          const form = e.target.closest('.delivery-address-form') || document;
          const iso = e.target.value;
          const info = window.PhoneCountryMap[iso];
          if (info) {
            const countryInput = form.querySelector('[data-prop="Delivery_Country"]');
            if (countryInput) {
              countryInput.value = info.name;
            }
            localStorage.setItem('user_country_code', iso);
            syncAllTelInputs(form);
          }
        }
      });
    });

    setTimeout(() => syncAllTelInputs(), 100);
    setInterval(() => syncAllTelInputs(), 1500);
  })();
    
    // Qty update logic
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.js-qty-btn');
      if (!btn) return;
      e.preventDefault();

      if (typeof window.saveCartDeliveryDetailsToStorage === 'function') {
        window.saveCartDeliveryDetailsToStorage();
      }

      const line = btn.dataset.line;
      const quantity = btn.dataset.quantity;
      const container = document.getElementById('cart-container');

      if (container) {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
      }

      try {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line: line, quantity: quantity })
        });

        const response = await fetch(window.location.pathname + '?section_id=main-cart');
        const text = await response.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        
        const newContainer = html.getElementById('cart-container');
        if (newContainer && container) {
          container.innerHTML = newContainer.innerHTML;
          if (typeof window.restoreCartDeliveryDetailsFromStorage === 'function') {
            window.restoreCartDeliveryDetailsFromStorage();
          }
          if (window.initAllCartDatePickers) window.initAllCartDatePickers();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        window.location.reload();
      } finally {
        if (container) {
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
        }
      }
    });

    function updateShipmentNotice() {
      const forms = Array.from(document.querySelectorAll('.delivery-address-form'));
      const singleNotice = document.getElementById('single-shipment-notice');
      const multiNotice = document.getElementById('multi-shipment-notice');

      if (!singleNotice || !multiNotice) return;

      if (forms.length <= 1) {
        singleNotice.classList.remove('hidden');
        multiNotice.classList.add('hidden');
        return;
      }

      const addresses = forms.map(f => {
        const addr = (f.querySelector('[data-prop="Delivery_Address"]')?.value || '').trim().toLowerCase();
        const city = (f.querySelector('[data-prop="Delivery_City"]')?.value || '').trim().toLowerCase();
        const pin = (f.querySelector('[data-prop="Delivery_Postcode"]')?.value || '').trim().toLowerCase();
        return `${addr}|${city}|${pin}`;
      });

      const firstAddr = addresses[0];
      const allMatch = addresses.every(a => a === firstAddr || a === '||');

      if (allMatch) {
        singleNotice.classList.remove('hidden');
        multiNotice.classList.add('hidden');
      } else {
        singleNotice.classList.add('hidden');
        multiNotice.classList.remove('hidden');
      }
    }

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('use-same-address-cb')) {
        const form = e.target.closest('.delivery-address-form');
        if (e.target.checked) {
          const allForms = Array.from(document.querySelectorAll('.delivery-address-form'));
          const index = allForms.indexOf(form);
          if (index > 0) {
            const prevForm = allForms[index - 1];
            const prevFields = prevForm.querySelectorAll('.addr-field');
            const currFields = form.querySelectorAll('.addr-field');
            
            currFields.forEach((field, i) => {
              if (field.type === 'checkbox') {
                field.checked = prevFields[i].checked;
              } else {
                field.value = prevFields[i].value;
              }
            });
          }
        }
      }
      updateShipmentNotice();
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('addr-field')) {
        updateShipmentNotice();
      }
    });

    // ---- Date & Time Picker Logic (Matching Product Page Functionality) ----
    const PREP_HOURS     = 3;   // 3-hour processing time
    const MIDNIGHT_HOURS = 6;   // 6-hour advance notice for midnight delivery
    const SAMEDAY_CUTOFF = 16;  // 4 PM same-day cutoff hour

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function formatTabDate(d) {
      return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
    }
    function formatISODate(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    function normalizeToISODate(dateVal) {
      if (!dateVal) return '';
      dateVal = dateVal.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;

      const parts = dateVal.split(/[\/\-\.]/);
      if (parts.length === 3) {
        let p1 = parseInt(parts[0], 10);
        let p2 = parseInt(parts[1], 10);
        let p3 = parseInt(parts[2], 10);

        if (p3 > 1000) {
          let day = p1, month = p2, year = p3;
          if (p1 <= 12 && p2 > 12) {
            month = p1; day = p2;
          }
          return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        } else if (p1 > 1000) {
          return p1 + '-' + String(p2).padStart(2, '0') + '-' + String(p3).padStart(2, '0');
        }
      }

      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      }
      return dateVal;
    }

    window.initCartDatePicker = function(block) {
      if (!block) return;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

      const currentHour = now.getHours() + now.getMinutes() / 60;
      const todayAvailable = currentHour < SAMEDAY_CUTOFF;

      const todayIso = formatISODate(today);
      const tomorrowIso = formatISODate(tomorrow);
      const dayAfterIso = formatISODate(dayAfter);

      // Populate Tab Labels
      const todayDisplay = block.querySelector('.today-date-display');
      const tomorrowDisplay = block.querySelector('.tomorrow-date-display');
      const dayAfterDisplay = block.querySelector('.dayafter-date-display');

      if (todayDisplay) todayDisplay.textContent = formatTabDate(today);
      if (tomorrowDisplay) tomorrowDisplay.textContent = formatTabDate(tomorrow);
      if (dayAfterDisplay) dayAfterDisplay.textContent = formatTabDate(dayAfter);

      const tabToday = block.querySelector('.date-tab-today');
      const tabTomorrow = block.querySelector('.date-tab-tomorrow');
      const tabDayAfter = block.querySelector('.date-tab-dayafter');
      const customBtn = block.querySelector('.custom-date-btn');
      const hiddenInput = block.querySelector('.cart-date-input');
      const timeSelect = block.querySelector('.delivery-time-select');
      const noticeBox = block.querySelector('.cart-delivery-notice');
      const noticeText = block.querySelector('.cart-delivery-notice-text');
      const calendarPicker = block.querySelector('.custom-calendar-picker');

      if (!tabToday || !tabTomorrow || !tabDayAfter || !hiddenInput || !timeSelect) return;

      const sundayAllowedCountries = [
        'AE', 'UAE', 'UNITED ARAB EMIRATES', 'DUBAI',
        'ID', 'INDONESIA',
        'SA', 'SAUDI ARABIA', 'SAUDI',
        'QA', 'QATAR',
        'OM', 'OMAN',
        'KW', 'KUWAIT',
        'BH', 'BAHRAIN'
      ];

      const deliveryMode = localStorage.getItem('delivery_mode') || 'india';
      const userCountry = (localStorage.getItem('user_country') || 'India').trim();
      const userCountryCode = (localStorage.getItem('user_country_code') || 'IN').toUpperCase().trim();
      const isIntl = (deliveryMode === 'international') && (userCountry.toUpperCase() !== 'INDIA' && userCountry.toUpperCase() !== 'IN');
      const isSundayAllowed = sundayAllowedCountries.includes(userCountryCode) || sundayAllowedCountries.includes(userCountry.toUpperCase());

      const timeSelectContainer = timeSelect ? timeSelect.closest('.flex.items-center.gap-2.rounded-lg') : null;
      if (isIntl) {
        if (timeSelectContainer) timeSelectContainer.style.display = 'none';
        if (timeSelect) {
          timeSelect.removeAttribute('required');
          timeSelect.value = 'Standard Full Day Delivery';
        }
      } else {
        if (timeSelectContainer) timeSelectContainer.style.display = 'flex';
        if (timeSelect) timeSelect.setAttribute('required', 'required');
      }

      // Handle 5 PM Cutoff & International Same-Day Disable
      if (isIntl || !todayAvailable) {
        tabToday.disabled = true;
        tabToday.classList.add('opacity-40', 'cursor-not-allowed');
        tabToday.title = isIntl ? 'Same-day delivery is not available for International Shipping' : 'Same-day delivery cutoff (5 PM) has passed';
      }

      const allTabs = [tabToday, tabTomorrow, tabDayAfter];

      function activateTab(tab) {
        allTabs.forEach(t => {
          t.classList.remove('active', 'bg-primary', 'text-white');
          t.classList.add('bg-white', 'border', 'border-gray-200', 'text-gray-700');
        });
        if (customBtn) {
          customBtn.classList.remove('bg-primary', 'text-white');
          customBtn.classList.add('bg-white', 'border', 'border-gray-200', 'text-gray-500');
        }

        if (tab) {
          tab.classList.add('active', 'bg-primary', 'text-white');
          tab.classList.remove('bg-white', 'border', 'border-gray-200', 'text-gray-700', 'text-gray-500');
        }
      }

      function filterTimeSlots(selectedDateISO) {
        if (isIntl) {
          if (noticeBox) noticeBox.classList.add('hidden');
          return;
        }

        const isToday = (selectedDateISO === todayIso);
        const options = timeSelect.querySelectorAll('option');
        let allDisabled = true;
        let selectedOptionDisabled = false;

        options.forEach(opt => {
          if (!opt.value) return;

          const slotStart = parseInt(opt.dataset.start, 10);
          const isMidnight = opt.dataset.midnight === 'true';

          let disabled = false;

          if (slotStart === 8 || opt.value.indexOf('08:00 AM') !== -1) {
            const parts = selectedDateISO.split('-');
            if (parts.length === 3) {
              const selY = parseInt(parts[0], 10);
              const selM = parseInt(parts[1], 10) - 1;
              const selD = parseInt(parts[2], 10);
              const morningCutoff = new Date(selY, selM, selD - 1, 19, 0, 0, 0);
              if (new Date() >= morningCutoff) {
                disabled = true;
              }
            }
          }

          if (isIntl && isMidnight) {
            disabled = true;
          }

          if (isToday) {
            if (isMidnight) {
              if (currentHour >= (22 - MIDNIGHT_HOURS)) disabled = true;
            } else {
              if (currentHour + PREP_HOURS > slotStart) disabled = true;
            }
          }

          opt.disabled = disabled;
          opt.style.color = disabled ? '#bbb' : '';

          if (!disabled) allDisabled = false;
          if (timeSelect.value === opt.value && disabled) selectedOptionDisabled = true;
        });

        if (selectedOptionDisabled) {
          timeSelect.value = '';
        }

        if (noticeBox && noticeText) {
          const morningOpt = timeSelect.querySelector('option[data-start="8"]');
          const morningBlocked = morningOpt && morningOpt.disabled;

          if (isToday) {
            noticeBox.classList.remove('hidden');
            const midnightOpt = timeSelect.querySelector('option[data-midnight="true"]');
            const midnightBlocked = midnightOpt && midnightOpt.disabled;

            if (allDisabled) {
              noticeText.textContent = "⚠️ No delivery slots available today. Please select Tomorrow or a future date.";
              noticeBox.className = "cart-delivery-notice mb-3 px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800";
            } else if (midnightBlocked && currentHour >= (22 - MIDNIGHT_HOURS)) {
              noticeText.textContent = "🌙 Midnight slot unavailable — must be ordered 6 hrs in advance (by 4 PM). Select tomorrow for midnight delivery.";
              noticeBox.className = "cart-delivery-notice mb-3 px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700";
            } else {
              noticeText.textContent = "⏱️ Showing slots with 3-hour preparation time. Earlier slots are unavailable.";
              noticeBox.className = "cart-delivery-notice mb-3 px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700";
            }
          } else if (morningBlocked && currentHour >= 19 && selectedDateISO === tomorrowIso) {
            noticeBox.classList.remove('hidden');
            noticeText.textContent = "🌅 Morning slot (8:00 AM – 10:00 AM) closed — must be ordered before 7:00 PM on the previous day.";
            noticeBox.className = "cart-delivery-notice mb-3 px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700";
          } else {
            noticeBox.classList.add('hidden');
          }
        }
      }

      function selectDate(dateObj, tabEl) {
        const isoDate = formatISODate(dateObj);
        hiddenInput.value = isoDate;
        activateTab(tabEl);
        filterTimeSlots(isoDate);
      }

      // Advance processing lead time check for cart items
      const cartFormEl = document.querySelector('.delivery-address-form');
      const cartAdvDays = cartFormEl ? (parseInt(cartFormEl.dataset.advanceDays, 10) || 0) : 0;
      const cartNoSun = cartFormEl ? (cartFormEl.dataset.noSunday === 'true') : false;
      const cartNoWeekend = cartFormEl ? (cartFormEl.dataset.noWeekend === 'true') : false;

      let minCartDate = new Date(today);
      if (cartAdvDays > 0) {
        minCartDate.setDate(today.getDate() + cartAdvDays);
      } else if (isIntl || !todayAvailable) {
        minCartDate.setDate(today.getDate() + 1);
      }

      const disallowCartSunday = (!isSundayAllowed || cartNoSun || cartNoWeekend);
      const disallowCartSaturday = cartNoWeekend;

      while ((disallowCartSunday && minCartDate.getDay() === 0) || (disallowCartSaturday && minCartDate.getDay() === 6)) {
        minCartDate.setDate(minCartDate.getDate() + 1);
      }

      const minCartIso = formatISODate(minCartDate);

      if (todayIso < minCartIso) {
        tabToday.disabled = true;
        tabToday.classList.add('opacity-40', 'cursor-not-allowed');
      }
      if (tomorrowIso < minCartIso || (disallowCartSunday && tomorrow.getDay() === 0) || (disallowCartSaturday && tomorrow.getDay() === 6)) {
        tabTomorrow.disabled = true;
        tabTomorrow.classList.add('opacity-40', 'cursor-not-allowed');
      }
      if (dayAfterIso < minCartIso || (disallowCartSunday && dayAfter.getDay() === 0) || (disallowCartSaturday && dayAfter.getDay() === 6)) {
        tabDayAfter.disabled = true;
        tabDayAfter.classList.add('opacity-40', 'cursor-not-allowed');
      }

      // Resolution of selected cart date
      // Priority: 1) localStorage from product page, 2) line item properties (initialIso), 3) auto-select earliest
      let pdpSavedDate = '';
      let pdpSavedTime = '';
      try {
        pdpSavedDate = localStorage.getItem('floral_pdp_delivery_date') || '';
        pdpSavedTime = localStorage.getItem('floral_pdp_delivery_time') || '';
        // Clear them so they don't linger after being read
        localStorage.removeItem('floral_pdp_delivery_date');
        localStorage.removeItem('floral_pdp_delivery_time');
      } catch(e) {}

      let initialIso = normalizeToISODate(pdpSavedDate) || normalizeToISODate(hiddenInput.value);

      // Pre-fill time slot from product page selection if available
      if (pdpSavedTime && timeSelect) {
        for (let opt of timeSelect.options) {
          if (opt.value === pdpSavedTime) {
            timeSelect.value = pdpSavedTime;
            break;
          }
        }
      }

      function updateCustomBtnLabel(isoDate) {
        const customLabel = customBtn ? customBtn.querySelector('.custom-date-label') : null;
        const customDisplay = customBtn ? customBtn.querySelector('.custom-date-display') : null;
        if (!customLabel || !customDisplay || !isoDate) return;
        const parts = isoDate.split('-');
        if (parts.length !== 3) return;
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        customLabel.textContent = dayNames[d.getDay()];
        customDisplay.textContent = monthNames[d.getMonth()] + ' ' + d.getDate();
      }

      // Flatpickr Integration — init BEFORE date resolution so fp.setDate() works on load
      const maxDate = new Date(today);
      maxDate.setMonth(maxDate.getMonth() + 12);

      let fp = null;
      if (calendarPicker && typeof flatpickr !== 'undefined') {
        const disableRules = [];
        if (disallowCartSunday || disallowCartSaturday) {
          disableRules.push(function(date) {
            if (disallowCartSunday && date.getDay() === 0) return true;
            if (disallowCartSaturday && date.getDay() === 6) return true;
            return false;
          });
        }

        fp = flatpickr(calendarPicker, {
          minDate: minCartIso,
          maxDate: maxDate,
          dateFormat: 'Y-m-d',
          defaultDate: (initialIso && initialIso >= minCartIso) ? initialIso : minCartIso,
          disableMobile: true,
          disable: disableRules,
          onChange: function(selectedDates, dateStr) {
            if (selectedDates.length > 0) {
              hiddenInput.value = dateStr;
              activateTab(customBtn);
              updateCustomBtnLabel(dateStr);
              filterTimeSlots(dateStr);
            }
          }
        });
      }

      if (initialIso && initialIso >= minCartIso) {
        if (initialIso === todayIso && !tabToday.disabled) {
          selectDate(today, tabToday);
        } else if (initialIso === tomorrowIso && !tabTomorrow.disabled) {
          selectDate(tomorrow, tabTomorrow);
        } else if (initialIso === dayAfterIso && !tabDayAfter.disabled) {
          selectDate(dayAfter, tabDayAfter);
        } else {
          hiddenInput.value = initialIso;
          activateTab(customBtn);
          updateCustomBtnLabel(initialIso);
          filterTimeSlots(initialIso);
          if (fp) fp.setDate(initialIso, false);
        }
      } else {
        if (minCartIso === todayIso && !tabToday.disabled) {
          selectDate(today, tabToday);
        } else if (minCartIso === tomorrowIso && !tabTomorrow.disabled) {
          selectDate(tomorrow, tabTomorrow);
        } else if (minCartIso === dayAfterIso && !tabDayAfter.disabled) {
          selectDate(dayAfter, tabDayAfter);
        } else {
          hiddenInput.value = minCartIso;
          activateTab(customBtn);
          updateCustomBtnLabel(minCartIso);
          filterTimeSlots(minCartIso);
          if (fp) fp.setDate(minCartIso, false);
        }
      }

      // Event Listeners for Date Tabs
      tabToday.addEventListener('click', (e) => {
        e.preventDefault();
        if (!tabToday.disabled) selectDate(today, tabToday);
      });

      tabTomorrow.addEventListener('click', (e) => {
        e.preventDefault();
        if (!tabTomorrow.disabled) selectDate(tomorrow, tabTomorrow);
      });

      tabDayAfter.addEventListener('click', (e) => {
        e.preventDefault();
        if (!tabDayAfter.disabled) selectDate(dayAfter, tabDayAfter);
      });

      if (customBtn) {
        customBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (fp) {
            fp.open();
          } else if (calendarPicker) {
            calendarPicker.type = 'date';
            calendarPicker.focus();
            if (typeof calendarPicker.showPicker === 'function') calendarPicker.showPicker();
          }
        });
      }

      timeSelect.addEventListener('change', () => {
        filterTimeSlots(hiddenInput.value);
      });
    };

    window.initAllCartDatePickers = function() {
      document.querySelectorAll('.cart-date-picker-block').forEach(block => {
        window.initCartDatePicker(block);
      });
    };

    // Auto Pre-fill from line item properties
    document.querySelectorAll('.delivery-address-form').forEach(form => {
      let existingProps = {};
      try {
        if (form.dataset.existingProperties) {
          existingProps = JSON.parse(form.dataset.existingProperties);
        }
      } catch(e) {}

      const dateVal = existingProps['Delivery Date'] || existingProps['Delivery_Date'] || existingProps['Date'];
      const timeVal = existingProps['Delivery Time'] || existingProps['Delivery_Time'] || existingProps['Time'];

      if (dateVal) {
        const dateInput = form.querySelector('.cart-date-input');
        if (dateInput) dateInput.value = normalizeToISODate(dateVal);
      }
      if (timeVal) {
        const timeSelect = form.querySelector('.delivery-time-select');
        if (timeSelect) {
          for (let i = 0; i < timeSelect.options.length; i++) {
            const optVal = timeSelect.options[i].value;
            if (optVal && (optVal === timeVal || optVal.toLowerCase().includes(timeVal.toLowerCase()) || timeVal.toLowerCase().includes(optVal.toLowerCase()))) {
              timeSelect.selectedIndex = i;
              break;
            }
          }
        }
      }
    });

    // Run Initialization
    window.initAllCartDatePickers();

    // Live Countdown Timer
    function updateCartCountdowns() {
      const now = new Date();
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SAMEDAY_CUTOFF, 0, 0);
      const diff   = cutoff - now;

      document.querySelectorAll('.cart-date-picker-block').forEach(block => {
        const el = block.querySelector('.delivery-countdown');
        const tabToday = block.querySelector('.date-tab-today');
        if (!el) return;

        const mode = localStorage.getItem('delivery_mode') || 'india';
        if (mode === 'international' || (tabToday && tabToday.disabled)) {
          el.style.display = 'none';
          return;
        }

        el.style.display = 'inline';
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          el.innerHTML = '<span class="text-secondary font-bold">' + h + 'h ' + m + 'm ' + s + 's</span> left for today';
        } else {
          el.innerHTML = '<span class="text-rose-600 font-bold">Today\'s delivery closed</span>';
        }
      });
    }
    updateCartCountdowns();
    setInterval(updateCartCountdowns, 1000);

    // Run on initial load
    updateShipmentNotice();

    // Live sync address fields to hidden form inputs so discount apps (Scala) cannot wipe attributes
    function syncLiveCartAttributes() {
      const forms = document.querySelectorAll('.delivery-address-form');
      const mainCartForm = document.querySelector('form[action^="/cart"]') || document.querySelector('form#cart');
      if (!mainCartForm) return;

      forms.forEach((form, idx) => {
        const fields = form.querySelectorAll('.addr-field');
        const properties = {};
        fields.forEach(field => {
          const val = field.type === 'checkbox' ? (field.checked ? field.value : '') : (field.type === 'tel' && field.dataset.e164 ? field.dataset.e164 : field.value);
          if (val) properties[field.dataset.prop] = val;
        });

        const title = properties['Delivery_Title'] || '';
        const fName = properties['Delivery_FirstName'] || '';
        const lName = properties['Delivery_LastName'] || '';
        const address = properties['Delivery_Address'] || '';
        const landmark = properties['Delivery_Landmark'] || '';
        const city = properties['Delivery_City'] || properties['City'] || '';
        const state = properties['Delivery_State'] || '';
        const postcode = properties['Delivery_Postcode'] || '';
        const mobile = properties['Delivery_Mobile'] || '';
        const giftMsg = properties['Delivery_GiftMessage'] || '';
        const senderName = properties['Sender_Name'] || '';
        const senderMobile = properties['Sender_Mobile'] || '';
        const senderEmail = properties['Sender_Email'] || '';
        const delDate = properties['Delivery Date'] || properties['Delivery_Date'] || '';
        const delTime = properties['Delivery Time'] || properties['Delivery_Time'] || '';

        const prefix = forms.length > 1 ? `Item ${idx + 1} ` : '';
        const attrs = {};
        if (fName || lName) attrs[`${prefix}Recipient Name`] = `${title} ${fName} ${lName}`.trim();
        if (address) attrs[`${prefix}Delivery Address`] = `${address}${landmark ? ', ' + landmark : ''}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${postcode ? ' - ' + postcode : ''}`;
        if (mobile) attrs[`${prefix}Recipient Phone`] = mobile;
        if (giftMsg) attrs[`${prefix}Gift Message`] = giftMsg;
        if (senderName) attrs[`${prefix}Sender Name`] = senderName;
        if (senderMobile) attrs[`${prefix}Sender Phone`] = senderMobile;
        if (senderEmail) attrs[`${prefix}Sender Email`] = senderEmail;
        if (delDate) attrs[`${prefix}Delivery Date`] = delDate;
        if (delTime) attrs[`${prefix}Delivery Time`] = delTime;

        Object.keys(attrs).forEach(attrKey => {
          let hiddenInput = mainCartForm.querySelector(`input[name="attributes[${CSS.escape(attrKey)}]"]`);
          if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = `attributes[${attrKey}]`;
            mainCartForm.appendChild(hiddenInput);
          }
          hiddenInput.value = attrs[attrKey];
        });
      });
    }

    document.querySelectorAll('.addr-field').forEach(field => {
      field.addEventListener('input', syncLiveCartAttributes);
      field.addEventListener('change', syncLiveCartAttributes);
    });
    syncLiveCartAttributes();

    window.saveCartDeliveryDetailsToStorage = function() {
      const saveCb = document.getElementById('save-delivery-details-cb');
      if (saveCb && !saveCb.checked) {
        localStorage.removeItem('floral_saved_delivery_details');
        return;
      }
      const formData = {};
      document.querySelectorAll('.delivery-address-form .addr-field').forEach(field => {
        const key = field.dataset.prop;
        if (!key) return;
        if (field.type === 'checkbox') {
          formData[key] = field.checked ? field.value : '';
        } else {
          formData[key] = field.value || '';
        }
      });

      const dateInput = document.querySelector('.cart-date-input');
      if (dateInput) formData['Delivery Date'] = dateInput.value;

      localStorage.setItem('floral_saved_delivery_details', JSON.stringify(formData));

      const badge = document.getElementById('saved-details-badge');
      if (badge) {
        badge.classList.remove('hidden');
        setTimeout(() => badge.classList.add('hidden'), 2500);
      }
    };

    window.lockCartLocationFields = function() {
      const mode = localStorage.getItem('delivery_mode') || 'india';
      const uCity = localStorage.getItem('user_city') || '';
      const uState = localStorage.getItem('user_state') || '';
      const uPin = localStorage.getItem('user_pincode') || '';
      const uCountry = (localStorage.getItem('user_country') || 'India').trim();

      document.querySelectorAll('.delivery-address-form').forEach(form => {
        const cityField = form.querySelector('[data-prop="Delivery_City"]');
        const stateField = form.querySelector('[data-prop="Delivery_State"]');
        const pinField = form.querySelector('[data-prop="Delivery_Postcode"]');
        const countryField = form.querySelector('[data-prop="Delivery_Country"]');

        const applyLock = (el, val) => {
          if (!el) return;
          if (val) {
            el.value = val;
            el.readOnly = true;
            el.classList.add('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
            el.classList.remove('bg-white');
            
            let wrapper = el.parentNode;
            if (!wrapper.classList.contains('locked-wrapper')) {
              const newWrapper = document.createElement('div');
              newWrapper.className = 'relative locked-wrapper w-full';
              wrapper.insertBefore(newWrapper, el);
              newWrapper.appendChild(el);
              
              const lockIcon = document.createElement('div');
              lockIcon.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-help';
              lockIcon.title = 'Locked from Pincode lookup.';
              lockIcon.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>';
              newWrapper.appendChild(lockIcon);
            }
          } else {
            el.readOnly = false;
            el.classList.remove('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
            el.classList.add('bg-white');
            let wrapper = el.parentNode;
            if (wrapper.classList.contains('locked-wrapper')) {
              const icon = wrapper.querySelector('div:last-child');
              if (icon) icon.remove();
              wrapper.outerHTML = wrapper.innerHTML; // Unwrap
            }
          }
        };

        if (mode === 'india') {
          applyLock(countryField, 'India');
          applyLock(cityField, uCity);
          applyLock(stateField, uState);
          applyLock(pinField, uPin);
        } else {
          const uIntlZip = localStorage.getItem('user_intl_zip') || '';
          const uIntlLocality = localStorage.getItem('user_intl_locality') || '';
          
          let iCity = uIntlLocality;
          let iState = '';
          if (uIntlLocality.includes(',')) {
            const parts = uIntlLocality.split(',').map(p => p.trim());
            iState = parts.pop();
            iCity = parts.join(', ');
          }

          applyLock(countryField, uCountry);
          applyLock(cityField, iCity);
          applyLock(stateField, iState);
          applyLock(pinField, uIntlZip);
        }
      });
      syncLiveCartAttributes();
    };

    window.restoreCartDeliveryDetailsFromStorage = function() {
      const savedJSON = localStorage.getItem('floral_saved_delivery_details');
      if (!savedJSON) return;

      try {
        const formData = JSON.parse(savedJSON);
        if (!formData || typeof formData !== 'object') return;

        let restoredAny = false;
        document.querySelectorAll('.delivery-address-form').forEach(form => {
          form.querySelectorAll('.addr-field').forEach(field => {
            const key = field.dataset.prop;
            if (key && formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
              if (field.type === 'checkbox') {
                field.checked = (formData[key] === field.value || formData[key] === 'Yes');
                restoredAny = true;
              } else {
                if (!field.value || field.value.trim() === '' || field.value === 'Mr.') {
                  field.value = formData[key];
                  restoredAny = true;
                }
              }
            }
          });
        });

        if (formData['Delivery Date']) {
          const dateInput = document.querySelector('.cart-date-input');
          if (dateInput) {
            // Only restore if dateInput is empty, otherwise trust the product page line item properties
            if (!dateInput.value || dateInput.value.trim() === '') {
              dateInput.value = formData['Delivery Date'];
              restoredAny = true;
            }
          }
        }

        if (restoredAny) {
          syncLiveCartAttributes();
          if (window.initAllCartDatePickers) window.initAllCartDatePickers();
        }
      } catch (err) {
        console.error('Error restoring saved cart delivery details:', err);
      }
    };

    // Restore on load
    restoreCartDeliveryDetailsFromStorage();
    if (window.lockCartLocationFields) window.lockCartLocationFields();
    if (window.syncAllTelInputs) window.syncAllTelInputs();

    // Auto save on input change (delegated to document for dynamic cart re-renders)
    document.addEventListener('input', (e) => {
      if (e.target.classList && e.target.classList.contains('addr-field')) {
        syncLiveCartAttributes();
        saveCartDeliveryDetailsToStorage();
      }
    });
    document.addEventListener('change', (e) => {
      if (e.target.classList && e.target.classList.contains('addr-field')) {
        syncLiveCartAttributes();
        saveCartDeliveryDetailsToStorage();
      } else if (e.target.id === 'save-delivery-details-cb') {
        if (e.target.checked) {
          saveCartDeliveryDetailsToStorage();
        } else {
          localStorage.removeItem('floral_saved_delivery_details');
        }
      }
    });

    const isCustomerLoggedIn = true;

    // Reusable delivery address form validator
    function validateCartFormFields() {
      if (typeof window.saveCartDeliveryDetailsToStorage === 'function') {
        window.saveCartDeliveryDetailsToStorage();
      }

      if (!isCustomerLoggedIn) {
        const currentUrl = window.location.pathname + window.location.search;
        if (typeof window.openLoginModal === 'function') {
          window.openLoginModal(currentUrl);
        } else {
          window.location.href = `/account/login?return_to=${encodeURIComponent(currentUrl)}&checkout_url=${encodeURIComponent(currentUrl)}`;
        }
        return false;
      }

      const mode = localStorage.getItem('delivery_mode') || 'india';
      const uCountryCode = localStorage.getItem('user_country_code') || 'US';
      const forms = document.querySelectorAll('.delivery-address-form');
      let isValid = true;
      let firstInvalidField = null;
      let invalidPincode = false;

      forms.forEach(form => {
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('border-red-500', 'ring-2', 'ring-red-500');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = field;
          } else {
            field.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
            
            // Validate Postcode
            if (field.dataset && field.dataset.prop === 'Delivery_Postcode') {
              const val = field.value.trim();
              if (mode === 'india') {
                if (val.length !== 6 || isNaN(val)) invalidPincode = true;
              } else if (mode === 'international' && uCountryCode === 'US') {
                if (!/^\d{5}$/.test(val)) invalidPincode = true;
              }
            }
          }
        });

        // Validate all phone fields according to country rules using libphonenumber-js
        const telFields = form.querySelectorAll('input[type="tel"]');
        telFields.forEach(field => {
          const isPhoneValid = validateSinglePhoneField(field);
          if (!isPhoneValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = field;
          }
        });
      });

      if (invalidPincode) {
        window.location.href = '/search?view=invalid-pincode';
        return false;
      }

      if (!isValid) {
        alert('Please fill out all required address fields and enter a valid phone number for the selected country.');
        if (firstInvalidField) {
          firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalidField.focus();
        }
        return false;
      }
      return true;
    }

    // Capture phase click interceptor for ALL checkout buttons (including Scala Discount button)
    document.addEventListener('click', function(e) {
      const checkoutTarget = e.target.closest('button[name="checkout"], input[name="checkout"], [data-checkout-btn], .scala-discount-btn, [class*="scala"], [id*="scala"], [class*="discount-btn"]');
      if (checkoutTarget) {
        if (!validateCartFormFields()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    }, true);

    // Capture phase submit interceptor on cart form
    const cartFormElement = document.querySelector('form[action^="/cart"]') || document.querySelector('form#cart');
    if (cartFormElement) {
      cartFormElement.addEventListener('submit', function(e) {
        if (!validateCartFormFields()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, true);
    }

    // Intercept checkout to save properties
    const checkoutBtn = document.getElementById('js-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const btnText = checkoutBtn.querySelector('.btn-text');
        const btnLoading = checkoutBtn.querySelector('.btn-loading');

        function resetCheckoutButtonState() {
          if (btnText) btnText.style.opacity = '1';
          if (btnLoading) btnLoading.classList.add('hidden');
          checkoutBtn.style.pointerEvents = 'auto';
        }

        if (!validateCartFormFields()) {
          resetCheckoutButtonState();
          return;
        }

        // Ensure live cart hidden attributes are synced
        syncLiveCartAttributes();
        
        // Show loading state
        if (btnText) btnText.style.opacity = '0';
        if (btnLoading) btnLoading.classList.remove('hidden');
        checkoutBtn.style.pointerEvents = 'none';

        const mainCartForm = checkoutBtn.closest('form') || document.querySelector('form[action^="/cart"]') || document.querySelector('form#cart');

        // Fallback safety timeout (forces checkout submit if network is slow)
        const safetyTimeout = setTimeout(() => {
          console.warn('Checkout submission timing out, forcing direct form submission...');
          if (mainCartForm) {
            let hiddenInput = mainCartForm.querySelector('input[name="checkout"]');
            if (!hiddenInput) {
              hiddenInput = document.createElement('input');
              hiddenInput.type = 'hidden';
              hiddenInput.name = 'checkout';
              hiddenInput.value = 'Checkout';
              mainCartForm.appendChild(hiddenInput);
            }
            mainCartForm.submit();
          } else {
            window.location.href = '/checkout';
          }
        }, 3500);

        try {
          const updates = [];
          const allCartAttributes = {};

          forms.forEach((form, idx) => {
            const lineAttr = form.dataset.line;
            const fields = form.querySelectorAll('.addr-field');
            
            let existingProperties = {};
            try {
              if (form.dataset.existingProperties) {
                existingProperties = JSON.parse(form.dataset.existingProperties);
              }
            } catch(err) {}

            const properties = Object.assign({}, existingProperties);
            
            let hasData = false;
            fields.forEach(field => {
              const val = field.type === 'checkbox' ? (field.checked ? field.value : '') : field.value;
              if (val) {
                properties[field.dataset.prop] = val;
                hasData = true;
              }
            });

            const title = properties['Delivery_Title'] || '';
            const fName = properties['Delivery_FirstName'] || '';
            const lName = properties['Delivery_LastName'] || '';
            const address = properties['Delivery_Address'] || '';
            const landmark = properties['Delivery_Landmark'] || '';
            const city = properties['Delivery_City'] || properties['City'] || properties['_City'] || '';
            const state = properties['Delivery_State'] || '';
            const postcode = properties['Delivery_Postcode'] || properties['_Pincode'] || '';
            const delMobileInput = form.querySelector('[data-prop="Delivery_Mobile"]');
            const senderMobileInput = form.querySelector('[data-prop="Sender_Mobile"]');

            const mobile = (delMobileInput && delMobileInput.dataset.e164) ? delMobileInput.dataset.e164 : (properties['Delivery_Mobile'] || '');
            const senderMobile = (senderMobileInput && senderMobileInput.dataset.e164) ? senderMobileInput.dataset.e164 : (properties['Sender_Mobile'] || '');
            const giftMsg = properties['Delivery_GiftMessage'] || '';
            const senderName = properties['Sender_Name'] || '';
            const senderEmail = properties['Sender_Email'] || '';
            const delDate = properties['Delivery Date'] || properties['Delivery_Date'] || '';
            const delTime = properties['Delivery Time'] || properties['Delivery_Time'] || '';

            if (fName || lName) properties['Recipient Name'] = `${title} ${fName} ${lName}`.trim();
            if (address) properties['Delivery Address'] = `${address}${landmark ? ', ' + landmark : ''}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${postcode ? ' - ' + postcode : ''}`;
            if (mobile) properties['Recipient Phone'] = mobile;
            if (giftMsg) properties['Gift Message'] = giftMsg;
            if (senderName) properties['Sender Name'] = senderName;
            if (senderMobile) properties['Sender Phone'] = senderMobile;
            if (senderEmail) properties['Sender Email'] = senderEmail;
            if (delDate) properties['Delivery Date'] = delDate;
            if (delTime) properties['Delivery Time'] = delTime;

            if (fName || lName) allCartAttributes['Recipient Name'] = `${title} ${fName} ${lName}`.trim();
            if (address) allCartAttributes['Delivery Address'] = `${address}${landmark ? ', ' + landmark : ''}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${postcode ? ' - ' + postcode : ''}`;
            if (mobile) allCartAttributes['Recipient Phone'] = mobile;
            if (giftMsg) allCartAttributes['Gift Message'] = giftMsg;
            if (senderName) allCartAttributes['Sender Name'] = senderName;
            if (senderMobile) allCartAttributes['Sender Phone'] = senderMobile;
            if (senderEmail) allCartAttributes['Sender Email'] = senderEmail;
            if (delDate) allCartAttributes['Delivery Date'] = delDate;
            if (delTime) allCartAttributes['Delivery Time'] = delTime;

            if (hasData || Object.keys(properties).length > 0) {
              if (lineAttr === 'all') {
                const qtyButtons = document.querySelectorAll('.js-qty-btn[data-line]');
                const lineNumbers = new Set();
                qtyButtons.forEach(b => { if (b.dataset.line) lineNumbers.add(parseInt(b.dataset.line, 10)); });
                if (lineNumbers.size === 0) lineNumbers.add(1);

                lineNumbers.forEach(lineNum => {
                  const qtyInput = document.getElementById(`updates_${lineNum}`);
                  const qty = qtyInput ? parseInt(qtyInput.value || '1', 10) : 1;
                  updates.push({
                    line: lineNum,
                    quantity: qty,
                    properties: properties
                  });
                });
              } else {
                const line = parseInt(lineAttr || '1', 10);
                const qty = parseInt(form.dataset.quantity || '1', 10);
                if (!isNaN(line)) {
                  updates.push({
                    line: line,
                    quantity: qty,
                    properties: properties
                  });
                }
              }
            }
          });

          // Parallel fetch to update line items & attributes faster
          const updatePromises = updates.map(u => fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line: u.line, quantity: u.quantity, properties: u.properties })
          }).catch(err => console.error('Error updating line property', err)));

          if (Object.keys(allCartAttributes).length > 0) {
            updatePromises.push(fetch('/cart/update.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ attributes: allCartAttributes })
            }).catch(err => console.error('Error updating attributes', err)));
          }

          await Promise.race([
            Promise.all(updatePromises),
            new Promise(r => setTimeout(r, 2500))
          ]);

          clearTimeout(safetyTimeout);

          if (mainCartForm) {
            let hiddenInput = mainCartForm.querySelector('input[name="checkout"]');
            if (!hiddenInput) {
              hiddenInput = document.createElement('input');
              hiddenInput.type = 'hidden';
              hiddenInput.name = 'checkout';
              hiddenInput.value = 'Checkout';
              mainCartForm.appendChild(hiddenInput);
            }
            mainCartForm.submit();
          } else {
            window.location.href = '/checkout';
          }
        } catch (checkoutErr) {
          console.error('Error during checkout preparation:', checkoutErr);
          clearTimeout(safetyTimeout);
          if (mainCartForm) {
            mainCartForm.submit();
          } else {
            window.location.href = '/checkout';
          }
        }
      });
    }
  }
