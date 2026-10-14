# Déploiement de range.vialet.app

Le site est statique (`site/public`). Chaque push sur `main` le synchronise sur
le serveur par `rsync` via SSH, grâce au workflow `.github/workflows/deploy.yml`.

## Réglages du dépôt GitHub

| Nom | Type | Rôle |
|---|---|---|
| `DEPLOY_ENABLED` | variable | `true` pour activer le déploiement |
| `DEPLOY_PATH` | variable | `.` (la clé est enfermée dans le dossier du site par `rrsync`) |
| `DEPLOY_HOST` | secret | nom d'hôte ou IP du serveur |
| `DEPLOY_USER` | secret | utilisateur SSH de déploiement |
| `DEPLOY_SSH_KEY` | secret | clé privée **dédiée** à ce site |
| `DEPLOY_KNOWN_HOSTS` | secret | résultat de `ssh-keyscan -t ed25519 <hôte>` |

## Côté serveur (une seule fois)

1. DNS : un enregistrement `range.vialet.app` vers le serveur.
2. Dossier `/var/www/range/site/public`, lisible par nginx et inscriptible par l'utilisateur de déploiement.
3. Bloc nginx, sur le modèle des autres sous-domaines de `vialet.app` (certificat wildcard) :

   ```nginx
   server {
       listen 80; listen [::]:80;
       server_name range.vialet.app;
       return 301 https://$host$request_uri;
   }
   server {
       listen 443 ssl; listen [::]:443 ssl;
       server_name range.vialet.app;
       root /var/www/range/site/public;
       index index.html;
       ssl_certificate /etc/letsencrypt/live/vialet-wildcard/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/vialet-wildcard/privkey.pem;
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

       gzip on;
       gzip_types text/css application/javascript image/svg+xml;
       location ~* \.(webp|png|css|js)$ { expires 7d; add_header Cache-Control "public"; }
       location / { try_files $uri $uri/ =404; }
   }
   ```
4. Clé SSH dédiée (`ssh-keygen -t ed25519 -f range_site_deploy`), clé publique dans
   `authorized_keys` de l'utilisateur de déploiement, restreinte à ce seul dossier :

   ```text
   restrict,command="/usr/bin/rrsync /var/www/range/site/public" ssh-ed25519 AAAA… range-site-deploy
   ```

   La clé ne donne aucun shell et ne peut ni lire ni écrire hors du dossier du site.
   Le `rsync` de macOS (openrsync) n'est pas compatible avec `rrsync` : le déploiement
   se fait depuis GitHub Actions (rsync 3.x), ou avec un rsync 3.x installé via Homebrew.

## Mise à jour du contenu

- Le bouton de téléchargement lit la dernière version publiée sur GitHub (`avialet/range`) :
  publier une nouvelle version de l'app met le site à jour sans le redéployer.
- Les captures d'écran éventuelles vont dans `site/public/img`, converties en WebP au préalable.

## Aperçu local

    cd site/public && python3 -m http.server 8766
