/**
 * Service Worker for Crop Planning PWA
 * Handles offline caching and resource management
 */

const CACHE_NAME = 'sefake-farms-v1.2.2';
const CACHE_URLS = [
    './',
    './index.html',
    './app.js',
    './style.css',
    './manifest.json',
    './assets/logo.svg',
    // Chart.js from CDN - cache for offline use
    'https://cdn.jsdelivr.net/npm/chart.js'
];

/**
 * Service Worker Installation
 * Pre-cache essential resources
 */
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Files cached successfully');
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching files', error);
            })
    );
});

/**
 * Service Worker Activation
 * Clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                // Ensure the service worker takes control immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event Handler
 * Implement network-first strategy for app.js to get latest updates
 */
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching', event.request.url);
    
    // Use network-first for app.js to ensure latest updates
    if (event.request.url.includes('app.js')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone and cache the response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Cache-first for all other resources
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();
                        
                        // Add successful responses to cache for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Only cache GET requests
                                if (event.request.method === 'GET') {
                                    console.log('Service Worker: Caching new resource', event.request.url);
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // For navigation requests, return offline page or cached index
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        // For other requests, throw the error
                        throw error;
                    });
            })
    );
});

/**
 * Background Sync Handler (if needed in future)
 * Handle background synchronization when connection is restored
 */
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync event', event.tag);
    
    if (event.tag === 'crop-data-sync') {
        event.waitUntil(
            // Implement background sync logic here if needed
            // For now, just log the event
            Promise.resolve().then(() => {
                console.log('Service Worker: Background sync completed');
            })
        );
    }
});

/**
 * Push Notification Handler (for future enhancement)
 * Handle push notifications for crop reminders
 */
self.addEventListener('push', event => {
    console.log('Service Worker: Push event received');
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New crop planning notification',
            icon: './icon-192x192.png',
            badge: './icon-96x96.png',
            tag: 'crop-notification',
            data: data.data || {}
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Crop Planner',
                options
            )
        );
    }
});

/**
 * Notification Click Handler
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./')
    );
});

/**
 * Message Handler
 * Handle messages from the main application
 */
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                event.waitUntil(
                    caches.delete(CACHE_NAME).then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
                );
                break;
            default:
                console.log('Service Worker: Unknown message type', event.data.type);
        }
    }
});

/**
 * Error Handler
 * Handle service worker errors
 */
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred', event.error);
});

/**
 * Unhandled Rejection Handler
 * Handle unhandled promise rejections
 */
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});