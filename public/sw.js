/* LIGAN+ — Service worker minimal.
 *
 * Objectif : permettre l'ouverture de l'application installée même sans
 * connexion, SANS jamais servir de donnée périmée ou de contenu métier.
 *
 * Règles volontairement simples et sûres :
 * - seule la navigation et les ressources statiques (assets, images) sont gérées ;
 * - l'API (`/api/...`) n'est JAMAIS interceptée ni mise en cache ;
 * - le HTML est toujours servi depuis le réseau quand il est disponible
 *   (donc pas de risque de coquille obsolète après un déploiement) ;
 * - le cache est purgé à chaque nouvelle version du service worker.
 */

const CACHE_VERSION = 'v4';
const CACHE_NAME = `ligan-shell-${CACHE_VERSION}`;
/* Racine de l'application (compatible avec un déploiement sous un sous-chemin). */
const SHELL_URL = new URL(self.registration.scope).pathname;

/* Ressources indispensables au lancement de l'application installée
 * (logo, icônes, manifeste) : pré-chargées pour rester disponibles hors
 * connexion et pour que l'icône de l'application soit toujours présente. */
const PRECACHE_URLS = [
  './manifest.webmanifest',
  './logo-mark.png',
  './favicon.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

/**
 * Prépare une réponse pour le cache.
 *
 * Le corps d'une réponse réseau est déjà décodé par le navigateur, mais
 * l'en-tête `content-encoding` reste présent : le renvoyer tel quel depuis le
 * cache provoquerait une double décompression. On le retire donc, ainsi que
 * `content-length` qui ne correspond plus.
 */
function toCacheable(response) {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Met en cache la coquille de l'application (HTML) et les fichiers du bundle
 * référencés par celle-ci. Indispensable : les assets sont chargés avant que
 * le service worker ne contrôle la page, ils ne seraient donc jamais
 * interceptés et le mode hors connexion ne fonctionnerait pas.
 */
async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(SHELL_URL, { cache: 'no-cache' });
    if (!response || !response.ok) return;

    await cache.put(SHELL_URL, toCacheable(response.clone()));

    const html = await response.text();
    const urls = new Set();
    const pattern = /(?:src|href)="([^"]*\/assets\/[^"]+)"/g;
    let match = pattern.exec(html);
    while (match !== null) {
      urls.add(match[1]);
      match = pattern.exec(html);
    }

    await Promise.all(
      [...urls].map(async (url) => {
        try {
          const asset = await fetch(url, { cache: 'no-cache' });
          if (asset && asset.ok) await cache.put(url, toCacheable(asset));
        } catch {
          /* asset indisponible : il sera récupéré au premier chargement */
        }
      }),
    );

    // Tous les fichiers du build (pages « lazy » comprises) : elles restent
    // accessibles hors connexion, même si l'utilisateur ne les a jamais visitées.
    try {
      const manifestUrl = new URL('asset-manifest.json', self.registration.scope);
      const manifest = await fetch(manifestUrl, { cache: 'no-cache' });
      if (manifest && manifest.ok) {
        const data = await manifest.json();
        const files = Object.values(data)
          .map((entry) => entry && entry.file)
          .filter((file) => typeof file === 'string');
        await Promise.all(
          files.map(async (file) => {
            try {
              const asset = await fetch(file, { cache: 'no-cache' });
              if (asset && asset.ok) await cache.put(file, toCacheable(asset));
            } catch {
              /* fichier indisponible : ignoré */
            }
          }),
        );
      }
    } catch {
      /* manifeste absent : le pré-cache se limite à la coquille */
    }

    // Logo, icônes et manifeste : nécessaires à l'application installée.
    await Promise.all(
      PRECACHE_URLS.map(async (url) => {
        try {
          const asset = await fetch(new URL(url, self.registration.scope), { cache: 'no-cache' });
          if (asset && asset.ok) await cache.put(new URL(url, self.registration.scope).pathname, toCacheable(asset));
        } catch {
          /* ressource indisponible : ignorée */
        }
      }),
    );
  } catch {
    /* hors ligne au moment de l'installation : on retentera à l'activation */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => precacheShell())
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Uniquement les requêtes GET en lecture.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ressources externes (Google Fonts, etc.) : réseau direct, hors de notre portée.
  if (url.origin !== self.location.origin) return;

  // L'API n'est jamais servie depuis le cache : aucune donnée métier périmée.
  if (url.pathname.startsWith('/api/')) return;

  // Navigation : réseau en priorité, cache en secours (mode hors connexion).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(SHELL_URL, toCacheable(copy)));
          return response;
        })
        .catch(() =>
          caches
            .match(SHELL_URL, { ignoreVary: true })
            .then((cached) => cached || caches.match('/index.html', { ignoreVary: true })),
        ),
    );
    return;
  }

  // Ressources statiques : cache d'abord, mise à jour silencieuse en arrière-plan.
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, toCacheable(copy)));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
