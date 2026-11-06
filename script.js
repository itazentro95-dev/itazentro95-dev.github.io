/* Abdulla Al Hossain — Behance-style portfolio interactions.
   Panels are open in the authored HTML: without this script the page is the complete document.
   Enhancement only collapses, filters, or adds motion. No height animation anywhere.
   Motion + 3D elevation (2026-11-06): word-reveal dividers, tilt-in reveals,
   count-up counters, hero depth planes + 3D seal tilt, sparkle scroll drift,
   contents-numeral parallax, gallery pointer tilt, per-character text-roll.
   Everything motion is transform/opacity only and lives below the motion gate;
   window.__SETTLED__ (QC capture copies only) disables all of it. */
(function () {
  "use strict";
  var motionOK = document.documentElement.classList.contains("motion-ok");
  var settledCopy = !!window.__SETTLED__;

  /* ---------- Accordions (services: one open per family; FAQ: one open) ---------- */
  function setupAccordion(items, opts) {
    function setItem(item, open, focusBtn) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      if (!btn || !panel) return;
      if (!open && panel.contains(document.activeElement)) btn.focus();
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.removeAttribute("hidden");
        if (motionOK) {
          panel.classList.remove("opening");
          void panel.offsetWidth;
          panel.classList.add("opening");
        }
      } else {
        panel.setAttribute("hidden", "");
        panel.classList.remove("opening");
      }
      if (focusBtn) btn.focus();
    }
    items.forEach(function (item) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      if (!btn || !panel) return;
      btn.setAttribute("aria-expanded", "true");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        if (!open && opts.groupOf) {
          var group = opts.groupOf(item);
          items.forEach(function (other) {
            if (other !== item && opts.groupOf(other) === group) setItem(other, false);
          });
        }
        setItem(item, !open);
        if (!open && opts.hash && panel.id) {
          var art = item.closest("article");
          var target = art && art.id ? art.id : panel.id;
          try { history.replaceState(null, "", "#" + target); } catch (e) {}
        } else if (open && opts.hash && opts.familyHash) {
          var fam = item.closest(".family");
          if (fam && fam.id) { try { history.replaceState(null, "", "#" + fam.id); } catch (e) {} }
        }
      });
      item.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        if (btn.getAttribute("aria-expanded") === "true") {
          setItem(item, false, true);
          ev.stopPropagation();
        }
      });
    });
    return { items: items, setItem: setItem };
  }

  var serviceItems = Array.prototype.slice.call(document.querySelectorAll("#services .acc"));
  var svc = setupAccordion(serviceItems, {
    hash: true,
    groupOf: function (item) { var f = item.closest(".family"); return f ? f.id : "services"; }
  });
  var faqItems = Array.prototype.slice.call(document.querySelectorAll("#faq .acc"));
  setupAccordion(faqItems, { hash: false, groupOf: function () { return "faq"; } });
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".acc-btn"), panel = item.querySelector(".acc-panel");
    btn.setAttribute("aria-expanded", "false"); panel.setAttribute("hidden", "");
  });

  function openFromHash() {
    if (!location.hash) return false;
    var target = null;
    serviceItems.forEach(function (item) {
      if ("#" + item.id === location.hash) target = item;
    });
    if (!target) return false;
    serviceItems.forEach(function (item) {
      if (item === target) svc.setItem(item, true);
      else svc.setItem(item, false);
    });
    return true;
  }
  if (svc) {
    if (!openFromHash()) {
      serviceItems.forEach(function (item, i) { svc.setItem(item, i === 0); });
    }
  }
  window.addEventListener("hashchange", function () { openFromHash(); });

  /* ---------- Gallery filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chipbtn"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".g-card"));
  var status = document.querySelector(".g-status");
  function applyFilter(code) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = code === "all" ||
        (code === "beyond" ? card.getAttribute("data-region") === "beyond"
                           : card.getAttribute("data-country") === code);
      if (match) { card.removeAttribute("hidden"); shown++; }
      else { card.setAttribute("hidden", ""); }
    });
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-filter") === code ? "true" : "false");
    });
    var active = document.querySelector('.chipbtn[data-filter="' + code + '"]');
    var label = active ? active.getAttribute("data-label") : "All countries";
    if (status) status.textContent = "Showing " + shown + " live demo websites — " + label + ".";
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { applyFilter(chip.getAttribute("data-filter")); });
  });

  /* ---------- Copy email ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-email]"), function (btn) {
    if (!navigator.clipboard) { btn.style.display = "none"; return; }
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText("ita.zentro95@gmail.com").then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy email"; }, 2000);
      });
    });
  });

  /* ---------- Sticky mini header + mobile WhatsApp bar ---------- */
  var mini = document.getElementById("mini-head");
  var bar = document.getElementById("wa-bar");
  var hero = document.querySelector(".hero");
  var heroCta = document.getElementById("hero-cta");
  var closing = document.getElementById("contact");
  if ("IntersectionObserver" in window) {
    var heroGone = false, ctaGone = false, closingSeen = false;
    function sync() {
      if (mini) mini.classList.toggle("show", heroGone);
      if (bar) bar.classList.toggle("show", ctaGone && !closingSeen);
    }
    if (hero && mini) new IntersectionObserver(function (en) { heroGone = !en[0].isIntersecting; sync(); }).observe(hero);
    if (heroCta && bar) new IntersectionObserver(function (en) { ctaGone = !en[0].isIntersecting; sync(); }).observe(heroCta);
    if (closing && bar) new IntersectionObserver(function (en) { closingSeen = en[0].isIntersecting; sync(); }).observe(closing);
  }

  if (!motionOK || settledCopy) return; /* Everything below is motion. */

  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Word-by-word reveal for the script dividers ---------- */
  var wrTargets = Array.prototype.slice.call(document.querySelectorAll(".sec-script, .thank-script"));
  wrTargets.forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    if (!words.length) return;
    el.setAttribute("aria-label", words.join(" "));
    el.textContent = "";
    words.forEach(function (w, i) {
      var wrap = document.createElement("span");
      wrap.className = "wrev";
      wrap.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "wrev-in";
      inner.style.setProperty("--wd", (i * 90) + "ms");
      inner.textContent = w;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    var head = el.closest(".sec-head");
    if (head) { head.classList.remove("reveal"); head.classList.add("wr-head"); }
  });
  if ("IntersectionObserver" in window) {
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          var head = en.target.closest(".sec-head");
          if (head) head.classList.add("is-in");
          wio.unobserve(en.target);
        }
      });
    }, { threshold: 0.3, rootMargin: "0px 0px -6% 0px" });
    wrTargets.forEach(function (el) { wio.observe(el); });
  } else {
    wrTargets.forEach(function (el) {
      el.classList.add("is-in");
      var head = el.closest(".sec-head");
      if (head) head.classList.add("is-in");
    });
  }

  /* ---------- Once-only reveals + tilt-ins (staggered per viewport batch) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal, .tilt-in"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          en.target.style.setProperty("--rd", (i * 80) + "ms");
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Counters: count up once in view (static values are the no-JS state) ---------- */
  var cnums = Array.prototype.slice.call(document.querySelectorAll(".cnum"));
  if (cnums.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, target = parseInt(el.textContent, 10) || 0, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 900);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * e));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    cnums.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Marquee: pause off-screen and in hidden tabs ---------- */
  var marquee = document.querySelector(".marquee");
  if (marquee && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      marquee.classList.toggle("is-off", !en[0].isIntersecting);
    }).observe(marquee);
    document.addEventListener("visibilitychange", function () {
      marquee.classList.toggle("is-off", document.hidden);
    });
  }

  /* ---------- Hero depth engine: pointer tilt + scroll planes + sparkle drift ----------
     One paint() writes every transform from shared state (cnx/cny lerped pointer,
     prog = hero scroll progress). Transform/opacity only. */
  var stage = document.querySelector(".hero-stage");
  var planes = Array.prototype.slice.call(document.querySelectorAll(".hero [data-depth]"));
  var sparks = Array.prototype.slice.call(document.querySelectorAll(".hero .spark"));
  var seal3d = document.querySelector(".seal3d");
  var nums = Array.prototype.slice.call(document.querySelectorAll(".c-num"));
  var numRates = [-14, 10, -8, 16, -12];
  var nx = 0, ny = 0, cnx = 0, cny = 0, prog = 0, rafId = null, pointerDead = false;

  function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }
  function paint() {
    planes.forEach(function (p) {
      var d = parseFloat(p.getAttribute("data-depth")) || 0;
      var t = "translate3d(" + (cnx * d).toFixed(1) + "px," + (cny * d - prog * d * 2.2).toFixed(1) + "px,0)";
      if (p === seal3d) {
        t += " rotateX(" + (-cny * 5).toFixed(2) + "deg) rotateY(" + (cnx * 5).toFixed(2) + "deg)";
        seal3d.style.setProperty("--gx", (32 + cnx * 20).toFixed(1) + "%");
        seal3d.style.setProperty("--gy", (26 + cny * 14).toFixed(1) + "%");
      }
      p.style.transform = t;
    });
    var sparkDepths = [0.3, 0.6, 0.45, 1.0];
    sparks.forEach(function (s, i) {
      var d = sparkDepths[i % sparkDepths.length];
      var sd = parseFloat(s.getAttribute("data-sdrift")) || 0;
      s.style.transform = "translate(" + clamp(cnx * 8 * d, 8).toFixed(1) + "px," +
        (clamp(cny * 8 * d, 8) + prog * sd).toFixed(1) + "px) rotate(" + clamp(cnx * 4 * d, 4).toFixed(1) + "deg)";
    });
  }
  function numPaint() {
    var vh = window.innerHeight;
    nums.forEach(function (n, i) {
      var link = n.closest(".c-link") || n;
      var r = link.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) return;
      var c = (r.top + r.height / 2 - vh / 2) / vh;
      n.style.transform = "translateY(" + (c * numRates[i % numRates.length]).toFixed(1) + "px)";
    });
  }
  function loop() {
    cnx += (nx - cnx) * 0.09; cny += (ny - cny) * 0.09;
    paint();
    if (Math.abs(nx - cnx) > 0.002 || Math.abs(ny - cny) > 0.002) { rafId = requestAnimationFrame(loop); }
    else { rafId = null; }
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(loop); }
  var scrollTick = false;
  function onScroll() {
    var h = hero ? hero.offsetHeight : 1;
    prog = Math.max(0, Math.min(1, window.scrollY / h));
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(function () { scrollTick = false; paint(); numPaint(); });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (stage && finePointer) {
    stage.addEventListener("pointermove", function (ev) {
      if (pointerDead) return;
      var r = stage.getBoundingClientRect();
      nx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      ny = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    stage.addEventListener("pointerleave", function () { nx = 0; ny = 0; kick(); });
    window.addEventListener("touchstart", function () {
      pointerDead = true; nx = 0; ny = 0; kick();
    }, { once: true, passive: true });
  }
  /* The load animations own the script/round transforms until they finish;
     hand them to the parallax engine on animationend. */
  [".hero-script", ".hero-round"].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) el.addEventListener("animationend", function () { el.style.animation = "none"; });
  });

  /* ---------- Gallery cards: subtle pointer tilt (desktop, after reveal) ---------- */
  if (hoverFine) {
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (ev) {
        if (!card.classList.contains("is-in")) return;
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform 160ms ease-out";
        card.style.transform = "perspective(800px) rotateX(" + (-py * 3).toFixed(2) + "deg) rotateY(" + (px * 3).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform 350ms cubic-bezier(.22,1,.36,1)";
        card.style.transform = "";
      });
    });
  }

  /* ---------- Per-character text-roll: footer/contact links (fine pointer only) ---------- */
  if (hoverFine) {
    Array.prototype.forEach.call(document.querySelectorAll(".fl-link, .soc, .mail-line"), function (link) {
      if (link.children.length || !link.textContent.trim()) return;
      var text = link.textContent;
      link.setAttribute("aria-label", text.trim());
      link.classList.add("roll-link");
      link.textContent = "";
      var wrap = document.createElement("span");
      wrap.setAttribute("aria-hidden", "true");
      text.split("").forEach(function (ch, i) {
        var c = document.createElement("span");
        c.className = "rch";
        var inn = document.createElement("span");
        inn.className = "rch-in";
        inn.style.transitionDelay = (i * 16) + "ms";
        var disp = ch === " " ? " " : ch;
        var a = document.createElement("i"); a.textContent = disp;
        var b = document.createElement("i"); b.textContent = disp;
        inn.appendChild(a); inn.appendChild(b);
        c.appendChild(inn); wrap.appendChild(c);
      });
      link.appendChild(wrap);
    });
  }
})();
