/* =========================================================================
   hero.js
   Header + Hero behaviour ported from indextocopy.html.
   Requires GSAP, ScrollTrigger and Lenis (loaded in index.html <head>).
   ========================================================================= */
(function () {
  "use strict";

  var containerEl = document.getElementById("container");
  var loaderEl = document.querySelector(".loader");

  /* Fail-safe: if the animation libraries did not load, just show the page. */
  if (!window.gsap || !window.ScrollTrigger) {
    if (containerEl) containerEl.style.opacity = "1";
    if (loaderEl) loaderEl.style.display = "none";
    return;
  }

  var WAVE = { duration: 0.7, ease: [0.48, 0.15, 0.25, 0.96], perChar: 0.02 };
  var EASE = "power2.out";

  /* The wavy nav slides up by exactly one line so the duplicate phrase takes over. */
  function waveOffset(el) {
    var h = el.getBoundingClientRect().height;
    return h > 0 ? h : 15;
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- Smooth scroll (Lenis) ---------------- */
    var lenis = null;
    if (window.Lenis && !reduce) {
      lenis = new window.Lenis({
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5
      });
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    window.__lenis = lenis;

    gsap.registerPlugin(window.ScrollTrigger);

    /* ---------------- Container fade-in ---------------- */
    gsap.to("#container", { opacity: 1, duration: 0, delay: 0.4 });

    /* ---------------- Loader curtain ---------------- */
    var loaderSvgPath = document.querySelector(".loader svg path");

    function linearMap(v, inMin, inMax, outMin, outMax) {
      return (v - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
    }

    function easeCurve(v, outMin, outMax, n) {
      return -Math.abs(outMax - outMin) / 2 * (Math.cos(Math.PI * v / n) - 1) + outMin;
    }

    function setPath(offset) {
      if (!loaderSvgPath || !loaderEl) return;
      var w = window.innerWidth;
      var h = loaderEl.getBoundingClientRect().height;
      loaderSvgPath.setAttributeNS(
        null, "d",
        "M0 0 L" + w + " 0 L" + w + " " + h + " Q" + (w / 2) + " " + (h - offset) + " 0 " + h + " L0 0"
      );
    }

    var loaderStart = null;

    function animateLoader(t) {
      if (loaderStart === null) loaderStart = t;
      var n = t - loaderStart;
      var wave = easeCurve(n, 200, -200, 750);
      setPath(wave);
      loaderEl.style.top = linearMap(n, 0, -(loaderEl.getBoundingClientRect().height - 5), 750) + "px";
      if (n < 750) requestAnimationFrame(animateLoader);
      else loaderEl.style.display = "none";
    }

    if (loaderEl) {
      setPath(200);
      setTimeout(function () {
        if (reduce) { loaderEl.style.display = "none"; return; }
        requestAnimationFrame(animateLoader);
      }, 500);
    }

    /* ---------------- Hero fade on scroll ---------------- */
    var hero = document.querySelector(".hero");
    if (hero) {
      gsap.to(hero, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: hero, scrub: true, start: 0, end: "+=" + (window.innerHeight / 1.8) + "px" }
      });
    }

    /* ---------------- Nav wavy phrases ---------------- */
    document.querySelectorAll(".wavy-phrase-container").forEach(function (waveContainer) {
      var chars = function () {
        return waveContainer.querySelectorAll(".wavy-phrase p");
      };

      function setAnimate(on) {
        var offset = waveOffset(waveContainer);
        chars().forEach(function (p) {
          var index = Array.prototype.indexOf.call(p.parentNode.children, p);
          gsap.to(p, {
            y: on ? -offset : 0,
            duration: WAVE.duration,
            ease: "power3.inOut",
            delay: WAVE.perChar * index
          });
        });
      }

      setTimeout(function () { setAnimate(true); }, 900);
      setTimeout(function () { setAnimate(false); }, 1900);
      waveContainer.addEventListener("mouseenter", function () { setAnimate(true); });
      waveContainer.addEventListener("mouseleave", function () { setAnimate(false); });
    });

    /* ---------------- In-page anchor scrolling ---------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var headerEl = document.querySelector(".header");
        var offset = headerEl ? -(headerEl.getBoundingClientRect().height + 8) : 0;
        if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.2 });
        else {
          var top = target.getBoundingClientRect().top + window.pageYOffset + offset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });

    /* ---------------- Project rows ---------------- */
    var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
    var projectBodies = Array.prototype.slice.call(document.querySelectorAll(".project-body"));
    var activeIndex = -1;

    projects.forEach(function (project, i) {
      var bg = project.querySelector(".background");

      /* line + text reveal */
      var ps = project.querySelectorAll("p");
      ps.forEach(function (p, pi) {
        gsap.fromTo(p, { top: 50 }, {
          top: 0, duration: 0.5, ease: EASE, delay: 0.2 * (pi + 1),
          scrollTrigger: { trigger: project, start: "top 92%", once: true }
        });
      });

      /* hover slide.
         hero.css hides the bar with `transform: translateY(-101%)`, but GSAP
         reads that computed matrix as `y: -39.6px` — the `%` unit is lost in a
         matrix — so a `yPercent` tween stacked on top of it parked the bar ON
         the row (0px) or two rows above it (-202%) instead of off-screen.
         Normalise GSAP's model once: drop the px offset, own the bar with
         yPercent only. */
      if (bg) {
        gsap.set(bg, { y: 0, yPercent: -101 });

        project.addEventListener("mouseenter", function (e) {
          var rect = project.getBoundingClientRect();
          var from = e.clientY < rect.top + rect.height / 2 ? -101 : 101;
          gsap.fromTo(bg, { yPercent: from }, {
            yPercent: 0, duration: 0.2, overwrite: "auto"
          });
        });
        project.addEventListener("mouseleave", function (e) {
          var rect = project.getBoundingClientRect();
          var to = e.clientY < rect.top + rect.height / 2 ? -101 : 101;
          gsap.to(bg, { yPercent: to, duration: 0.2, overwrite: "auto" });
        });
      }

      /* click to open / close body */
      project.addEventListener("click", function () {
        var body = projectBodies[i];
        if (!body) return;
        var isOpen = activeIndex === i;
        if (isOpen) {
          gsap.to(body, { height: 0, duration: 0.5, ease: EASE });
          activeIndex = -1;
        } else {
          projectBodies.forEach(function (b, bi) {
            if (bi !== i) gsap.to(b, { height: 0, duration: 0.5, ease: EASE });
          });
          gsap.set(body, { height: "auto" });
          var h = body.offsetHeight;
          gsap.fromTo(body, { height: 0 }, { height: h, duration: 0.5, ease: EASE });
          activeIndex = i;
          if (window.innerWidth < 800) {
            setTimeout(function () {
              var top = project.getBoundingClientRect().top + window.pageYOffset - 75;
              if (lenis) lenis.scrollTo(top, { duration: 1.2 });
              else window.scrollTo({ top: top, behavior: "smooth" });
            }, 500);
          }
        }
      });
    });

    /* line width reveal (once) */
    document.querySelectorAll(".line").forEach(function (line) {
      gsap.fromTo(line, { width: 0 }, {
        width: "100%", duration: 1.5, ease: EASE, delay: 0.2,
        scrollTrigger: { trigger: line, start: "top 92%", once: true }
      });
    });

    /* ---------------- Image reveal on load ---------------- */
    document.querySelectorAll(".image-wrapper").forEach(function (wrapper) {
      var img = wrapper.querySelector("img");
      var imgContainer = wrapper.closest(".image-container");
      if (!img) return;

      function done() {
        if (imgContainer) imgContainer.style.backgroundColor = "#121212";
        wrapper.style.opacity = "1";
      }

      if (img.complete && img.naturalWidth > 0) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", function () { wrapper.style.opacity = "1"; });
      }
    });

    /* ---------------- Interactive grid (ported from indextocopy.html) ---------------- */
    var grid = document.querySelector(".grid");
    if (grid) {
      function buildGrid() {
        grid.innerHTML = "";
        var cell = 0.05 * window.innerWidth;
        var rows = Math.ceil((grid.getBoundingClientRect().height || window.innerHeight) / cell);
        for (var c = 0; c < 20; c++) {
          var col = document.createElement("div");
          col.className = "column";
          for (var r = 0; r < rows; r++) {
            var cellEl = document.createElement("div");
            cellEl.addEventListener("mouseenter", function (e) {
              var el = e.target;
              el.style.backgroundColor = "white";
              setTimeout(function () { el.style.backgroundColor = "transparent"; }, 300);
            });
            col.appendChild(cellEl);
          }
          grid.appendChild(col);
        }
      }

      buildGrid();
      var resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildGrid, 200);
      });

      gsap.to(grid, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: grid, scrub: true, start: 0, end: "+=" + (window.innerHeight / 1.5) + "px" }
      });
    }

    /* ---------------- Refresh triggers after loads ---------------- */
    window.addEventListener("load", function () {
      window.ScrollTrigger.refresh();
    });
  });
})();
