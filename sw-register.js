// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Show update available notification
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    });
}

function showUpdateNotification() {
    // Simple update notification
    if (confirm('A new version is available. Would you like to update?')) {
        window.location.reload();
    }
}