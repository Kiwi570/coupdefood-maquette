/* Coup de Food — données de la salle de presse.
   Un seul fichier à tenir à jour : chaque communiqué est trié automatiquement par date
   (le plus récent en tête) sur l'accueil, la page projet et la salle de presse.
   Source : salle de presse Prezly de Coup de Food, relevée le 22 octobre 2026. */
(function () {
  var PREZLY = 'https://coup-de-food-e62b1bff.prezly.com/';

  var CLIENTS = {
    incorrect: { name: 'Incorrect', place: 'Namur', detail: 'Pizzeria, rue Haute-Marcelle 35', url: 'https://www.incorrect.pizza/', page: 'projet-incorrect.html' },
    mylord: { name: 'Château du Mylord', place: 'Ellezelles', detail: 'Restaurant, chef Martin Simonart', url: 'https://www.restaurant-mylord.be/' },
    crabclub: { name: 'Crab Club', place: 'Flagey', detail: '' },
    rizom: { name: 'Rizom', place: 'Grand-Hornu', detail: 'Chef Olivier De Vriendt' },
    rhubarb: { name: 'Rhubarb', place: 'Place Keym', detail: 'Café-cantine de quartier' },
    onsenfish: { name: 'On s’en fish', place: '', detail: 'La boucherie de la mer', url: 'http://www.onsen.fish/' },
    addis: { name: 'Addis Stories', place: '', detail: 'Coffee bar', url: 'https://www.instagram.com/addis_stories/' },
    garcons: { name: 'Les Garçons Bouchers', place: 'Dieweg', detail: 'Boucherie artisanale', url: 'https://www.lesgarconsbouchers.be/' }
  };

  var COMMUNIQUES = [
    { slug: 'alex-a-filme-ses-delires-pour-expliquer-ses-pizzas', date: '2026-10-22', title: 'Alex filme ses délires pour expliquer ses pizzas !', clients: ['incorrect'], img: 'presse-incorrect-film', credit: 'Photo © Anthony Florio', docs: ['Communiqué « Incorrect, le film »', 'Dossier de presse Incorrect, octobre 2026'] },
    { slug: 'les-jeunes-invites-a-se-regaler-au-chateau-du-mylord-a-petits-prix', date: '2026-09-30', title: 'Les jeunes invités à se régaler à petits prix au Château du Mylord', clients: ['mylord'], img: 'presse-mylord-jeunes', credit: 'Crédit photo à compléter', docs: ['Communiqué « Menu Jeunes »', 'Dossier de presse Château du Mylord'] },
    { slug: 'et-si-on-parlait-des-pizzas-correctes-dincorrect', date: '2026-06-25', title: 'Et si on parlait des pizzas correctes d’Incorrect ?', clients: ['incorrect'], img: 'presse-incorrect-pizzas', credit: 'Crédit photo à compléter', docs: ['Dossier de presse Incorrect, juin 2026', '« À partager… ou pas ! »', 'Suggestions du moment'] },
    { slug: 'crab-club-jette-lancre-sur-flagey', date: '2026-05-12', title: 'Crab Club jette l’ancre à Flagey', clients: ['crabclub'], img: 'presse-crab-club', credit: 'Crédit photo à compléter', docs: ['Communiqué Crab Club', 'Dossier de presse Crab Club'] },
    { slug: 'terrasses-et-apero-time-sont-de-sortie', date: '2026-04-29', title: 'Terrasses et apéro-time sont de sortie !', clients: ['rhubarb', 'mylord', 'incorrect', 'rizom', 'garcons'], img: 'presse-terrasses', credit: 'Photo © Anthony Florio', docs: ['Dossier de presse Les Garçons Bouchers'], selection: true },
    { slug: 'au-mylord-le-printemps-sinvite-a-table-et-en-terrasse', date: '2026-04-23', title: 'Au Mylord, le printemps s’invite à table… et en terrasse !', clients: ['mylord'], img: 'presse-mylord-printemps', credit: 'Crédit photo à compléter', docs: ['Communiqué « Printemps en terrasse »', 'Dossier de presse Château du Mylord, printemps', 'Menu Immersion, printemps 2026'] },
    { slug: 'nouvelle-carte-printanniere-chez-incoraect', date: '2026-04-09', title: 'Carte printanière chez Incorrect', clients: ['incorrect'], img: 'presse-incorrect-carte', credit: 'Crédit photo à compléter', docs: ['Communiqué Incorrect', 'Dossier de presse Incorrect'] },
    { slug: 'rhubarb-cafe-cantine-de-quartier', date: '2026-03-31', title: 'Rhubarb, café-cantine de quartier', clients: ['rhubarb'], img: 'presse-rhubarb', credit: 'Visuel basse définition, à remplacer', docs: ['Communiqué Rhubarb', 'Dossier de presse Rhubarb', 'Explication Panini'] },
    { slug: 'rizom-gastronomie-libre', date: '2026-02-19', title: 'Rizom, gastronomie libre', clients: ['rizom'], img: 'presse-rizom', credit: 'Photo © Anthony Florio', docs: ['Communiqué Rizom', 'Dossier de presse Rizom'] },
    { slug: 'on-sen-fish-la-boucherie-de-la-mer', date: '2025-11-13', title: 'On s’en fish, la boucherie de la mer', clients: ['onsenfish'], img: 'presse-on-sen-fish', credit: 'Crédit photo à compléter', docs: ['Communiqué On s’en fish', 'Dossier de presse On s’en fish'] },
    { slug: 'le-chateau-du-mylord-tradition-contemporaine', date: '2025-11-12', title: 'Le Château du Mylord, tradition contemporaine', clients: ['mylord'], img: 'presse-mylord-tradition', credit: 'Crédit photo à compléter', docs: ['Communiqué « Menu gibier »', 'Dossier de presse « Menu gibier »'] },
    { slug: 'incorrect-pizza-x-fermentation', date: '2025-09-12', title: 'Incorrect, pizza × fermentation', clients: ['incorrect'], img: 'presse-incorrect-fermentation', credit: 'Crédit photo à compléter', docs: ['Communiqué Incorrect', 'Dossier de presse Incorrect'] },
    { slug: 'addis-stories-bien-plus-quun-coffee-bar', date: '2025-09-03', title: 'Addis Stories, bien plus qu’un coffee bar', clients: ['addis'], img: 'presse-addis', credit: 'Crédit photo à compléter', docs: ['Communiqué d’ouverture Addis Stories', 'Dossier de presse Addis Stories'] }
  ];

  COMMUNIQUES.forEach(function (c) { c.url = PREZLY + c.slug; });
  COMMUNIQUES.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function parse(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() {
    // date du jour à Bruxelles
    try {
      var s = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      return parse(s);
    } catch (e) { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  }
  function fmtLong(iso) { var d = parse(iso); return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtShort(iso) { var p = iso.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function fmtToday() { var d = today(); return JOURS[d.getDay()] + ' ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysAgo(iso) { return Math.round((today() - parse(iso)) / 86400000); }
  function relative(iso) {
    var n = daysAgo(iso);
    if (n === 0) return 'Paru aujourd’hui';
    if (n === 1) return 'Paru hier';
    if (n > 1 && n < 8) return 'Paru il y a ' + n + ' jours';
    if (n < 0) return 'À paraître';
    return 'Paru le ' + fmtLong(iso);
  }
  function clientNames(c) { return c.clients.map(function (k) { return CLIENTS[k].name; }); }

  window.CDF = {
    PREZLY: PREZLY,
    CLIENTS: CLIENTS,
    COMMUNIQUES: COMMUNIQUES,
    fmtLong: fmtLong, fmtShort: fmtShort, fmtToday: fmtToday, relative: relative, daysAgo: daysAgo, clientNames: clientNames,
    // cadrage des photos verticales affichées dans des cadres horizontaux
    POS: { 'presse-mylord-tradition': '50% 20%', 'presse-terrasses': '50% 60%', 'presse-addis': '50% 30%', 'presse-incorrect-fermentation': '50% 42%', 'presse-incorrect-carte': '50% 48%' },
    img: function (name, sizes) {
      var pos = window.CDF.POS[name];
      return { src: 'assets/img/' + name + '-m.webp', srcset: 'assets/img/' + name + '-m.webp 900w, assets/img/' + name + '-l.webp 1800w', sizes: sizes || '(min-width: 900px) 33vw, 100vw', attr: pos ? ' style="object-position:' + pos + '"' : '' };
    }
  };
})();
