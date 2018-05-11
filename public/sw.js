self.addEventListener('install',function(e) {
    console.log('SW Installed');
    e.waitUntil(caches.open('static')
    .then((cache)=>{
        cache.addAll([
            '/',
            '/index.html',
            '/src/lib/bootstrap.min.css',
            '/src/styles.css',
            '/src/lib/jquery-3.3.1.min.js',
            '/src/main.js',
            'https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css',
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
                return fetch(e.request)
            }
        })
    );
});