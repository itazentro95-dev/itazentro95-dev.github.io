/* Abdulla Al Hossain — portfolio interactions. Motion is gated: nothing arms under reduced motion. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  var WA = "https://wa.me/8801343031625?text=Hello%20Abdulla%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20talk%20about%20my%20business.";

  /* Accordions: panels are open in the HTML so the page is complete without this script.
     On init, collapse all except the first service panel or a hash target. */
  function setupAccordion(scope, opts) {
    var items = Array.prototype.slice.call(scope.querySelectorAll(".acc, .faq-acc"));
    items.forEach(function (item) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        setItem(item, !open);
        if (!open && opts && opts.hash && panel.id) {
          try { history.replaceState(null, "", "#" + panel.id); } catch (e) {}
        }
      });
    });
    function setItem(item, open) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { panel.removeAttribute("hidden"); } else { panel.setAttribute("hidden", ""); }
      item.classList.toggle("spot-on", false);
    }
    return { items: items, setItem: setItem };
  }
  var services = document.getElementById("services");
  var svc = services ? setupAccordion(services, { hash: true }) : null;
  var faq = document.getElementById("faq");
  if (faq) setupAccordion(faq, { hash: false });
  if (faq) {
    Array.prototype.forEach.call(faq.querySelectorAll(".faq-acc"), function (item) {
      var btn = item.querySelector(".acc-btn"), panel = item.querySelector(".acc-panel");
      btn.setAttribute("aria-expanded", "false"); panel.setAttribute("hidden", "");
    });
  }
  function openFromHash() {
    if (!svc || !location.hash) return false;
    var target = null;
    svc.items.forEach(function (item) {
      var panel = item.querySelector(".acc-panel");
      if (panel && ("#" + panel.id) === location.hash) target = item;
    });
    if (!target) return false;
    svc.items.forEach(function (item) { svc.setItem(item, item === target); });
    setTimeout(function () { target.scrollIntoView({ block: "start" }); }, 30);
    return true;
  }
  if (svc) {
    if (!openFromHash()) {
      svc.items.forEach(function (item, i) { svc.setItem(item, i === 0); });
    }
  }

  /* Gallery filter: single-select pills, hash-persisted, aria-live count. */
  var pills = Array.prototype.slice.call(document.querySelectorAll(".pill"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".gal-card"));
  var status = document.getElementById("gal-status");
  function applyFilter(code, skipHash) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = code === "all" || card.getAttribute("data-country") === code;
      if (match) { card.removeAttribute("hidden"); shown++; } else { card.setAttribute("hidden", ""); }
    });
    pills.forEach(function (pill) {
      pill.setAttribute("aria-pressed", pill.getAttribute("data-filter") === code ? "true" : "false");
    });
    var active = document.querySelector('.pill[data-filter="' + code + '"]');
    var label = active ? active.getAttribute("data-label") : "All countries";
    if (status) status.textContent = "Showing " + shown + " live demo websites — " + label + ".";
    if (!skipHash) {
      try { history.replaceState(null, "", code === "all" ? "#gallery" : "#gallery-" + code); } catch (e) {}
    }
  }
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () { applyFilter(pill.getAttribute("data-filter"), false); });
  });
  var galCode = "all";
  if (location.hash.indexOf("#gallery-") === 0 && location.hash.length === 10) {
    var code = location.hash.slice(9);
    if (document.querySelector('.pill[data-filter="' + code + '"]')) galCode = code;
  }
  applyFilter(galCode, true);

  /* Sticky mobile bar: shows after the hero CTA scrolls off, hides at the closing band. */
  var bar = document.getElementById("sticky-bar");
  var heroCta = document.getElementById("hero-cta");
  var foot = document.getElementById("contact");
  if (bar && heroCta && "IntersectionObserver" in window) {
    var heroSeen = true, footSeen = false;
    function syncBar() {
      var show = !heroSeen && !footSeen;
      bar.classList.toggle("show", show);
      document.body.classList.toggle("has-bar", show);
    }
    new IntersectionObserver(function (en) { heroSeen = en[0].isIntersecting; syncBar(); }).observe(heroCta);
    if (foot) new IntersectionObserver(function (en) { footSeen = en[0].isIntersecting; syncBar(); }).observe(foot);
  }

  /* Copy email */
  var copyBtn = document.getElementById("copy-email");
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText("ita.zentro95@gmail.com").then(function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = "Copy email"; }, 2000);
      });
    });
  } else if (copyBtn) { copyBtn.style.display = "none"; }

  if (reduced) return; /* Everything below is motion. */

  /* Scrollspy: gold scaleX indicator via the active class. */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a[data-spy]"));
  if (spyLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spyLinks.forEach(function (link) {
      var sec = document.querySelector(link.getAttribute("href"));
      if (sec) spy.observe(sec);
    });
  }

  /* One word-reveal: the story opening line only, visible by default. */
  var reveal = document.querySelector(".reveal-line");
  if (reveal && "IntersectionObserver" in window) {
    var words = reveal.textContent.trim().split(/\s+/);
    reveal.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.style.setProperty("--d", Math.min(i * 30, 690) + "ms");
      span.textContent = word;
      reveal.appendChild(span);
      reveal.appendChild(document.createTextNode(" "));
    });
    var ro = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { reveal.classList.add("on"); ro.disconnect(); }
    }, { threshold: 0.4 });
    ro.observe(reveal);
  }

  /* Process beam: one-shot draw on entry. */
  var beam = document.querySelector(".beam");
  if (beam && "IntersectionObserver" in window) {
    var bo = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { beam.classList.add("on"); bo.disconnect(); }
    }, { threshold: 0.25 });
    bo.observe(beam);
  }

  /* Shared lerped rAF loop: ghost-ring parallax, monogram tilt, closed-row spotlight. */
  var mark = document.querySelector(".mark-card");
  var ghosts = Array.prototype.slice.call(document.querySelectorAll(".ghost"));
  var tiltX = 0, tiltY = 0, curX = 0, curY = 0, drift = 0, driftCur = 0, rafId = null, spotItem = null;
  function loop() {
    curX += (tiltX - curX) * 0.1; curY += (tiltY - curY) * 0.1; driftCur += (drift - driftCur) * 0.1;
    if (mark && finePointer) {
      mark.style.transform = "perspective(900px) rotateX(" + curY.toFixed(2) + "deg) rotateY(" + curX.toFixed(2) + "deg)";
    }
    ghosts.forEach(function (g, i) {
      var base = i === 0 ? 14 : 28;
      g.style.transform = "translate(" + (base + driftCur).toFixed(1) + "px," + (-base - driftCur).toFixed(1) + "px)";
    });
    if (Math.abs(tiltX - curX) > 0.01 || Math.abs(tiltY - curY) > 0.01 || Math.abs(drift - driftCur) > 0.05) {
      rafId = requestAnimationFrame(loop);
    } else { rafId = null; if (mark) mark.style.willChange = "auto"; }
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(loop); }
  if (mark && finePointer) {
    var stage = document.querySelector(".mark-stage");
    stage.addEventListener("pointermove", function (ev) {
      var r = stage.getBoundingClientRect();
      tiltX = ((ev.clientX - r.left) / r.width - 0.5) * 8;
      tiltY = -((ev.clientY - r.top) / r.height - 0.5) * 8;
      kick();
    });
    stage.addEventListener("pointerleave", function () { tiltX = 0; tiltY = 0; kick(); });
  }
  if (ghosts.length && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { drift = en[0].isIntersecting ? 5 : 0; kick(); }).observe(document.querySelector(".hero"));
  }
  if (services && finePointer) {
    Array.prototype.forEach.call(services.querySelectorAll(".acc"), function (item) {
      var btn = item.querySelector(".acc-btn");
      btn.addEventListener("pointermove", function (ev) {
        if (btn.getAttribute("aria-expanded") === "true") { item.classList.remove("spot-on"); return; }
        var r = btn.getBoundingClientRect();
        item.style.setProperty("--mx", (ev.clientX - r.left) + "px");
        item.style.setProperty("--my", (ev.clientY - r.top) + "px");
        item.classList.add("spot-on"); spotItem = item;
      });
      btn.addEventListener("pointerleave", function () { item.classList.remove("spot-on"); });
    });
  }
})();
