/* Coup de Food — salle de presse : liste, recherche, filtres */
(function () {
  'use strict';
  var CDF = window.CDF, qs = CDF.qs, qsa = CDF.qsa, ANIM = CDF.ANIM;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' '); };

  var list = qs('[data-plist]'), empty = qs('[data-empty]'), count = qs('[data-result-count]');
  var filters = qs('[data-filters]'), q = qs('#q'), sort = qs('#tri');
  var all = CDF.COMMUNIQUES;
  var state = { client: 'tous', q: '', sort: 'desc' };

  // compteurs
  var lastDate = qs('[data-last-date]'); if (lastDate) lastDate.textContent = CDF.fmtLong(all[0].date);
  var pc = qs('[data-press-count]'); if (pc) pc.textContent = all.length + ' communiqués';

  // filtres par client (ordre : nombre de communiqués)
  var counts = {};
  all.forEach(function (c) { c.clients.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; }); });
  var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || CDF.CLIENTS[a].name.localeCompare(CDF.CLIENTS[b].name); });
  filters.innerHTML = '<button type="button" data-k="tous" aria-pressed="true">Tous · ' + all.length + '</button>' +
    keys.map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="false">' + esc(CDF.CLIENTS[k].name) + ' · ' + counts[k] + '</button>'; }).join('');

  function card(c, une) {
    var today = CDF.daysAgo(c.date) === 0;
    var i = CDF.img(c.img, une ? '(min-width: 760px) 40vw, 100vw' : '(min-width: 760px) 28vw, 100vw');
    return '<article class="pc' + (une ? ' pc--une' : '') + '">' +
      '<figure class="ph pc__img" data-ht="list"><img src="' + i.src + '" srcset="' + i.srcset + '" sizes="' + i.sizes + '"' + i.attr + ' width="1800" height="1350" loading="lazy" decoding="async" alt="Photo de presse : ' + esc(c.title) + '"></figure>' +
      '<p class="pc__meta"><time datetime="' + c.date + '">' + CDF.fmtLong(c.date) + '</time>' + (today ? '<span class="badge is-today">Paru aujourd’hui</span>' : (une ? '<span class="badge">À la une</span>' : '')) + '</p>' +
      '<p class="pc__clients">' + esc(CDF.clientNames(c).join(' · ')) + '</p>' +
      '<h2>' + esc(c.title) + '</h2>' +
      '<ul class="pc__docs" aria-label="Documents joints">' + c.docs.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
      '<p class="cap"><span>' + esc(c.credit) + '</span></p>' +
      '<p><a class="link-ink" href="' + c.url + '" target="_blank" rel="noopener">Lire et télécharger sur Prezly <span class="arr">↗</span></a></p>' +
      '</article>';
  }

  function render(animate) {
    var words = norm(state.q).split(/\s+/).filter(Boolean);
    var res = all.filter(function (c) {
      if (state.client !== 'tous' && c.clients.indexOf(state.client) < 0) return false;
      if (!words.length) return true;
      var hay = norm([c.title, CDF.clientNames(c).join(' '), c.clients.map(function (k) { return CDF.CLIENTS[k].place + ' ' + CDF.CLIENTS[k].detail; }).join(' '), c.docs.join(' '), CDF.fmtLong(c.date)].join(' '));
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    if (state.sort === 'asc') res = res.slice().reverse();
    var isDefault = state.client === 'tous' && !words.length && state.sort === 'desc';
    list.innerHTML = res.map(function (c, k) { return card(c, isDefault && k === 0); }).join('');
    empty.hidden = res.length > 0;
    count.textContent = res.length + (res.length > 1 ? ' communiqués' : ' communiqué') + (state.client !== 'tous' ? ' · ' + CDF.CLIENTS[state.client].name : '') + (words.length ? ' · « ' + state.q.trim() + ' »' : '');
    var cards = qsa('.pc', list);
    if (ready) attachAll(cards);
    if (ANIM && animate) gsap.fromTo(cards, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out', clearProps: 'transform' });
    if (ANIM && ready) ScrollTrigger.refresh();
  }
  var ready = false;
  function attachAll(cards) {
    if (!ANIM) return;
    cards.forEach(function (el) {
      var fig = qs('[data-ht]', el);
      var item = CDF.attachHT(fig);
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { CDF.develop(fig, item, 1.3); } });
    });
  }

  function setClient(k) {
    state.client = k;
    qsa('button', filters).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    render(true);
  }
  filters.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setClient(b.getAttribute('data-k')); });
  var timer = null;
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { state.q = q.value; render(true); }, 160); });
  sort.addEventListener('change', function () { state.sort = sort.value; render(true); });

  var h = location.hash.replace('#', '');
  if (h && counts[h]) { setClient(h); } else render(false);

  CDF.ready(function () { ready = true; attachAll(qsa('.pc', list)); });
})();
