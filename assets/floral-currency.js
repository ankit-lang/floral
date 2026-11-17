/**
 * Global Currency Manager (FloralCurrencyManager)
 * Maintains exchange rate mapping relative to INR and updates storefront prices in real-time.
 */
(function() {
  const CURRENCIES = {
    INR: { code: 'INR', symbol: '₹', rate: 1.0, flag: '🇮🇳', name: 'Indian Rupee' },
    USD: { code: 'USD', symbol: '$', rate: 1 / 95.23, flag: '🇺🇸', name: 'US Dollar' },
    CAD: { code: 'CAD', symbol: '$', rate: 0.016, flag: '🇨🇦', name: 'Canadian Dollar' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.0094, flag: '🇬🇧', name: 'British Pound' },
    AED: { code: 'AED', symbol: 'AED ', rate: 0.044, flag: '🇦🇪', name: 'UAE Dirham' },
    AUD: { code: 'AUD', symbol: '$', rate: 0.018, flag: '🇦🇺', name: 'Australian Dollar' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.011, flag: '🇪🇺', name: 'Euro' },
    SAR: { code: 'SAR', symbol: 'SAR ', rate: 0.045, flag: '🇸🇦', name: 'Saudi Riyal' },
    QAR: { code: 'QAR', symbol: 'QAR ', rate: 0.044, flag: '🇶🇦', name: 'Qatari Riyal' },
    OMR: { code: 'OMR', symbol: 'OMR ', rate: 0.0046, flag: '🇴🇲', name: 'Omani Rial' },
    KWD: { code: 'KWD', symbol: 'KWD ', rate: 0.0037, flag: '🇰🇼', name: 'Kuwaiti Dinar' },
    BHD: { code: 'BHD', symbol: 'BHD ', rate: 0.0045, flag: '🇧🇭', name: 'Bahraini Dinar' },
    NZD: { code: 'NZD', symbol: '$', rate: 0.020, flag: '🇳🇿', name: 'New Zealand Dollar' },
    JPY: { code: 'JPY', symbol: '¥', rate: 1.80, flag: '🇯🇵', name: 'Japanese Yen' },
    MYR: { code: 'MYR', symbol: 'RM ', rate: 0.053, flag: '🇲🇾', name: 'Malaysian Ringgit' },
    CHF: { code: 'CHF', symbol: 'CHF ', rate: 0.010, flag: '🇨🇭', name: 'Swiss Franc' },
    ZAR: { code: 'ZAR', symbol: 'R ', rate: 0.22, flag: '🇿🇦', name: 'South African Rand' },
    ARS: { code: 'ARS', symbol: '$', rate: 11.5, flag: '🇦🇷', name: 'Argentine Peso' },
    BRL: { code: 'BRL', symbol: 'R$', rate: 0.068, flag: '🇧🇷', name: 'Brazilian Real' },
    BGN: { code: 'BGN', symbol: 'lv ', rate: 0.021, flag: '🇧🇬', name: 'Bulgarian Lev' },
    CNY: { code: 'CNY', symbol: '¥', rate: 0.086, flag: '🇨🇳', name: 'Chinese Yuan' },
    DKK: { code: 'DKK', symbol: 'kr ', rate: 0.082, flag: '🇩🇰', name: 'Danish Krone' },
    EGP: { code: 'EGP', symbol: 'E£ ', rate: 0.58, flag: '🇪🇬', name: 'Egyptian Pound' },
    HKD: { code: 'HKD', symbol: 'HK$', rate: 0.093, flag: '🇭🇰', name: 'Hong Kong Dollar' },
    IDR: { code: 'IDR', symbol: 'Rp ', rate: 190.0, flag: '🇮🇩', name: 'Indonesian Rupiah' },
    JOD: { code: 'JOD', symbol: 'JOD ', rate: 0.0085, flag: '🇯🇴', name: 'Jordanian Dinar' },
    MAD: { code: 'MAD', symbol: 'MAD ', rate: 0.12, flag: '🇲🇦', name: 'Moroccan Dirham' },
    NPR: { code: 'NPR', symbol: 'NRs ', rate: 1.60, flag: '🇳🇵', name: 'Nepalese Rupee' },
    PHP: { code: 'PHP', symbol: '₱', rate: 0.68, flag: '🇵🇭', name: 'Philippine Peso' },
    PLN: { code: 'PLN', symbol: 'zł ', rate: 0.047, flag: '🇵🇱', name: 'Polish Zloty' },
    LKR: { code: 'LKR', symbol: 'Rs ', rate: 3.60, flag: '🇱🇰', name: 'Sri Lankan Rupee' },
    SEK: { code: 'SEK', symbol: 'kr ', rate: 0.12, flag: '🇸🇪', name: 'Swedish Krona' },
    SGD: { code: 'SGD', symbol: '$', rate: 0.016, flag: '🇸🇬', name: 'Singapore Dollar' },
    THB: { code: 'THB', symbol: '฿', rate: 0.41, flag: '🇹🇭', name: 'Thai Baht' }
  };

  const COUNTRY_CURRENCY_MAP = {
    IN: 'INR', INDIA: 'INR',
    AR: 'ARS', ARGENTINA: 'ARS',
    AU: 'AUD', AUSTRALIA: 'AUD',
    AT: 'EUR', AUSTRIA: 'EUR',
    BH: 'BHD', BAHRAIN: 'BHD',
    BE: 'EUR', BELGIUM: 'EUR',
    BR: 'BRL', BRAZIL: 'BRL',
    BG: 'BGN', BULGARIA: 'BGN',
    CA: 'CAD', CANADA: 'CAD',
    CN: 'CNY', CHINA: 'CNY',
    DK: 'DKK', DENMARK: 'DKK',
    EG: 'EGP', EGYPT: 'EGP',
    FI: 'EUR', FINLAND: 'EUR', FILAND: 'EUR',
    FR: 'EUR', FRANCE: 'EUR',
    DE: 'EUR', GERMANY: 'EUR',
    GR: 'EUR', GREECE: 'EUR',
    HK: 'HKD', HONGKONG: 'HKD',
    ID: 'IDR', INDONESIA: 'IDR',
    IE: 'EUR', IRELAND: 'EUR',
    IT: 'EUR', ITALY: 'EUR',
    JP: 'JPY', JAPAN: 'JPY',
    JO: 'JOD', JORDAN: 'JOD',
    KW: 'KWD', KUWAIT: 'KWD',
    MY: 'MYR', MALAYSIA: 'MYR',
    MA: 'MAD', MOROCCO: 'MAD',
    NP: 'NPR', NEPAL: 'NPR',
    NL: 'EUR', NETHERLANDS: 'EUR',
    NZ: 'NZD', NEWZEALAND: 'NZD',
    OM: 'OMR', OMAN: 'OMR',
    PH: 'PHP', PHILIPPINES: 'PHP',
    PL: 'PLN', POLAND: 'PLN',
    PT: 'EUR', PORTUGAL: 'EUR',
    QA: 'QAR', QATAR: 'QAR',
    SA: 'SAR', SAUDIARABIA: 'SAR', SAUDI: 'SAR',
    SG: 'SGD', SINGAPORE: 'SGD',
    ZA: 'ZAR', SOUTHAFRICA: 'ZAR',
    ES: 'EUR', SPAIN: 'EUR',
    LK: 'LKR', SRILANKA: 'LKR',
    SE: 'SEK', SWEDEN: 'SEK',
    CH: 'CHF', SWITZERLAND: 'CHF',
    TH: 'THB', THAILAND: 'THB',
    AE: 'AED', UAE: 'AED', UNITEDARABEMIRATES: 'AED',
    GB: 'GBP', UK: 'GBP', UNITEDKINGDOM: 'GBP',
    US: 'USD', USA: 'USD', UNITEDSTATES: 'USD'
  };

  class CurrencyManager {
    constructor() {
      this.currencies = CURRENCIES;
      this.countryMap = COUNTRY_CURRENCY_MAP;
      this.isUpdating = false;
      
      // Load saved currency or default based on delivery_mode
      const mode = localStorage.getItem('delivery_mode') || 'india';
      let saved = localStorage.getItem('selected_currency');
      if (mode === 'india') {
        saved = 'INR';
      } else if (!saved || !CURRENCIES[saved]) {
        const country = localStorage.getItem('user_country_code') || localStorage.getItem('user_country') || 'US';
        const key = String(country).toUpperCase().replace(/[^A-Z]/g, '');
        saved = COUNTRY_CURRENCY_MAP[key] || COUNTRY_CURRENCY_MAP[country.toUpperCase()] || 'USD';
      }
      this.currentCurrency = saved;
      
      this.init();
    }

    init() {
      // Set initial symbol in localStorage
      localStorage.setItem('selected_currency', this.currentCurrency);
      localStorage.setItem('selected_currency_symbol', CURRENCIES[this.currentCurrency].symbol);

      const onReady = () => {
        this.updateDOM();
        this.bindEvents();
        this.observeDOM();
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
      } else {
        onReady();
      }
    }

    getCurrencyInfo(code = this.currentCurrency) {
      return CURRENCIES[code] || CURRENCIES.INR;
    }

    setCurrency(currencyCode, isManual = true) {
      const targetCode = (currencyCode || '').toUpperCase();
      if (!CURRENCIES[targetCode]) return;

      this.currentCurrency = targetCode;
      const info = CURRENCIES[targetCode];

      localStorage.setItem('selected_currency', targetCode);
      localStorage.setItem('selected_currency_symbol', info.symbol);

      // Dispatch currency change event
      window.dispatchEvent(new CustomEvent('currencyUpdated', {
        detail: { currency: targetCode, symbol: info.symbol, rate: info.rate, isManual }
      }));

      this.updateDOM();
    }

    setCurrencyByCountry(countryCodeOrName) {
      if (!countryCodeOrName) return;
      const key = String(countryCodeOrName).toUpperCase().replace(/[^A-Z]/g, '');
      const mappedCurrency = COUNTRY_CURRENCY_MAP[key] || COUNTRY_CURRENCY_MAP[countryCodeOrName.toUpperCase()];
      
      if (mappedCurrency && CURRENCIES[mappedCurrency]) {
        this.setCurrency(mappedCurrency, false);
      }
    }

    convertPrice(basePriceInSubunitsOrINR) {
      if (basePriceInSubunitsOrINR === null || basePriceInSubunitsOrINR === undefined) return 0;
      
      let rawVal = parseFloat(basePriceInSubunitsOrINR);
      if (isNaN(rawVal)) return 0;

      // Shopify Liquid prices like product.price are integers in paise/cents (e.g. 99900 = 999 INR)
      // If the number is large (> 1000 and typically ends in 00 or represents paise), convert to rupees
      // If passed as raw INR (e.g. 999), keep as is.
      let inrAmount = rawVal;
      if (rawVal >= 100 && Number.isInteger(rawVal)) {
        inrAmount = rawVal / 100;
      }

      const curr = CURRENCIES[this.currentCurrency] || CURRENCIES.INR;
      return inrAmount * curr.rate;
    }

    formatAmount(convertedAmount, currencyCode = this.currentCurrency) {
      const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
      
      if (currencyCode === 'INR') {
        const rounded = Math.round(convertedAmount);
        return curr.symbol + rounded.toLocaleString('en-IN');
      } else if (currencyCode === 'AED') {
        return curr.symbol + convertedAmount.toFixed(2);
      } else {
        // USD, CAD, GBP, AUD, EUR
        return curr.symbol + convertedAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }

    formatBasePrice(basePrice, currencyCode = this.currentCurrency) {
      const converted = this.convertPrice(basePrice);
      return this.formatAmount(converted, currencyCode);
    }

    updateDOM() {
      if (this.isUpdating) return;
      this.isUpdating = true;

      try {
        const curr = CURRENCIES[this.currentCurrency] || CURRENCIES.INR;

        // 1. Update switcher UI buttons in header
        document.querySelectorAll('.curr-switcher-flag').forEach(el => {
          if (el.textContent !== curr.flag) el.textContent = curr.flag;
        });
        document.querySelectorAll('.curr-switcher-code').forEach(el => {
          if (el.textContent !== curr.code) el.textContent = curr.code;
        });
        document.querySelectorAll('.curr-switcher-symbol').forEach(el => {
          if (el.textContent !== curr.symbol) el.textContent = curr.symbol;
        });
        document.querySelectorAll('.curr-switcher-label').forEach(el => {
          const txt = `${curr.flag} ${curr.code} ${curr.symbol.trim()}`;
          if (el.textContent !== txt) el.textContent = txt;
        });

        // Highlight active dropdown option
        document.querySelectorAll('.curr-switcher-option').forEach(opt => {
          const code = opt.dataset.currency;
          if (code === curr.code) {
            opt.classList.add('bg-primary/10', 'font-bold', 'text-primary');
          } else {
            opt.classList.remove('bg-primary/10', 'font-bold', 'text-primary');
          }
        });

        // 2. Scan and update all [data-base-price] elements across DOM
        document.querySelectorAll('[data-base-price]').forEach(el => {
          const baseVal = el.dataset.basePrice;
          if (baseVal !== undefined && baseVal !== '') {
            const formatted = this.formatBasePrice(baseVal);
            
            // Preserve prefix/suffix elements if any exist inside
            const prefix = el.dataset.pricePrefix || '';
            const suffix = el.dataset.priceSuffix || '';
            const targetText = prefix + formatted + suffix;

            if (el.textContent !== targetText) {
              el.textContent = targetText;
            }
          }
        });
      } finally {
        this.isUpdating = false;
      }
    }

    bindEvents() {
      // Listen to country/location changes
      window.addEventListener('countryUpdated', (e) => {
        const country = e.detail?.country || e.detail?.countryCode || e.detail?.code;
        if (country) {
          this.setCurrencyByCountry(country);
        }
      });

      document.addEventListener('pincodeUpdated', (e) => {
        const country = e.detail?.country || e.detail?.countryCode;
        if (country) {
          this.setCurrencyByCountry(country);
        }
      });

      const handleModeChange = (e) => {
        const mode = (e && e.detail && e.detail.mode) ? e.detail.mode : (localStorage.getItem('delivery_mode') || 'india');
        if (mode === 'india') {
          this.setCurrency('INR', false);
        } else {
          const country = e?.detail?.countryCode || e?.detail?.country || localStorage.getItem('user_country_code') || localStorage.getItem('user_country');
          if (country) {
            this.setCurrencyByCountry(country);
          }
        }
      };

      window.addEventListener('deliveryModeChanged', handleModeChange);
      document.addEventListener('deliveryModeChanged', handleModeChange);

      // Listen to cart changes
      window.addEventListener('cartUpdated', () => {
        setTimeout(() => this.updateDOM(), 100);
      });
    }

    observeDOM() {
      // Safely observe dynamically added Element nodes
      const observer = new MutationObserver((mutations) => {
        if (this.isUpdating) return;
        let shouldUpdate = false;

        for (const m of mutations) {
          for (const node of m.addedNodes) {
            // Only check Element nodes (nodeType === 1), ignoring Text nodes
            if (node.nodeType === 1) {
              if (node.hasAttribute && node.hasAttribute('data-base-price')) {
                shouldUpdate = true;
                break;
              }
              if (node.querySelector && node.querySelector('[data-base-price]')) {
                shouldUpdate = true;
                break;
              }
            }
          }
          if (shouldUpdate) break;
        }

        if (shouldUpdate) {
          if (this._raf) cancelAnimationFrame(this._raf);
          this._raf = requestAnimationFrame(() => this.updateDOM());
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.FloralCurrencyManager = new CurrencyManager();
})();

// Filter collection grids based on city for choc-gifting
(function() {
  function applyCityFilters() {
    const savedCity = (localStorage.getItem('user_city') || '').toLowerCase().trim();
    const mode = localStorage.getItem('delivery_mode') || 'india';
    const allowedCities = ['delhi', 'new delhi', 'mumbai', 'kolkata', 'pune', 'bangalore', 'bengaluru'];
    
    document.querySelectorAll('.product-card').forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase();
      // Only parse exactly as chocolate and gifting
      const tagArray = tags.split(',').map(t => t.trim());
      const hasChoc = tagArray.includes('chocolate') || tagArray.includes('chocolates');
      const hasGifting = tagArray.includes('gifting');
      const isChocGifting = hasChoc && hasGifting;
      
      let shouldHide = false;
      if (isChocGifting) {
        if (mode === 'international') {
          shouldHide = true;
        } else if (savedCity && !allowedCities.some(c => savedCity.includes(c))) {
          shouldHide = true;
        }
      }
      
      if (shouldHide) {
        if (card.parentElement && (card.parentElement.classList.contains('anim-scale') || card.parentElement.classList.contains('swiper-slide'))) {
          card.parentElement.style.display = 'none';
        } else {
          card.style.display = 'none';
        }
      } else {
        if (card.parentElement && (card.parentElement.classList.contains('anim-scale') || card.parentElement.classList.contains('swiper-slide'))) {
          card.parentElement.style.display = '';
        } else {
          card.style.display = '';
        }
      }
    });
  }

  const onReady = () => {
    applyCityFilters();
    window.addEventListener('countryUpdated', applyCityFilters);
    document.addEventListener('pincodeUpdated', applyCityFilters);
    window.addEventListener('deliveryModeChanged', applyCityFilters);
    document.addEventListener('deliveryModeChanged', applyCityFilters);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
