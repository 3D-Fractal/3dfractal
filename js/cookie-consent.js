/* ============================================================
   3D Fractal — Cookie Consent Manager (GDPR / Consent Mode v2)
   ============================================================ */
(function () {
  var STORAGE_KEY = '3df-consent';

  /* ── Storage helpers (localStorage + cookie fallback for iOS private) ── */
  function getConsent() {
    try {
      var ls = localStorage.getItem(STORAGE_KEY);
      if (ls) return JSON.parse(ls);
    } catch (e) {}
    // Cookie fallback
    try {
      var match = document.cookie.match('(^|;)\\s*' + STORAGE_KEY + '=([^;]+)');
      if (match) return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {}
    return null;
  }

  function saveConsent(obj) {
    var val = JSON.stringify(obj);
    try { localStorage.setItem(STORAGE_KEY, val); } catch (e) {}
    // Cookie fallback — 365 days
    try {
      var exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      document.cookie = STORAGE_KEY + '=' + encodeURIComponent(val) +
        '; expires=' + exp.toUTCString() + '; path=/; SameSite=Lax';
    } catch (e) {}
    // Mark html element so CSS can hide banner immediately on next load
    document.documentElement.setAttribute('data-consent', 'given');
  }

  function applyConsent(obj) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage:  obj.analytics ? 'granted' : 'denied',
        ad_storage:         'denied',
        ad_user_data:       'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function hideBanner() {
    var b = document.getElementById('cookieBanner');
    if (!b) return;
    b.style.opacity = '0';
    setTimeout(function () { b.style.display = 'none'; }, 300);
  }

  function showBanner() {
    var b = document.getElementById('cookieBanner');
    if (!b) return;
    b.style.display = 'flex';
    setTimeout(function () { b.style.opacity = '1'; }, 10);
  }

  window.dfConsent = {
    acceptAll: function () {
      var obj = { analytics: true };
      saveConsent(obj);
      applyConsent(obj);
      hideBanner();
    },

    rejectAll: function () {
      var obj = { analytics: false };
      saveConsent(obj);
      applyConsent(obj);
      hideBanner();
    },

    customize: function () {
      var panel = document.getElementById('cookieCustomizePanel');
      if (!panel) return;
      var isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
    },

    saveCustom: function () {
      var el = document.getElementById('consentAnalytics');
      var obj = { analytics: el ? el.checked : false };
      saveConsent(obj);
      applyConsent(obj);
      hideBanner();
    },

    openPreferences: function () {
      showBanner();
      var panel = document.getElementById('cookieCustomizePanel');
      if (panel) panel.style.display = 'block';
    }
  };

  function checkConsent() {
    var saved = getConsent();
    var banner = document.getElementById('cookieBanner');
    if (saved === null) {
      showBanner();
    } else {
      applyConsent(saved);
      // Force banner hidden — handles bfcache restore on iOS Safari
      if (banner) { banner.style.display = 'none'; banner.style.opacity = '0'; }
      var el = document.getElementById('consentAnalytics');
      if (el && saved.analytics) el.checked = true;
    }
  }

  // Run immediately (fresh load — banner element already exists in DOM above this script)
  checkConsent();

  // Also re-run on bfcache restore (iOS Safari back/forward navigation)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) checkConsent();
  });
})();
