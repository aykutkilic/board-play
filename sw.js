// Service worker: makes the game installable and keeps it up to date.
// Network-first for the game's own files (an online player always runs the
// latest release; the cache is only a fallback). Each release gets a fresh
// cache; only this game's old caches are dropped (other games share the
// origin – aykutkilic.github.io – and keep theirs).
const VERSION = '8fbd843.11241031';
const CACHE = `boardgames-${VERSION}`;
const SHELL = ['./', './index.html', './manifest.webmanifest', './src/style.css', './src/main.js', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    try {
      const c = await caches.open(CACHE);
      await c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })));
    } catch { /* offline install: the cache fills as files are used */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('boardgames-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('/version.json')) return;
  // only inside this game's own folder
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  e.respondWith((async () => {
    try {
      const res = req.mode === 'navigate' ? await fetch(req.url, { cache: 'no-cache' }) : await fetch(req, { cache: 'no-cache' });
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)));
      }
      return res;
    } catch {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
