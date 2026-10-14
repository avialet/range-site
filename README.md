# range.vialet.app

Site de présentation de [Range](https://github.com/avialet/range), app native pour Mac.
Une page statique, sans framework, sans cookie, sans traceur.

- `site/public/` : le site (HTML, CSS, JavaScript)
- `docs/deploiement.md` : déploiement par `rsync` et configuration du serveur
- `.github/workflows/deploy.yml` : synchronisation à chaque push sur `main`

Le bouton de téléchargement lit la dernière version publiée sur GitHub ; l'apparence
suit le mode clair ou sombre du système.

## Images à fournir

Aucune image n'est livrée avec le gabarit. À produire pour chaque app, à la racine de `site/public/` :

| Fichier | Taille |
|---|---|
| `icone-256.png` | 256 × 256 px |
| `favicon.png` | 64 × 64 px |
| `apple-touch-icon.png` | 180 × 180 px |
| `og.png` | 1200 × 630 px |

`site/public/img/` (vide, gardé par `.gitkeep`) reçoit les captures d'écran éventuelles, en WebP de préférence.

Aperçu local : `cd site/public && python3 -m http.server 8766`, puis http://localhost:8766.

Licence [MIT](LICENSE).
