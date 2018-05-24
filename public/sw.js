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
            'https://api.mapbox.com/styles/v1/sci-ranch/cjh4soqa72hkb2sqqoh8sympp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2NpLXJhbmNoIiwiYSI6ImNqaDRzbjQyNjBxZGwyd28yeGVxOGE3dHUifQ.JTSE-HY4u1v3MWIRhoT8ig',
            'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
            '/src/animals.json',
            'https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css',
            'https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.1/markdown-it.min.js',
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