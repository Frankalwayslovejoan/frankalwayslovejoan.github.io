// sw.js - 萌車日記離線盾牌 (完全自給自足版)
const CACHE_NAME = 'moecar-journal-v3'; // 再次升級版本號，強迫刷新
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './database.js',
  './manifest.json'
];

// ... 底下的 install、activate、fetch 監聽維持原樣不變唷！ ...

// 1. 安裝時把所有衣服（靜態資源）抓進快取口袋
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. 激活時把舊版本的快取口袋清理乾淨
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 攔截請求：斷網時老子自己從口袋拿資料，絕不破圖、絕不轉圈圈！
self.addEventListener('fetch', (e) => {
  // 排除 chrome-extension 等神祕第三方請求，避免報錯
  if (!e.request.url.startsWith(self.location.origin) && !e.request.url.startsWith('https://img.icons8.com')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request);
    })
  );
});