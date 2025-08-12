// Main PWA Application Controller
class FarmManagementApp {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardStats();
        this.checkForUpdates();
    }

    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navClose = document.getElementById('nav-close');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.add('open');
        });

        navClose.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('open');
            }
        });

        // Navigation links
        document.querySelectorAll('[data-view]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.getAttribute('data-view') || e.target.closest('[data-view]').getAttribute('data-view');
                this.navigateToView(view);
                navMenu.classList.remove('open');
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigateToView(e.state.view, false);
            }
        });
    }

    navigateToView(viewName, updateHistory = true) {
        // Hide all views
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Update navigation active state
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const activeLink = document.querySelector(`[data-view="${viewName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Update browser history
            if (updateHistory) {
                const url = viewName === 'dashboard' ? '/' : `/#${viewName}`;
                history.pushState({ view: viewName }, '', url);
            }

            // Load app-specific content
            this.loadAppContent(viewName);
        }
    }

    loadAppContent(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'farm-planner':
                this.loadFarmPlannerApp();
                break;
            case 'management-tracker':
                this.loadManagementTrackerApp();
                break;
            case 'revenue-planner':
                this.loadRevenuePlannerApp();
                break;
        }
    }

    loadDashboardStats() {
        // Load stats from localStorage or API
        const stats = this.getStoredStats();
        
        document.getElementById('active-tasks').textContent = stats.activeTasks || 0;
        document.getElementById('upcoming-activities').textContent = stats.upcomingActivities || 0;
        document.getElementById('total-fields').textContent = stats.totalFields || 0;
        document.getElementById('revenue-plans').textContent = stats.revenuePlans || 0;
    }

    loadFarmPlannerApp() {
        const iframe = document.getElementById('farm-planner-frame');
        if (iframe && !iframe.src.includes('farm-planner.html')) {
            this.showLoading();
            iframe.onload = () => this.hideLoading();
            iframe.src = 'apps/farm-planner.html';
        }
    }

    loadManagementTrackerApp() {
        const iframe = document.getElementById('management-tracker-frame');
        if (iframe && !iframe.src.includes('management-tracker.html')) {
            this.showLoading();
            iframe.onload = () => this.hideLoading();
            iframe.src = 'apps/management-tracker.html';
        }
    }

    loadRevenuePlannerApp() {
        const iframe = document.getElementById('revenue-planner-frame');
        if (iframe && !iframe.src.includes('revenue-planner.html')) {
            this.showLoading();
            iframe.onload = () => this.hideLoading();
            iframe.src = 'apps/revenue-planner.html';
        }
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }

    getStoredStats() {
        try {
            // Aggregate stats from all apps
            const farmPlannerData = JSON.parse(localStorage.getItem('farmPlannerTasks') || '[]');
            const managementData = JSON.parse(localStorage.getItem('managementTasks') || '[]');
            const revenueData = JSON.parse(localStorage.getItem('revenuePlans') || '[]');

            return {
                activeTasks: farmPlannerData.length,
                upcomingActivities: this.getUpcomingActivities(farmPlannerData),
                totalFields: this.getTotalFields(farmPlannerData),
                revenuePlans: revenueData.length
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return {};
        }
    }

    getUpcomingActivities(tasks) {
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
        
        return tasks.filter(task => {
            const taskDate = new Date(task.startDate);
            return taskDate >= now && taskDate <= twoWeeksFromNow;
        }).length;
    }

    getTotalFields(tasks) {
        const fields = new Set();
        tasks.forEach(task => {
            if (task.fieldName) {
                fields.add(task.fieldName);
            }
        });
        return fields.size;
    }

    checkForUpdates() {
        // Check for app updates if service worker is available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    console.log('App update available');
                    // Could show update notification here
                });
            });
        }
    }

    // Cross-app communication methods
    updateStats() {
        if (this.currentView === 'dashboard') {
            this.loadDashboardStats();
        }
    }

    // Offline status handling
    handleOfflineStatus() {
        window.addEventListener('online', () => {
            console.log('App is online');
            // Sync data when coming back online
        });

        window.addEventListener('offline', () => {
            console.log('App is offline');
            // Show offline indicator
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FarmManagementApp();
    
    // Handle initial route
    const hash = window.location.hash.slice(1);
    if (hash && ['farm-planner', 'management-tracker', 'revenue-planner'].includes(hash)) {
        app.navigateToView(hash);
    }
    
    // Make app globally available for cross-frame communication
    window.farmApp = app;
});

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions for use in iframe apps
window.farmAppUtils = {
    formatDate,
    formatCurrency,
    updateStats: () => window.farmApp?.updateStats()
};