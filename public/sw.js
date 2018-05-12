self.addEventListener('install',function(e) {
    console.log('SW Installed');
    e.waitUntil(caches.open('static')
    .then((cache)=>{
        cache.addAll([
            '/',
            '/index.html',
            'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css',
            '/src/styles.css',
            '/src/lib/jquery-3.3.1.min.js',
            '/src/main.js',
            'https://use.fontawesome.com/releases/v5.0.13/css/all.css',
            'https://www.gstatic.com/firebasejs/5.0.2/firebase.js'
        ]);
    }));
}); 

self.addEventListener('activate',function() {
    console.log('SW activated');
}); 

self.addEventListener('fetch',(e)=>{
    e.respondWith(
        caches.match(e.request)
        .then((res)=>{
            if(res) {
                return res;
            } else {
                return fetch(e.request);
            }
        })
    );
});