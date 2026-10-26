/* ==========================================================================
   XYZ Weddings — site behaviour (vanilla JS, no dependencies)
   1. Header scroll state          5. Hero parallax
   2. Mobile menu                  6. Pinned story cards
   3. Scroll reveal                7. Enquiry form
   4. Footer year
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. Header scroll state ---------- */
  var header = $("#site-header");
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  }

  /* ---------- 2. Mobile menu ---------- */
  var menu = $("#mobile-menu");
  var openBtn = $("#menu-open");
  var closeBtn = $("#menu-close");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
    if (open) closeBtn.focus(); else if (document.activeElement === closeBtn) openBtn.focus();
  }
  openBtn.addEventListener("click", function () { setMenu(true); });
  closeBtn.addEventListener("click", function () { setMenu(false); });
  $$("[data-close-menu]").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- 3. Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 4. Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 5. Hero parallax + 6. Pinned story cards (one rAF loop) ---------- */
  var heroSection = $("#home");
  var heroMedia = $("#hero-media");
  var heroContent = $("#hero-content");
  var storyWraps = $$(".story-card-wrap");
  var desktopMq = window.matchMedia("(min-width: 1024px)");
  var ticking = false;

  function updateHero() {
    if (reduceMotion.matches) {
      heroMedia.style.transform = "";
      heroContent.style.opacity = "";
      return;
    }
    var h = heroSection.offsetHeight;
    var p = clamp(window.scrollY / h, 0, 1);
    heroMedia.style.transform =
      "translate3d(0," + (p * 14).toFixed(2) + "%,0) scale(" + (1 + p * 0.12).toFixed(4) + ")";
    heroContent.style.opacity = clamp(1 - p / 0.8, 0, 1).toFixed(3);
  }

  function updateStories() {
    var pinned = desktopMq.matches && !reduceMotion.matches;
    var vh = window.innerHeight;
    storyWraps.forEach(function (wrap, i) {
      var card = wrap.firstElementChild;
      var next = storyWraps[i + 1];
      if (!pinned || !next) {
        card.style.transform = "";
        card.style.filter = "";
        return;
      }
      // Progress = how much the NEXT card has slid over this (pinned) one:
      // 0 when its top edge reaches my bottom edge, 1 when it reaches my top.
      var top = wrap.getBoundingClientRect().top;
      var bottom = top + wrap.offsetHeight;
      var nextTop = next.getBoundingClientRect().top;
      var p = clamp((bottom - nextTop) / Math.max(1, bottom - top), 0, 1);
      card.style.transform = "scale(" + (1 - 0.1 * p).toFixed(4) + ")";
      // Dim (not fade) so the card underneath never shows through.
      card.style.filter = "brightness(" + (1 - 0.4 * p).toFixed(3) + ")";
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      updateHero();
      updateStories();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  desktopMq.addEventListener("change", onScroll);
  reduceMotion.addEventListener("change", onScroll);
  onScroll();

  /* ---------- 7. Enquiry form ---------- */
  var form = $("#enquiry-form");
  var statusEl = $("#form-status");
  var submitBtn = $("#submit-btn");
  var submitLabel = $("#submit-label");
  var waLink = $("#wa-form-link");
  var PHONE_RE = /^[+]?[\d][\d\s\-()]{7,17}$/;
  var BRAND = "XYZ Weddings";

  var dateInput = $("#weddingDate");
  if (dateInput) {
    var t = new Date();
    dateInput.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  }

  function values() {
    var out = {};
    ["name", "partnerName", "phone", "weddingDate", "location", "eventType", "message"].forEach(function (k) {
      out[k] = (form.elements[k].value || "").trim();
    });
    return out;
  }

  function buildWhatsAppText(v, full) {
    var text = "Hi " + BRAND + ", I'd like to check your availability.";
    if (v.weddingDate) text += " Our wedding date is " + v.weddingDate + ".";
    if (v.location) text += " Location: " + v.location + ".";
    if (full) {
      if (v.eventType) text += " Enquiry: " + v.eventType + ".";
      if (v.partnerName) text += " Partner: " + v.partnerName + ".";
      if (v.phone) text += " Phone: " + v.phone + ".";
      if (v.message) text += " " + v.message;
    }
    if (v.name) text += " — " + v.name;
    return text;
  }

  function waUrl(text) {
    return "https://wa.me/" + form.dataset.whatsapp + "?text=" + encodeURIComponent(text);
  }

  // Keep the "Enquire on WhatsApp" button in sync with what has been typed.
  form.addEventListener("input", function () {
    waLink.href = waUrl(buildWhatsAppText(values(), false));
  });

  function setError(id, msg) {
    var input = $("#" + id);
    var err = $("#" + id + "-error");
    var field = input.closest(".field");
    field.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) { err.hidden = !msg; err.textContent = msg || ""; }
  }

  function validate(v) {
    var ok = true;
    var checks = {
      name: v.name.length < 2 ? "Please tell us your name." : "",
      phone: !PHONE_RE.test(v.phone) ? "Enter a valid phone number (e.g. +91 98765 43210)." : "",
      weddingDate: !v.weddingDate ? "Please choose a date." : "",
      location: v.location.length < 2 ? "Where is the celebration?" : ""
    };
    Object.keys(checks).forEach(function (id) {
      setError(id, checks[id]);
      if (checks[id]) ok = false;
    });
    if (!ok) {
      var firstBad = $(".field.has-error input", form);
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  function setStatus(kind, msg) {
    statusEl.className = "form-status" + (kind ? " " + kind : "");
    statusEl.textContent = msg || "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = values();
    setStatus("", "");
    if (!validate(v)) return;

    var endpoint = (form.dataset.endpoint || "").trim();

    // No backend configured → hand the enquiry over via WhatsApp (no fake "success").
    if (!endpoint) {
      window.open(waUrl(buildWhatsAppText(v, true)), "_blank", "noopener");
      setStatus("ok", "Opening WhatsApp with your details — just press send to reach us.");
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(v)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        waLink.href = waUrl(buildWhatsAppText(values(), false));
        submitLabel.textContent = "Enquiry Received";
        setStatus("ok", "Thank you — your enquiry has been received. We usually reply within 24 hours.");
      })
      .catch(function () {
        submitLabel.textContent = "Send Enquiry";
        setStatus("err", "We couldn't send your enquiry. Please try WhatsApp instead.");
      })
      .then(function () { submitBtn.disabled = false; });
  });
})();
