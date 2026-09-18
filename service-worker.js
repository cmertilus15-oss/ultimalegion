/* Caso Cerrado · service-worker.js — cachea todo para que funcione sin internet */
const CACHE = 'casocerrado-v1';
const FILES = ['./','./index.html','./style.css','./data.js','./script.js','./manifest.json',
               './assets/icon-192.png','./assets/icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(
    ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const copia = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copia)).catch(()=>{});
      return res;
    }).catch(()=> caches.match('./index.html')))
  );
});
