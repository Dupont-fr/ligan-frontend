# =============================================================================
# Dockerfile du frontend LIGAN+
#
# Build "multi-etapes" (multi-stage) :
#   1) etape "build" : Node installe les dependances et compile l'application
#      React/Vite -> produit le dossier dist/ (fichiers HTML/CSS/JS statiques).
#   2) etape finale : Nginx (serveur web) sert ces fichiers statiques.
#
# Avantage : l'image finale ne contient PAS Node ni les dependances npm
# (plusieurs centaines de Mo en moins), juste Nginx + les fichiers compiles.
# =============================================================================

# --- Etape 1 : compilation ---------------------------------------------------
# Node 20 base Debian (meme famille que le backend).
FROM node:20-slim AS build

WORKDIR /app

# Manifestes d'abord (cache Docker : si le code change mais pas les
# dependances, "npm ci" n'est pas refait).
COPY package.json package-lock.json ./

# Installation deterministe (devDependencies incluses : tsc + vite en ont besoin).
RUN npm ci --no-audit --no-fund

# Le reste du code source.
COPY . .

# Compile : "tsc -b" (verification des types) puis "vite build" -> dist/.
RUN npm run build

# --- Etape 2 : service (Nginx) ----------------------------------------------
FROM nginx:1.27-alpine

# Notre configuration Nginx (SPA + proxy /api et /uploads vers le backend).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On recupere UNIQUEMENT le resultat compile de l'etape precedente.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx ecoute sur le port 80 DANS le conteneur.
EXPOSE 80

# Commande par defaut de l'image nginx : demarrage au premier plan.
# (pas besoin de la redefinir)
