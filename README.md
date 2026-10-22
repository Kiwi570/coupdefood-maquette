# Coup de Food — maquette « La Une »

Site statique (HTML, CSS, JavaScript), sans étape de construction, prêt pour Vercel.

## Pages
- `index.html` : accueil (la Une, édito, services, méthode, projets, entretien, valeurs, dépêches, contact)
- `projet-incorrect.html` : page projet type (Incorrect)
- `salle-de-presse.html` : tous les communiqués, recherche et filtres
- `confidentialite.html`, `conditions.html` : pages légales reprises du site actuel

## Mettre à jour
- **Communiqués** : un seul fichier, `assets/js/data.js`. Ajouter une ligne ; le tri par date, la mention « Paru aujourd’hui », le fil des dépêches, les cartes projets et la salle de presse se mettent à jour seuls.
- **Images** : `assets/img/<nom>-m.webp` (900 px) et `<nom>-l.webp` (1800 px). Les visuels actuels sont provisoires et portent la mention « Visuel provisoire ».

## Bibliothèques hébergées avec le site
GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3, OGL 1.0 (intégré à `assets/js/halftone.js`).
Polices : Anton, Newsreader, IBM Plex Mono (licence SIL OFL, fichiers dans `assets/fonts`).

## Accessibilité
Le bouton « Mode calme » (et le réglage « réduire les animations » du système) affiche le site complet sans animation.
