/* Coup de Food — page projet Incorrect */
(function () {
  'use strict';
  var CDF = window.CDF, qs = CDF.qs, qsa = CDF.qsa, ANIM = CDF.ANIM;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var KEY = 'incorrect';
  var items = CDF.COMMUNIQUES.filter(function (c) { return c.clients.indexOf(KEY) >= 0; }).slice().reverse(); // chronologique

  /* ---------- frise ---------- */
  var frise = qs('[data-frise]');
  if (frise) {
    frise.insertAdjacentHTML('beforeend', items.map(function (c) {
      var i = CDF.img(c.img, '(min-width: 900px) 40vw, 100vw');
      return '<article class="fr">' +
        '<span class="fr__dot" aria-hidden="true"></span>' +
        '<div class="fr__card">' +
        '<figure class="ph fr__img" data-ht="frise"><img src="' + i.src + '" srcset="' + i.srcset + '" sizes="' + i.sizes + '"' + i.attr + ' width="1800" height="1350" loading="lazy" decoding="async" alt="Photo de presse : ' + esc(c.title) + '"></figure>' +
        '<p class="fr__date"><time datetime="' + c.date + '">' + CDF.fmtLong(c.date) + '</time>' + (CDF.daysAgo(c.date) === 0 ? ' · <span style="color:var(--tomato-ink)">paru aujourd’hui</span>' : '') + (c.selection ? ' · sélection partagée' : '') + '</p>' +
        '<h3 class="fr__title">' + esc(c.title).replace('Incorrect', 'Inco<span class="flipR">r</span>rect') + '</h3>' +
        '<ul class="fr__docs" aria-label="Documents joints">' + c.docs.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
        '<p class="cap" style="padding-top:0"><span>' + esc(c.credit) + '</span></p>' +
        '<p><a class="link-ink" href="' + c.url + '" target="_blank" rel="noopener">Lire le communiqué <span class="arr">↗</span></a></p>' +
        '</div></article>';
    }).join(''));
  }

  /* ---------- galerie ---------- */
  var track = qs('[data-gallery-track]');
  if (track) {
    track.innerHTML = items.map(function (c) {
      var i = CDF.img(c.img, '(min-width: 900px) 640px, 80vw');
      return '<figure class="gallery__item"><div class="ph" data-ht="gal"><img src="' + i.src + '" srcset="' + i.srcset + '" sizes="' + i.sizes + '"' + i.attr + ' width="1800" height="1350" loading="lazy" decoding="async" alt="Photo de presse : ' + esc(c.title) + '"></div>' +
        '<figcaption class="cap"><span><b>' + esc(c.title) + '</b></span><span>' + esc(c.credit) + '</span></figcaption></figure>';
    }).join('');
  }

  CDF.ready(function () {
    if (!ANIM) return;
    // frise : la ligne se trace, les points s'allument
    var line = qs('.frise__line');
    if (line) gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: frise, start: 'top 65%', end: 'bottom 65%', scrub: 0.5 } });
    qsa('.fr').forEach(function (fr) {
      var fig = qs('[data-ht]', fr), item = CDF.attachHT(fig);
      ScrollTrigger.create({
        trigger: fr, start: 'top 70%', once: true,
        onEnter: function () {
          fr.classList.add('is-on');
          CDF.develop(fig, item, 1.4);
          gsap.from(qsa('.fr__date, .fr__title, .fr__docs, .fr__card > p', fr), { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' });
        }
      });
    });

    // galerie horizontale épinglée sur grand écran
    var vp = qs('[data-gallery-vp]');
    var figs = qsa('.gallery__item .ph');
    var hts = figs.map(function (f) { return { fig: f, item: CDF.attachHT(f) }; });
    if (vp && window.matchMedia('(min-width: 900px)').matches) {
      document.documentElement.classList.add('gal-horiz');
      var dist = function () { return Math.max(0, track.scrollWidth - vp.clientWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: vp, start: 'center center', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      hts.forEach(function (h) {
        ScrollTrigger.create({ trigger: h.fig, containerAnimation: tw, start: 'left 95%', once: true, onEnter: function () { CDF.develop(h.fig, h.item, 1.3); } });
      });
    } else {
      hts.forEach(function (h) { ScrollTrigger.create({ trigger: h.fig, start: 'top 90%', once: true, onEnter: function () { CDF.develop(h.fig, h.item, 1.3); } }); });
    }
    setTimeout(function () { ScrollTrigger.refresh(); }, 500);
  });
})();
