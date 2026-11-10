// The Vantage Growth Lab — page behaviour (waitlist form + scroll-reveal fallback).

/* ---------- Waitlist form (Web3Forms) ----------
   Submits in the background and shows the inline success state from the design.
   Without JavaScript the form posts normally and Web3Forms redirects to /thanks/. */
(function () {
  var form = document.getElementById("wl-form"), done = document.getElementById("wl-done"), again = document.getElementById("wl-again");
  if (!form) return;
  var err = document.createElement("p");
  err.className = "wl-err";
  err.setAttribute("role", "alert");
  err.textContent = "Something went wrong. Please try again in a moment.";
  form.appendChild(err);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    err.classList.remove("show");

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    delete data.redirect; // only used by the no-JS fallback

    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message || "Submission failed");
        // GA4 lead. Only reaches Google if the visitor accepted cookies (see consent.js).
        if (window.gtag) gtag("event", "generate_lead", { form_name: "waitlist", interest: data.interest });
        btn.disabled = false;
        form.reset();
        form.hidden = true;
        done.hidden = false;
      })
      .catch(function () { btn.disabled = false; err.classList.add("show"); });
  });

  again.addEventListener("click", function () { done.hidden = true; form.hidden = false; });
})();

/* ---------- Scroll-reveal fallback for browsers without CSS scroll-driven animations ---------- */
(function () {
  var ok = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  if (ok || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("no-sdt");
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv,.trackfill").forEach(function (el) { io.observe(el); });
})();
