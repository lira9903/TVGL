// The Vantage Growth Lab — Google Analytics 4 behind a cookie consent banner.
// Privacy-strict: gtag.js is only fetched after the visitor clicks Accept. With no choice or Decline,
// nothing is requested from Google. Calls to gtag() before that just queue up locally in dataLayer.
(function () {
  var GA_ID = "G-WRTLB3LY45";
  var KEY = "vgl_consent"; // "granted" | "denied"

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  // Consent Mode v2 defaults, so GA stays denied even if it were loaded some other way.
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  gtag("js", new Date());
  gtag("config", GA_ID);

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  // Remove GA cookies (_ga, _ga_<id>) when consent is withdrawn.
  function clearGACookies() {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  if (getChoice() === "granted") loadGA();

  // ---------- Banner ----------
  var banner;

  function hideBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function showBanner() {
    if (banner) {
      // Already open (no choice made yet): flash it so the click visibly does something.
      banner.classList.remove("cc-banner--flash");
      void banner.offsetWidth;
      banner.classList.add("cc-banner--flash");
      banner.querySelector(".cc-btn--primary").focus();
      return;
    }
    banner = document.createElement("div");
    banner.className = "cc-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<p class="cc-banner__text">We use Google Analytics cookies to understand how visitors use this site. ' +
      'They are only set if you accept. <a href="/privacy/">Privacy policy</a></p>' +
      '<div class="cc-banner__actions">' +
        '<button type="button" class="cc-btn cc-btn--outline" data-cc="denied">Decline</button>' +
        '<button type="button" class="cc-btn cc-btn--primary" data-cc="granted">Accept</button>' +
      "</div>";
    banner.addEventListener("click", function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute("data-cc");
      if (!choice) return;
      saveChoice(choice);
      if (choice === "granted") {
        loadGA();
      } else {
        gtag("consent", "update", { analytics_storage: "denied" });
        clearGACookies();
      }
      hideBanner();
    });
    document.body.appendChild(banner);
  }

  // Lets the privacy page reopen the banner so visitors can change their choice.
  window.vglCookieSettings = showBanner;

  if (!getChoice()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner);
    else showBanner();
  }
})();
