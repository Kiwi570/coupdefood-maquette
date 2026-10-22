/* Coup de Food — accueil « La Une » */
(function () {
  'use strict';
  var CDF = window.CDF, qs = CDF.qs, qsa = CDF.qsa, ANIM = CDF.ANIM;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var imgTag = function (name, alt, sizes, lazy) {
    var i = CDF.img(name, sizes);
    return '<img src="' + i.src + '" srcset="' + i.srcset + '" sizes="' + i.sizes + '"' + i.attr + ' width="1800" height="1350" ' + (lazy === false ? '' : 'loading="lazy" ') + 'decoding="async" alt="' + esc(alt) + '">';
  };
  var displayName = function (key) {
    var n = CDF.CLIENTS[key].name;
    return key === 'incorrect' ? 'INCO<span class="flipR">R</span>RECT' : esc(n);
  };

  /* ---------- dernière dépêche (colonne de la Une) ---------- */
  function buildFlash() {
    var el = qs('[data-flash]'); if (!el) return;
    var c = CDF.COMMUNIQUES[0];
    var rel = CDF.relative(c.date), today = CDF.daysAgo(c.date) === 0;
    el.href = c.url; el.target = '_blank'; el.rel = 'noopener';
    el.innerHTML = '<span class="flash__badge' + (today ? ' is-today' : '') + '">' + (today ? 'Paru aujourd’hui' : 'Dernière dépêche') + '</span>' +
      '<h3>' + esc(c.title) + '</h3><p>' + esc(CDF.clientNames(c).join(' · ')) + ' · ' + (today ? CDF.fmtLong(c.date) : rel) + ' ↗</p>';
  }

  /* ---------- les coupures (projets) ---------- */
  function buildBoard() {
    var board = qs('[data-board]'); if (!board) return;
    var groups = {}, order = [];
    CDF.COMMUNIQUES.forEach(function (c) {
      if (c.selection) return;
      c.clients.forEach(function (k) { if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(c); });
    });
    var first = ['incorrect', 'mylord', 'crabclub', 'rizom'];
    var keys = first.concat(order.filter(function (k) { return first.indexOf(k) < 0; }));
    var sel = CDF.COMMUNIQUES.filter(function (c) { return c.selection; })[0];
    var rots = [-1.2, 2.2, -2.4, 1.6, -1.4, 2.6, -2, 1.2];
    var html = [];
    keys.forEach(function (k, i) {
      var list = groups[k]; if (!list) return;
      var c = list.filter(function (x) { return x.img !== 'presse-mylord-jeunes'; })[0] || list[0], cl = CDF.CLIENTS[k], n = CDF.COMMUNIQUES.filter(function (x) { return x.clients.indexOf(k) >= 0; }).length;
      var feature = k === 'incorrect';
      var href = cl.page ? cl.page : (n > 1 ? 'salle-de-presse.html#' + k : c.url);
      var ext = !cl.page && n === 1;
      var where = [cl.place, cl.detail].filter(Boolean).join(' · ');
      html.push(
        '<a class="clip' + (feature ? ' clip--feature' : '') + '" style="--rot:' + rots[i % rots.length] + 'deg" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' data-cursor="' + (feature ? 'Dossier' : 'Lire') + '">' +
        '<span class="clip__tape" aria-hidden="true"></span>' +
        (n > 1 ? '<span class="clip__count">' + n + ' communiqués</span>' : '') +
        '<figure class="ph clip__img" data-ht="clip">' + imgTag(c.img, 'Photo de presse : ' + c.title, feature ? '(min-width: 1000px) 55vw, 100vw' : '(min-width: 1000px) 30vw, 100vw') + '</figure>' +
        '<span class="clip__client">' + displayName(k) + '</span>' +
        (where ? '<span class="clip__where">' + esc(where) + '</span>' : '') +
        '<span class="clip__title">« ' + esc(list[0].title) + ' »</span>' +
        '<span class="clip__foot"><span>' + (n > 1 ? 'Dernier le ' : 'Le ') + CDF.fmtShort(list[0].date) + '</span><b>' + (feature ? 'Dossier complet →' : (ext ? 'Lire le communiqué ↗' : 'Voir les communiqués →')) + '</b></span>' +
        '</a>'
      );
      if (i === 3 && sel) {
        html.push(
          '<a class="clip" style="--rot:-1.8deg" href="' + sel.url + '" target="_blank" rel="noopener">' +
          '<span class="clip__tape" aria-hidden="true"></span>' +
          '<figure class="ph clip__img" data-ht="clip">' + imgTag(sel.img, 'Photo de presse : ' + sel.title, '(min-width: 1000px) 30vw, 100vw') + '</figure>' +
          '<span class="clip__client">Sélection terrasses</span>' +
          '<span class="clip__where">' + esc(CDF.clientNames(sel).join(' · ')) + '</span>' +
          '<span class="clip__title">« ' + esc(sel.title) + ' »</span>' +
          '<span class="clip__foot"><span>Le ' + CDF.fmtShort(sel.date) + '</span><b>Lire la sélection ↗</b></span></a>'
        );
      }
    });
    board.innerHTML = html.join('');
  }

  function animateBoard() {
    var cards = qsa('.clip');
    if (!ANIM) return;
    cards.forEach(function (card, i) {
      var rot = parseFloat(getComputedStyle(card).getPropertyValue('--rot')) || 0;
      gsap.set(card, { rotation: rot, transformPerspective: 900 });
      card.__rot = rot;
      var fig = qs('[data-ht]', card);
      var item = CDF.attachHT(fig);
      ScrollTrigger.create({
        trigger: card, start: 'top 96%', once: true,
        onEnter: function () {
          var fromX = (i % 2 ? 1 : -1) * (40 + (i * 17) % 50);
          gsap.fromTo(card, { y: 140, x: fromX, rotation: rot + (i % 2 ? 14 : -14), autoAlpha: 0 },
            { y: 0, x: 0, rotation: rot, autoAlpha: 1, duration: 1.05, ease: 'back.out(1.5)' });
          gsap.fromTo(qs('.clip__tape', card), { scaleX: 0 }, { scaleX: 1, duration: 0.35, delay: 0.75, ease: 'power3.out' });
          CDF.develop(fig, item, 1.5, 0.4);
        }
      });
      if (window.matchMedia('(hover: hover)').matches) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotationY: px * 9, rotationX: -py * 9, rotation: 0, y: -6, duration: 0.5, ease: 'power3.out' });
        });
        card.addEventListener('pointerleave', function () { gsap.to(card, { rotationY: 0, rotationX: 0, rotation: card.__rot, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }); });
      }
    });
  }

  /* ---------- logos qui défilent ---------- */
  function logos() {
    var track = qs('[data-logos]'); if (!track) return;
    var g = qs('.logos__group', track);
    var clone = g.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    qsa('a', clone).forEach(function (a) { a.tabIndex = -1; });
    track.appendChild(clone);
    if (!ANIM) return;
    var loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 46, repeat: -1 });
    track.addEventListener('mouseenter', function () { gsap.to(loop, { timeScale: 0.15, duration: 0.5 }); });
    track.addEventListener('mouseleave', function () { gsap.to(loop, { timeScale: 1, duration: 0.6 }); });
    track.addEventListener('focusin', function () { gsap.to(loop, { timeScale: 0, duration: 0.3 }); });
    track.addEventListener('focusout', function () { gsap.to(loop, { timeScale: 1, duration: 0.6 }); });
  }

  /* ---------- dernières dépêches ---------- */
  function buildLatest() {
    var box = qs('[data-latest]'); if (!box) return;
    box.innerHTML = CDF.COMMUNIQUES.slice(0, 3).map(function (c) {
      var today = CDF.daysAgo(c.date) === 0;
      return '<a class="dep" href="' + c.url + '" target="_blank" rel="noopener">' +
        '<figure class="ph dep__img" data-ht>' + imgTag(c.img, 'Photo de presse : ' + c.title, '(min-width: 800px) 30vw, 100vw') + '</figure>' +
        '<div class="dep__body"><p class="dep__date"><time datetime="' + c.date + '">' + CDF.fmtLong(c.date) + '</time>' + (today ? '<span class="badge is-today">Aujourd’hui</span>' : '') + '</p>' +
        '<p class="dep__client">' + esc(CDF.clientNames(c).join(' · ')) + '</p>' +
        '<h3>' + esc(c.title) + '</h3><p class="cap"><span>' + esc(c.credit) + '</span><span>Lire sur Prezly ↗</span></p></div></a>';
    }).join('');
    if (!ANIM) return;
    var cards = qsa('.dep', box);
    ScrollTrigger.create({
      trigger: box, start: 'top 92%', once: true,
      onEnter: function () { gsap.fromTo(cards, { rotationY: -70, autoAlpha: 0, x: -30 }, { rotationY: 0, autoAlpha: 1, x: 0, duration: 1, stagger: 0.14, ease: 'power3.out', clearProps: 'transform' }); }
    });
  }

  /* ---------- ouverture orchestrée ---------- */
  function opening() {
    var mast = qs('[data-mast] .une__mast-in');
    var title = qs('.une__title');
    var photoFig = qs('.une__photo');
    var stamp = qs('[data-stamp]');
    if (!ANIM) { CDF.sheetOut(); return; }
    var item = CDF.attachHT(photoFig);
    var mastSplit = window.SplitText ? SplitText.create(mast, { type: 'chars' }) : null;
    var tl = gsap.timeline({ paused: true });
    tl.from(qsa('.une__rules i'), { scaleX: 0, duration: 0.6, ease: 'power3.inOut', stagger: 0.08 }, 0)
      .from(qs('[data-une-meta]'), { autoAlpha: 0, y: -8, duration: 0.4 }, 0.05);
    if (mastSplit) tl.from(mastSplit.chars, { yPercent: 105, duration: 0.75, ease: 'power4.out', stagger: 0.035 }, 0.05);
    tl.add(function () { CDF.develop(photoFig, item, 1.5); }, 0.35)
      .add(CDF.printIn(title) || function () {}, 0.5)
      .from(qsa('[data-une-in]'), { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.8)
      .add(function () { CDF.stampIn(stamp); }, 1.75)
      .from(qs('.ticker'), { yPercent: 100, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 1.2);
    gsap.set(stamp, { autoAlpha: 0 });
    CDF.sheetOut(function () { tl.play(0); });
  }

  /* ---------- au sommaire : défilement horizontal + démos ---------- */
  var demoStarted = {};
  function startDemo(type, root) {
    if (demoStarted[type]) return; demoStarted[type] = true;
    if (type === 'radar') demoRadar(root);
    if (type === 'redpen') demoRedpen(root);
    if (type === 'onair') demoOnair(root);
    if (type === 'invite') demoInvite(root);
    if (type === 'veille') demoVeille(root);
  }

  function demoRadar(root) {
    var sweep = qs('.sweep', root);
    var nodes = qsa('.node', root).map(function (n) { return { el: n, a: +n.getAttribute('data-a') }; });
    var spin = gsap.to(sweep, {
      rotation: 360, svgOrigin: '160 160', duration: 5, ease: 'none', repeat: -1,
      onUpdate: function () {
        var r = (gsap.getProperty(sweep, 'rotation') % 360 + 360) % 360;
        nodes.forEach(function (n) { var on = ((r - n.a + 360) % 360) < 70; if (on !== n.on) { n.on = on; n.el.classList.toggle('is-on', on); } });
      }
    });
    ScrollTrigger.create({ trigger: root, containerAnimation: CDF.horizTween || undefined, start: CDF.horizTween ? 'left right' : 'top bottom', end: CDF.horizTween ? 'right left' : 'bottom top', onToggle: function (s) { s.isActive ? spin.play() : spin.pause(); } });
  }

  function demoRedpen(root) {
    var strike = qs('.redpen__txt', root), out = qs('[data-type]', root), marks = qsa('.redpen__marks span', root);
    var text = out.textContent; out.textContent = '';
    var caret = document.createElement('span'); caret.className = 'caret';
    var o = { n: 0 };
    var tl = gsap.timeline();
    tl.fromTo(strike, { '--strike': '0%' }, { '--strike': '100%', duration: 0.6, ease: 'power2.inOut' })
      .to(qs('.redpen__before', root), { opacity: 0.45, duration: 0.3 }, '<0.3')
      .to(o, { n: text.length, duration: 1.8, ease: 'none', onUpdate: function () { out.textContent = text.slice(0, Math.round(o.n)); out.appendChild(caret); } })
      .from(marks, { scale: 0, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' }, '-=0.3');
  }

  function demoOnair(root) {
    var lamp = qs('.onair__lamp', root), canvas = qs('canvas', root), q = qs('[data-q]', root);
    var ctx = canvas.getContext('2d');
    var energy = 0.45, lastX = 0, lastY = 0, t = 0, active = false;
    var qs_ = ['Racontez-nous l’histoire de votre maison.', 'Pourquoi ce produit plutôt qu’un autre ?', 'Qu’est-ce qui rend votre cuisine différente ?', 'Que voulez-vous que le public retienne ?'];
    var qi = 0;
    root.addEventListener('pointermove', function (e) { var d = Math.hypot(e.clientX - lastX, e.clientY - lastY); lastX = e.clientX; lastY = e.clientY; energy = Math.min(1, energy + d / 260); });
    var odd = false;
    function draw() {
      if (!active) return;
      odd = !odd; if (odd) return; // 30 images par seconde suffisent pour l'onde
      t += 0.1; energy = Math.max(0.32, energy * 0.93);
      var w = canvas.width, h = canvas.height, n = 56, bw = w / n;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < n; i++) {
        var a = (Math.sin(i * 0.42 + t * 2.1) * 0.5 + 0.5) * (Math.sin(i * 0.13 - t) * 0.5 + 0.6);
        var bh = Math.max(4, a * energy * h * 0.95);
        ctx.fillStyle = i % 9 === 0 ? '#D9442B' : '#14301C';
        ctx.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
      }
    }
    gsap.ticker.add(draw);
    var rot = null;
    ScrollTrigger.create({
      trigger: root, containerAnimation: CDF.horizTween || undefined, start: CDF.horizTween ? 'left 80%' : 'top 80%', end: CDF.horizTween ? 'right 20%' : 'bottom 20%',
      onToggle: function (s) {
        active = s.isActive; lamp.classList.toggle('is-on', s.isActive);
        if (s.isActive && !rot) rot = setInterval(function () { qi = (qi + 1) % qs_.length; gsap.to(q, { autoAlpha: 0, y: -8, duration: 0.3, onComplete: function () { q.textContent = qs_[qi]; gsap.fromTo(q, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }); } }); }, 3400);
        if (!s.isActive && rot) { clearInterval(rot); rot = null; }
      }
    });
  }

  function demoInvite(root) {
    var top = qs('.invite__top', root), chips = qsa('.invite__chips span', root);
    gsap.timeline()
      .fromTo(top, { rotationX: 180 }, { rotationX: 0, duration: 1.3, ease: 'power3.inOut', transformPerspective: 900 })
      .from(chips, { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.45, ease: 'back.out(2)' }, '-=0.4');
  }

  function demoVeille(root) {
    qsa('.veille__word', root).forEach(function (w, i) {
      gsap.fromTo(w, { '--hl': 0 }, { '--hl': 1, duration: 0.55, delay: 0.25 + i * 0.4, ease: 'power2.inOut' });
    });
  }

  function sommaire() {
    var vp = qs('[data-sommaire]'); if (!vp) return;
    var track = qs('.sommaire__track', vp), bar = qs('[data-rub-bar]'), numEl = qs('[data-rub-n]'), nextEl = qs('[data-rub-next]');
    var titles = qsa('.rub h3', vp).map(function (h) { return h.textContent.split('&')[0].split(' & ')[0].trim(); });
    var rubs = qsa('.rub', vp);
    var mm = window.matchMedia('(min-width: 1000px)');
    if (ANIM && mm.matches) {
      document.documentElement.classList.add('horiz');
      var dist = function () { return Math.max(0, track.scrollWidth - vp.clientWidth); };
      CDF.horizTween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: vp, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (s) {
            gsap.set(bar, { scaleX: s.progress });
            var i = Math.min(titles.length - 1, Math.round(s.progress * (titles.length - 1)));
            if (numEl.textContent !== String(i + 1)) { numEl.textContent = i + 1; nextEl.textContent = titles[i]; }
          }
        }
      });
    }
    rubs.forEach(function (rub) {
      var demo = qs('[data-demo]', rub), fig = qs('.rub__img', rub);
      var type = demo && demo.getAttribute('data-demo');
      if (!ANIM) return;
      var item = CDF.attachHT(fig);
      var common = CDF.horizTween ? { containerAnimation: CDF.horizTween, start: 'left 78%' } : { start: 'top 80%' };
      ScrollTrigger.create(Object.assign({
        trigger: rub, once: true,
        onEnter: function () {
          CDF.develop(fig, item, 1.5);
          gsap.from(qsa('.rub__body > *', rub), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' });
          if (type) setTimeout(function () { startDemo(type, demo); }, 350);
        }
      }, common));
    });
  }

  /* ---------- la méthode ---------- */
  function methode() {
    var stage = qs('[data-stage]'), steps = qsa('.step');
    if (!steps.length) return;
    var items = stage ? qsa('.stage__item', stage) : [];
    var current = 0, seen = {};
    var htItems = {};
    if (ANIM && stage) qsa('[data-ht="stage"]', stage).forEach(function (fig) { htItems[fig.parentNode.getAttribute('data-si')] = { fig: fig, item: CDF.attachHT(fig) }; });
    function setStage(i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (!stage || i === current && seen[i]) return;
      var prev = items[current], next = items[i];
      if (ANIM) {
        if (prev && prev !== next) gsap.to(prev, { autoAlpha: 0, duration: 0.45, onComplete: function () { prev.classList.remove('is-on'); } });
        next.classList.add('is-on');
        gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
        if (!seen[i]) {
          seen[i] = true;
          if (htItems[i]) CDF.develop(htItems[i].fig, htItems[i].item, 1.3);
          if (i === 1 || i === 4) CDF.printIn(qs('.stage__quote', next));
          if (i === 2) gsap.from(qsa('.sheet-mock', next), { y: 160, rotation: function (k) { return [-24, 18, -6][k]; }, autoAlpha: 0, duration: 0.9, stagger: 0.16, ease: 'back.out(1.3)' });
          if (i === 5) gsap.from(qsa('.revue__item', next), { x: 60, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' });
        }
        if (i === 3) gsap.fromTo(qsa('.stage__env', next), { x: 0, rotation: -12 }, { x: function () { return stage.clientWidth + 160; }, rotation: 8, duration: 1.6, stagger: 0.22, ease: 'power2.in' });
      } else { if (prev) prev.classList.remove('is-on'); next.classList.add('is-on'); }
      current = i;
    }
    if (!ANIM) return;
    steps.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: 'top 58%', end: 'bottom 58%', onToggle: function (self) { if (self.isActive) setStage(i); } });
    });
    var rib = qs('.methode__ribbon span');
    if (rib) gsap.to(rib, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: qs('[data-steps]'), start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } });
    if (htItems[0]) ScrollTrigger.create({ trigger: stage, start: 'top 80%', once: true, onEnter: function () { seen[0] = true; CDF.develop(htItems[0].fig, htItems[0].item, 1.4); } });
  }

  /* ---------- entretien : compteur ---------- */
  function counter() {
    var b = qs('[data-count]'); if (!b || !ANIM) return;
    var o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: function () { gsap.to(o, { v: 12, duration: 1.6, ease: 'power3.out', onUpdate: function () { b.textContent = Math.round(o.v); } }); } });
  }

  /* ---------- charte : le vélo ---------- */
  function charte() {
    var sec = qs('[data-charte]'), bike = qs('[data-bike]'); if (!sec || !bike) return;
    var engs = qsa('.eng', sec);
    if (!ANIM) return;
    var wheels = qsa('.wheel', bike);
    gsap.set(wheels, { transformOrigin: '50% 50%' });
    var wide = window.matchMedia('(min-width: 900px)').matches;
    if (wide) {
      var distance = function () { return sec.clientWidth + bike.offsetWidth; };
      gsap.fromTo(bike, { x: function () { return -bike.offsetWidth; } }, {
        x: function () { return sec.clientWidth; }, ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top 75%', end: 'bottom 25%', scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (s) { var deg = s.progress * distance() / (Math.PI * 2 * (bike.offsetWidth * 42 / 260)) * 360; gsap.set(wheels, { rotation: deg }); }
        }
      });
    } else {
      gsap.fromTo(bike, { x: -40 }, {
        x: function () { return sec.clientWidth - bike.offsetWidth + 20; }, ease: 'none',
        scrollTrigger: { trigger: bike, start: 'top bottom', end: 'bottom 40%', scrub: 0.6, onUpdate: function (s) { gsap.set(wheels, { rotation: s.progress * 720 }); } }
      });
    }
    engs.forEach(function (li) {
      var tick = qs('.eng__tick', li), trail = qs('.eng__trail', li);
      gsap.set(trail, { scaleX: 0 });
      ScrollTrigger.create({
        trigger: li, start: 'top 72%', once: true,
        onEnter: function () {
          gsap.fromTo(tick, { scale: 2.4, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: -10, autoAlpha: 1, duration: 0.3, ease: 'power4.in' });
          gsap.to(trail, { scaleX: 1, duration: 0.9, delay: 0.25, ease: 'power3.inOut' });
        }
      });
    });
  }

  /* ---------- contact : bon de commande en 3 étapes ---------- */
  function form() {
    var f = qs('[data-form]'); if (!f) return;
    var steps = qsa('[data-fstep]', f), nav = qsa('.steps-nav li', f);
    var prev = qs('[data-prev]', f), next = qs('[data-next]', f), send = qs('[data-send]', f);
    var done = qs('[data-done]'), recap = qs('[data-recap]'), again = qs('[data-again]');
    var cur = 1;
    qsa('.field', f).forEach(function (fd, k) { var inp = qs('input, textarea', fd), er = qs('.err', fd); if (inp && er) { er.id = er.id || 'err-' + (inp.id || k); inp.setAttribute('aria-describedby', er.id); } });
    qs('.chips', f).setAttribute('aria-describedby', 'err-motif');
    var fileIn = qs('#fichier', f), fileName = qs('[data-filename]', f);
    fileIn.addEventListener('change', function () { fileName.textContent = fileIn.files && fileIn.files[0] ? fileIn.files[0].name + ' (reste sur votre appareil)' : 'Aucun fichier'; });

    function setErr(input, msg) {
      var field = input.closest('.field'); if (!field) return;
      field.classList.toggle('is-bad', !!msg);
      var e = qs('.err', field); if (e) e.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function validate(n) {
      var ok = true;
      if (n === 1) {
        var m = qs('input[name="motif"]:checked', f);
        qs('[data-err="motif"]', f).textContent = m ? '' : 'Choisissez un motif pour continuer.';
        ok = !!m;
      }
      if (n === 2) {
        ['prenom', 'nom'].forEach(function (id) { var i = qs('#' + id, f); var bad = !i.value.trim(); setErr(i, bad ? 'Ce champ est obligatoire.' : ''); if (bad) ok = false; });
        var em = qs('#email', f), v = em.value.trim();
        var bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        setErr(em, !v ? 'Ce champ est obligatoire.' : bad ? 'Vérifiez l’adresse e-mail (exemple : nom@domaine.be).' : '');
        if (!v || bad) ok = false;
      }
      if (n === 3) {
        var msg = qs('#message', f); var b2 = msg.value.trim().length < 2;
        setErr(msg, b2 ? 'Écrivez quelques mots sur votre projet.' : ''); if (b2) ok = false;
      }
      if (!ok) { var firstBad = qs('[aria-invalid="true"], [data-fstep="1"]:not([hidden]) input', steps[n - 1]); if (firstBad && n !== 1) firstBad.focus(); }
      return ok;
    }
    function go(n) {
      var from = steps[cur - 1], to = steps[n - 1], dir = n > cur ? 1 : -1;
      from.hidden = true; to.hidden = false;
      if (ANIM) gsap.fromTo(to, { x: 40 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform' });
      nav.forEach(function (li, k) { li.classList.toggle('is-on', k === n - 1); li.classList.toggle('is-done', k < n - 1); });
      prev.hidden = n === 1; next.hidden = n === 3; send.hidden = n !== 3;
      cur = n;
      var focusable = qs('input, textarea', to); if (focusable && n > 1) focusable.focus({ preventScroll: true });
    }
    next.addEventListener('click', function () { if (validate(cur)) go(cur + 1); });
    prev.addEventListener('click', function () { go(cur - 1); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(3)) return;
      var m = qs('input[name="motif"]:checked', f);
      recap.textContent = 'Motif : ' + (m ? m.value : '') + ' · De : ' + qs('#prenom', f).value.trim() + ' ' + qs('#nom', f).value.trim();
      var show = function () {
        f.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
        if (ANIM) { gsap.fromTo(done, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }); CDF.stampIn(qs('.stamp', done), 0.25); }
      };
      if (ANIM) gsap.to(f, { rotationX: 70, y: 60, scale: 0.86, autoAlpha: 0, transformPerspective: 1000, transformOrigin: '50% 0%', duration: 0.65, ease: 'power3.in', onComplete: show });
      else show();
    });
    again.addEventListener('click', function () {
      f.reset(); fileName.textContent = 'Aucun fichier';
      done.hidden = true; f.hidden = false;
      if (ANIM) gsap.set(f, { clearProps: 'all' });
      steps.forEach(function (s, k) { s.hidden = k !== 0; });
      cur = 2; go(1);
      var r = qs('#m1', f); if (r) r.focus();
    });
  }

  /* ---------- démarrage ---------- */
  buildFlash();
  buildBoard();
  buildLatest();
  logos();
  CDF.ready(function () {
    opening();
    sommaire();
    methode();
    animateBoard();
    counter();
    charte();
    form();
    if (ANIM) setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  });
})();
