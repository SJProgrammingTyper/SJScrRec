//100
const staticCacheName = "rec-v1";
const dynamicCacheName = "desres-v1";
const assets = [
    "/",
    "index.html",
    "icon.png",
    "index.css",
    "index.js",
    'pages/fallback.html',
    'manifest.json'
]

// install event1
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                for (let i = 0; i < assets.length; i++) {
                    const asset = assets[i];
                    cache.delete(asset);
                }
                
                console.log('installing.')
                cache.addAll(assets);
            })
            .then(self.skipWaiting())
    )
});

// activate event
self.addEventListener('activate', evt => {
    console.log("service worker activated")
});

//fetch

self.addEventListener("fetch", (eve) => {
    eve.respondWith(
        caches.match(eve.request).then(cacheres => {
            return cacheres ?? fetch(eve.request).then((res)=>{
                return caches.open(dynamicCacheName).then((cache)=>{
                    cache.put(eve.request,res.clone()).then(()=>{
                        return res;
                    })
                })
            });
        })    
    )
})

