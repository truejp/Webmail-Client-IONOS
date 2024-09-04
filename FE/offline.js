const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
  };
  
  self.addEventListener("install", (event) => {
    event.waitUntil(
      addResourcesToCache([
        '/',
        '/inbox.html',
        '/auth.html',
        '/settings.html',
        '/contacts.html',
        '/contact-detail.html',
        '/assets/libs/sweetalert2/dist/sweetalert2.min.js',
        '/assets/libs/sweetalert2/dist/sweetalert2.min.css',
        '/assets/ionos-mail-lib/auth_controller.js',
        '/assets/ionos-mail-lib/mail_controller.js',
        '/assets/ionos-mail-lib/ui_controller.js',
        '/assets/ionos-mail-lib/sync_controller.js',
        '/assets/ionos-mail-lib/autoloader.js',
        '/dist/css/style.css',
        '/dist/css/pages/email.css',
        '/assets/images/favicon.ico',
        '/assets/images/io-logo.svg',
        '/assets/libs/jquery/dist/jquery.min.js',
        '/dist/js/materialize.min.js',
        '/assets/libs/perfect-scrollbar/dist/js/perfect-scrollbar.jquery.min.js',
        '/dist/js/app.js',
        '/dist/js/app.init.js',
        '/dist/js/app-style-switcher.js',
        '/dist/js/custom.min.js',
        '/assets/libs/tinymce/tinymce.min.js',
      ])
    );
  });

  const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
  };
  
  const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      // offline mode
      if (typeof setOffline === "function") {
        setOffline();
    }
      return responseFromCache;
    }
    const responseFromNetwork = await fetch(request);
    putInCache(request, responseFromNetwork.clone());
    // online mode
    if (typeof setOnline === "function") {
        setOnline();
    }
    return responseFromNetwork;
  };
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request));
  });