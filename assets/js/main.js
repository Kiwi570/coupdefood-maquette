/* Coup de Food — comportements communs à toutes les pages */
(function () {
  'use strict';
  var html = document.documentElement;
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CDF = window.CDF = window.CDF || {};

  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var calm = html.classList.contains('calm');
  var ANIM = hasGsap && !calm;
  if (!ANIM) html.classList.add('no-anim');
  CDF.ANIM = ANIM;
  CDF.qs = qs; CDF.qsa = qsa;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
  }

  /* ---------- date du jour ---------- */
  if (CDF.fmtToday) {
    var t = CDF.fmtToday();
    qsa('[data-today]').forEach(function (el) { el.textContent = 'Bruxelles · ' + t; });
    qsa('[data-today-long]').forEach(function (el) { el.textContent = t; });
  }

  /* ---------- mode calme ---------- */
  qsa('[data-calm]').forEach(function (b) {
    b.setAttribute('aria-pressed', calm ? 'true' : 'false');
    b.addEventListener('click', function () {
      try { localStorage.setItem('cdf-calm', calm ? '0' : '1'); } catch (e) {}
      if (calm) html.classList.remove('calm'); else html.classList.add('calm');
      location.reload();
    });
  });

  /* ---------- défilement fluide ---------- */
  var lenis = null;
  if (ANIM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  CDF.lenis = lenis;
  // épinglage par transformation quand le défilement est piloté par Lenis : pas de saut de mise en page (CLS)
  if (hasGsap) ScrollTrigger.defaults({ pinType: (lenis && window.matchMedia('(pointer: fine)').matches) ? 'transform' : 'fixed' });

  var hd = qs('[data-hd]');
  function hdOffset() { return hd ? hd.offsetHeight : 0; }
  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -hdOffset() + 2, duration: 1.4 });
    else {
      var y = target.getBoundingClientRect().top + window.pageYOffset - hdOffset() + 2;
      window.scrollTo({ top: y, behavior: calm ? 'auto' : 'smooth' });
    }
  }
  CDF.scrollToTarget = scrollToTarget;

  /* ---------- menu ---------- */
  var burger = qs('[data-burger]'), menu = qs('#menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-ouvert', open);
    if (open) {
      if (lenis) lenis.stop();
      if (ANIM) gsap.fromTo(qsa('li', menu), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.04, duration: 0.5, ease: 'power3.out' });
      var first = qs('a', menu); if (first) first.focus();
    } else if (lenis) lenis.start();
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !menu || menu.hidden) return;
    var f = [burger].concat(qsa('a', menu)); var i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });

  /* ---------- liens : ancres et transitions de page ---------- */
  var sheet = qs('.sheet');
  var here = location.pathname.split('/').pop() || 'index.html';
  function samePage(file) { file = file || 'index.html'; return file === here || (file === 'index.html' && (here === '' || here === 'index')) || file.replace('.html', '') === here.replace('.html', ''); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || /^(mailto:|tel:|https?:|\/\/)/.test(href)) return;
    var parts = href.split('#');
    var file = parts[0], hash = parts[1];
    if ((file === '' || samePage(file)) && hash) {
      var target = document.getElementById(hash);
      if (target) { e.preventDefault(); setMenu(false); scrollToTarget(target); try { history.replaceState(null, '', '#' + hash); } catch (err) {} }
      return;
    }
    if (ANIM && sheet && /\.html$/.test(file)) {
      e.preventDefault();
      setMenu(false);
      sheet.classList.add('is-run'); sheet.classList.remove('is-gone');
      gsap.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'power3.inOut', onComplete: function () { location.href = href; } });
    }
  });

  CDF.sheetOut = function (done) {
    if (!sheet || !ANIM) { if (done) done(); return; }
    sheet.classList.add('is-run');
    gsap.set(sheet, { yPercent: 0 });
    gsap.to(sheet, { yPercent: -100, duration: 0.6, ease: 'power3.inOut', delay: 0.05, onComplete: function () { sheet.classList.add('is-gone'); if (done) done(); } });
  };
  window.addEventListener('pageshow', function (e) { if (e.persisted && sheet) { sheet.classList.add('is-gone'); } });

  /* ---------- en-tête qui se cache ---------- */
  if (hd) {
    var lastY = 0;
    var onScroll = function () {
      var y = window.pageYOffset;
      if (y > 240 && y > lastY + 4 && !(menu && !menu.hidden)) hd.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 240) hd.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  // page courante dans la navigation
  qsa('.hd__nav a').forEach(function (a) { var h = a.getAttribute('href'); if (!/#/.test(h) && samePage(h)) a.setAttribute('aria-current', 'page'); });

  /* ---------- curseur plume et boutons magnétiques ---------- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (ANIM && fine) {
    var cur = qs('.cursor');
    if (cur) {
      html.classList.add('has-cursor');
      var dot = qs('.cursor__dot', cur), ring = qs('.cursor__ring', cur), label = qs('.cursor__ring span', cur);
      var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      var rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        if (!html.classList.contains('cursor-on')) { gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); html.classList.add('cursor-on'); }
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
        var t = e.target;
        var lab = t.closest && t.closest('[data-cursor]');
        if (lab) { label.textContent = lab.getAttribute('data-cursor'); cur.classList.add('is-label'); }
        else if (t.closest && t.closest('.clip, .dep, .pc')) { label.textContent = 'Lire'; cur.classList.add('is-label'); }
        else cur.classList.remove('is-label');
        cur.classList.toggle('on-ink', !!(t.closest && t.closest('.on-ink, .ticker, .clip--feature, .pc--une, .stage__ink, .menu')));
      }, { passive: true });
      window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
      window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
      document.documentElement.addEventListener('mouseleave', function () { html.classList.remove('cursor-on'); });
    }
    qsa('.mag').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.38);
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' }); });
    });
  }

  /* ---------- copier ---------- */
  qsa('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy');
      var done = function (ok) { var o = b.textContent; b.textContent = ok ? 'Copié' : 'Sélectionné'; setTimeout(function () { b.textContent = o; }, 1600); };
      var select = function () {
        var span = b.parentNode.querySelector('span');
        if (span) { var r = document.createRange(); r.selectNodeContents(span); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        done(false);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, select);
        else select();
      } catch (e) { select(); }
    });
  });

  /* ---------- ajustement des grands titres à la largeur ---------- */
  function fit() {
    qsa('[data-mast], [data-fit]').forEach(function (box) {
      // le texte réservé aux lecteurs d'écran (.sr) ne compte pas dans la mesure
      var inner = [].filter.call(box.children, function (c) { return !c.classList.contains('sr'); })[0]; if (!inner) return;
      box.style.fontSize = '';
      if (box.getAttribute('data-fit') === 'wide' && window.innerWidth < 700) return;
      var fs = parseFloat(getComputedStyle(box).fontSize);
      var w = inner.getBoundingClientRect().width;
      var avail = box.clientWidth;
      if (w > 0) box.style.fontSize = (fs * avail / w * 0.995) + 'px';
    });
  }
  CDF.fit = fit;

  /* ---------- impression « rotative » des titres ---------- */
  var splits = new WeakMap();
  CDF.srText = function (el) {
    var prev = el.previousElementSibling;
    if (prev && prev.classList.contains('sr') && prev.dataset.srPour === '1') return;
    var t = document.createElement('span'); t.className = 'sr'; t.dataset.srPour = '1'; t.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    el.parentNode.insertBefore(t, el);
  };
  function prepare(el) {
    if (splits.has(el) || !window.SplitText) return null;
    // aria-label est interdit sur <p> et <span> : texte réservé aux lecteurs d'écran à côté, lettres masquées
    var titre = /^H[1-6]$/.test(el.tagName) || el.hasAttribute('role');
    if (!titre) CDF.srText(el);
    var s = SplitText.create(el, { type: 'lines,words,chars', mask: 'lines', linesClass: 'pl', charsClass: 'pc-ch', aria: titre ? 'auto' : 'hidden' });
    splits.set(el, s);
    return s;
  }
  function printIn(el, delay) {
    if (!ANIM || !el) return null;
    var s = prepare(el);
    if (!s) return gsap.from(el, { autoAlpha: 0, y: 30, duration: 0.8, delay: delay || 0 });
    var tl = gsap.timeline({ delay: delay || 0 });
    tl.from(s.chars, { yPercent: 118, duration: 0.7, ease: 'power4.out', stagger: { each: 0.012 } }, 0)
      .fromTo(el, { filter: 'blur(5px)' }, { filter: 'blur(0px)', duration: 0.9, ease: 'power2.out', clearProps: 'filter' }, 0);
    return tl;
  }
  CDF.printIn = printIn;

  /* ---------- tampon ---------- */
  CDF.stampIn = function (el, delay) {
    if (!el) return null;
    if (!ANIM) return null;
    var tl = gsap.timeline({ delay: delay || 0 });
    tl.fromTo(el, { scale: 2.6, rotation: -34, autoAlpha: 0 }, { scale: 1, rotation: -12, autoAlpha: 0.95, duration: 0.34, ease: 'power4.in' })
      .fromTo(el.parentNode, { x: -4 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)', clearProps: 'x' });
    return tl;
  };

  /* ---------- fil des dépêches ---------- */
  function buildTicker() {
    var tk = qs('[data-ticker]'); if (!tk || !CDF.COMMUNIQUES) return;
    var track = qs('.ticker__track', tk);
    var items = CDF.COMMUNIQUES.slice(0, 8).map(function (c) {
      return '<a class="ticker__item" href="' + c.url + '" target="_blank" rel="noopener"><time datetime="' + c.date + '">' + CDF.fmtShort(c.date) + '</time><span>' + c.title + '</span></a>';
    }).join('');
    track.innerHTML = '<div class="ticker__group" style="padding-left:140px">' + items + '</div><div class="ticker__group" aria-hidden="true" style="padding-left:140px">' + items + '</div>';
    qsa('.ticker__group[aria-hidden] a', track).forEach(function (a) { a.tabIndex = -1; });
    if (!ANIM) return;
    var loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 60, repeat: -1 });
    var boost = 1, held = false;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { boost = Math.max(boost, Math.min(5, 1 + Math.abs(self.getVelocity()) / 350)); } });
    gsap.ticker.add(function () {
      boost += (1 - boost) * 0.05;
      var target = held ? 0 : boost;
      loop.timeScale(loop.timeScale() + (target - loop.timeScale()) * 0.12);
    });
    var hold = function (v) { return function () { held = v; }; };
    tk.addEventListener('mouseenter', hold(true)); tk.addEventListener('mouseleave', hold(false));
    tk.addEventListener('focusin', hold(true)); tk.addEventListener('focusout', hold(false));
    CDF.tickerLoop = loop;
  }

  /* ---------- photos : développement en trame ---------- */
  var htOK = false;
  function initHalftone() {
    if (!ANIM) return;
    htOK = !!(window.CDFHalftone && window.CDFHalftone.init());
    qsa('[data-ht]').forEach(function (fig) {
      var mode = fig.getAttribute('data-ht');
      if (mode && mode !== 'auto') return;
      if (fig.offsetParent === null) return;
      CDF.developOnScroll(fig);
    });
  }
  CDF.attachHT = function (fig) {
    if (!ANIM) return null;
    if (htOK) return window.CDFHalftone.attach(fig);
    fig.classList.add('ht-css');
    return { css: true, el: fig };
  };
  CDF.develop = function (fig, item, duration, delay) {
    if (!ANIM || !item) return;
    if (item.css) { setTimeout(function () { fig.classList.add('is-developing'); }, (delay || 0) * 1000); return; }
    window.CDFHalftone.develop(item, duration || 1.6, delay || 0);
  };
  CDF.developOnScroll = function (fig, opts) {
    var item = CDF.attachHT(fig);
    if (!item) return;
    ScrollTrigger.create(Object.assign({ trigger: fig, start: 'top 90%', once: true, onEnter: function () { CDF.develop(fig, item, 1.6); } }, opts || {}));
  };

  /* ---------- apparitions génériques ---------- */
  function initReveals() {
    if (!ANIM) return;
    qsa('[data-print]').forEach(function (el) {
      if (el.getAttribute('data-print') === 'load') return;
      prepare(el);
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { printIn(el); } });
    });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 94%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'transform' }); }
    });
    qsa('[data-parallax]').forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-parallax')) || 8;
      gsap.fromTo(el, { yPercent: amt }, { yPercent: -amt, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- rubrique courante dans la navigation ---------- */
  function scrollSpy() {
    if (!hasGsap) return;
    qsa('.hd__nav a[href*="#"]').forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1], sec = document.getElementById(id);
      if (!sec || !samePage(a.getAttribute('href').split('#')[0])) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (st) { a.classList.toggle('is-current', st.isActive); } });
    });
  }

  /* ---------- démarrage ---------- */
  CDF.ready = function (fn) {
    var go = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fn); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
  // en passant d'une mise en page à l'autre (rotation d'une tablette), on recharge pour reconstruire les animations
  if (ANIM) ['(min-width: 1000px)', '(min-width: 900px)'].forEach(function (q) {
    var mq = window.matchMedia(q);
    // on ne recharge pas si un champ a été rempli : la saisie serait perdue
    var saisie = function () { return [].some.call(document.querySelectorAll('input, textarea, select'), function (f) { return (f.type === 'checkbox' || f.type === 'radio') ? f.checked !== f.defaultChecked : (f.type !== 'hidden' && f.type !== 'file' && f.value !== f.defaultValue) || (f.type === 'file' && f.files && f.files.length); }); };
    var onChange = function () { clearTimeout(CDF.__rl); CDF.__rl = setTimeout(function () { if (saisie()) { if (window.ScrollTrigger) ScrollTrigger.refresh(); return; } location.reload(); }, 250); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  });
  CDF.ready(function () {
    fit();
    window.addEventListener('resize', function () { fit(); });
    buildTicker();
    initHalftone();
    initReveals();
    scrollSpy();
    if (!document.body.hasAttribute('data-own-opening')) CDF.sheetOut();
    if (location.hash) { var t0 = document.getElementById(location.hash.slice(1)); if (t0) setTimeout(function () { scrollToTarget(t0); }, 700); }
    if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 400);
  });
})();
