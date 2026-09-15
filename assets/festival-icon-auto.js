/**
 * Country-Aware Festival Nav Auto-Sync Script
 * Dynamically filters pre-rendered festivals for the selected country and updates the active festival icons/names.
 */
(function () {
  function syncFestivalNav(eventDetail) {
    const mode = (eventDetail && eventDetail.mode) ? eventDetail.mode : (localStorage.getItem('delivery_mode') || 'india');
    let countryCode = (eventDetail && eventDetail.countryCode) ? eventDetail.countryCode : (localStorage.getItem('user_country_code') || localStorage.getItem('intl_country') || 'IN');

    if (mode === 'india') {
      countryCode = 'IN';
    }

    const allFestivals = window.__allFestivalsData || [];
    if (!allFestivals.length) return;

    // Filter festivals based on region
    const validFestivals = allFestivals.filter(f => {
      if (f.region === 'ALL') return true;
      if (mode === 'india' && f.region === 'IN') return true;
      if (mode === 'international' && f.region.toUpperCase() === countryCode.toUpperCase()) return true;
      return false;
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Find upcoming valid festivals
    const upcomingValid = validFestivals.filter(f => f.date >= todayStr);
    if (!upcomingValid.length) return;

    const activeFest = upcomingValid[0];
    
    // Let's only show festivals from the same month as the active festival, or at most 5 festivals total
    const activeMonth = activeFest.date.split('-')[1];
    let displayHandles = [];
    
    for (let f of upcomingValid) {
      const fMonth = f.date.split('-')[1];
      if (fMonth === activeMonth || displayHandles.length < 3) {
        displayHandles.push(f.short);
      }
    }

    // Hide/Show pre-rendered list items in the dropdowns
    const listItems = document.querySelectorAll('.fest-nav-li');
    listItems.forEach(li => {
      const short = li.getAttribute('data-festival-short');
      if (displayHandles.includes(short)) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonthName = monthNames[parseInt(activeMonth, 10) - 1];

    // Update Category Circle Nav festival button
    const catNavIcon = document.querySelector('.category-circles-festival-icon');
    const catNavName = document.querySelector('.category-circles-festival-name');
    if (catNavIcon) catNavIcon.textContent = activeFest.icon;
    if (catNavName) catNavName.textContent = activeFest.short;

    // Update Month Badges
    const monthBadges = document.querySelectorAll('.fest-calendar-month-badge');
    monthBadges.forEach(badge => {
      badge.textContent = activeMonthName;
    });

    // Update Header Nav festival button
    const headerNavIcons = document.querySelectorAll('.fest-icon');
    const headerNavNames = document.querySelectorAll('.fest-name');
    headerNavIcons.forEach(icon => icon.textContent = activeFest.icon);
    headerNavNames.forEach(name => name.textContent = activeFest.short);
  }

  document.addEventListener('DOMContentLoaded', syncFestivalNav);
  document.addEventListener('deliveryModeChanged', function (e) {
    syncFestivalNav(e.detail);
  });
  window.syncFestivalNav = syncFestivalNav;
})();
