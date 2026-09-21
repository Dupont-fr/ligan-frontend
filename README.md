# Ligan+ — Frontend

Application web de **Ligan+** (découverte de professionnels locaux). Site **statique**
React + TypeScript + Vite + Tailwind CSS. Le backend est un dépôt séparé (`ligan-backend`).

> Déployé indépendamment du backend sur **GitHub Pages** (voir ci-dessous).

## Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4 (design tokens : `src/styles/tokens.css`, thème clair + sombre)
- React Router, TanStack Query, React Hook Form, Zod, lucide-react

## Démarrage local

```bash
npm install
npm run dev        # http://localhost:5173 (proxifie /api vers http://localhost:5000)
```

```bash
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build
```

## Déploiement (indépendant du backend)

### 1. Créer le dépôt GitHub et pousser le code

```bash
# depuis le dossier frontend/
git init -b main
git add .
git commit -m "feat: initialiser le frontend Ligan+"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/ligan-frontend.git
git push -u origin main
```

### 2. Activer GitHub Pages

Dans le dépôt : **Settings → Pages → Source : « GitHub Actions »** (ne pas choisir
« Deploy from a branch »).

### 3. Configurer l'URL de l'API

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valeur |
| --- | --- |
| `VITE_API_URL` | URL de l'API backend en production (ex. `https://ligan-backend.onrender.com`). Laisse vide tant que le backend n'est pas déployé. |

### 4. Déployer

Le workflow `.github/workflows/deploy-pages.yml` se déclenche à chaque push sur `main`
(ou manuellement via **Actions → Deploy frontend sur GitHub Pages → Run workflow**).
Le site est ensuite publié sur `https://VOTRE-COMPTE.github.io/ligan-frontend/`.

> ℹ️ La `base` Vite est injectée automatiquement (`VITE_BASE=/<repo>/`) par le workflow.
> Les routes SPA seront gérées via `public/404.html` dès le Sprint 1 (React Router).

## Variables d'environnement

```bash
cp .env.example .env   # VITE_API_URL (vide en dev, le proxy Vite gère /api)
```

Ne jamais committer de secrets (`npm run build` avec `VITE_API_URL` défini dans le job CI).