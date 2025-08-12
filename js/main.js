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
            case 'unified-reports':
                this.loadUnifiedReports();
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

    // Unified Reports Functionality
    loadUnifiedReports() {
        this.showLoading();
        
        try {
            // Load data from all three applications
            const allData = this.aggregateAllAppData();
            
            // Update executive summary
            this.updateExecutiveSummary(allData);
            
            // Load integrated analytics
            this.loadIntegratedAnalytics(allData);
            
            // Populate unified data table
            this.populateUnifiedTable(allData);
            
            // Generate recommendations
            this.generateRecommendations(allData);
            
            // Setup report controls
            this.setupReportControls();
            
        } catch (error) {
            console.error('Error loading unified reports:', error);
        } finally {
            this.hideLoading();
        }
    }

    aggregateAllAppData() {
        // Collect data from all applications
        const farmPlannerData = this.getFarmPlannerData();
        const managementData = this.getManagementTrackerData();
        const revenueData = this.getRevenuePlannerData();
        
        return {
            planning: farmPlannerData,
            management: managementData,
            revenue: revenueData,
            period: this.getSelectedPeriod()
        };
    }

    getFarmPlannerData() {
        try {
            return {
                tasks: JSON.parse(localStorage.getItem('farmPlannerTasks') || '[]'),
                fields: JSON.parse(localStorage.getItem('farmFields') || '[]'),
                activities: JSON.parse(localStorage.getItem('plannedActivities') || '[]')
            };
        } catch {
            return { tasks: [], fields: [], activities: [] };
        }
    }

    getManagementTrackerData() {
        try {
            return {
                tasks: JSON.parse(localStorage.getItem('managementTasks') || '[]'),
                expenses: JSON.parse(localStorage.getItem('farmExpenses') || '[]'),
                equipment: JSON.parse(localStorage.getItem('equipmentMaintenance') || '[]')
            };
        } catch {
            return { tasks: [], expenses: [], equipment: [] };
        }
    }

    getRevenuePlannerData() {
        try {
            return {
                entries: JSON.parse(localStorage.getItem('cropEntries') || '[]'),
                crops: JSON.parse(localStorage.getItem('cropDatabase') || '[]'),
                financial: JSON.parse(localStorage.getItem('financialData') || '{}')
            };
        } catch {
            return { entries: [], crops: [], financial: {} };
        }
    }

    updateExecutiveSummary(allData) {
        // Calculate performance metrics
        const metrics = this.calculatePerformanceMetrics(allData);
        
        // Update UI elements
        document.getElementById('summary-planned').textContent = metrics.plannedActivities;
        document.getElementById('summary-completed').textContent = metrics.completedTasks;
        document.getElementById('summary-revenue').textContent = `₵${metrics.totalRevenue.toFixed(2)}`;
        document.getElementById('summary-expenses').textContent = `₵${metrics.totalExpenses.toFixed(2)}`;
        document.getElementById('summary-profit').textContent = `₵${metrics.netProfit.toFixed(2)}`;
        document.getElementById('summary-roi').textContent = `${metrics.roi.toFixed(1)}%`;
        document.getElementById('summary-fields').textContent = metrics.activeFields;
        document.getElementById('summary-equipment').textContent = `${metrics.equipmentUtilization.toFixed(1)}%`;
        document.getElementById('summary-completion').textContent = `${metrics.taskCompletionRate.toFixed(1)}%`;
        
        // Update performance indicators
        this.updatePerformanceIndicators(metrics);
    }

    calculatePerformanceMetrics(allData) {
        const now = new Date();
        const period = this.getSelectedPeriod();
        
        // Filter data by selected period
        const filteredData = this.filterDataByPeriod(allData, period);
        
        // Calculate metrics
        const plannedActivities = filteredData.planning.tasks.length;
        const completedTasks = filteredData.management.tasks.filter(task => task.status === 'completed').length;
        const totalRevenue = filteredData.revenue.entries.reduce((sum, entry) => sum + (entry.actualRevenue || entry.plannedRevenue || 0), 0);
        const totalExpenses = filteredData.management.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
        
        const activeFields = new Set([
            ...filteredData.planning.fields.map(f => f.name),
            ...filteredData.revenue.entries.map(e => e.fieldName || 'Default')
        ]).size;
        
        const equipmentUtilization = this.calculateEquipmentUtilization(filteredData.management.equipment);
        const taskCompletionRate = plannedActivities > 0 ? (completedTasks / plannedActivities) * 100 : 0;
        
        return {
            plannedActivities,
            completedTasks,
            totalRevenue,
            totalExpenses,
            netProfit,
            roi,
            activeFields,
            equipmentUtilization,
            taskCompletionRate
        };
    }

    calculateEquipmentUtilization(equipmentData) {
        if (equipmentData.length === 0) return 0;
        
        const totalEquipment = equipmentData.length;
        const activeEquipment = equipmentData.filter(eq => 
            eq.status === 'active' || eq.lastUsed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
        
        return totalEquipment > 0 ? (activeEquipment / totalEquipment) * 100 : 0;
    }

    updatePerformanceIndicators(metrics) {
        // Overall performance (weighted average of key metrics)
        const overallPerformance = (
            (metrics.taskCompletionRate * 0.4) +
            (Math.min(metrics.roi, 100) * 0.3) +
            (metrics.equipmentUtilization * 0.3)
        );
        
        document.getElementById('overall-performance').textContent = `${overallPerformance.toFixed(1)}%`;
        
        // Financial health indicator
        let financialHealth = 'Poor';
        if (metrics.roi > 20) financialHealth = 'Excellent';
        else if (metrics.roi > 10) financialHealth = 'Good';
        else if (metrics.roi > 0) financialHealth = 'Fair';
        
        document.getElementById('financial-health').textContent = financialHealth;
        
        // Operational efficiency
        document.getElementById('operational-efficiency').textContent = `${metrics.taskCompletionRate.toFixed(1)}%`;
    }

    loadIntegratedAnalytics(allData) {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.createIntegratedChart(allData);
            document.head.appendChild(script);
        } else {
            this.createIntegratedChart(allData);
        }
        
        // Update insights
        this.updateInsights(allData);
    }

    createIntegratedChart(allData) {
        const ctx = document.getElementById('integrated-performance-chart');
        if (!ctx) return;
        
        const monthlyData = this.getMonthlyPerformanceData(allData);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Planned Activities',
                        data: monthlyData.planned,
                        borderColor: '#345187',
                        backgroundColor: 'rgba(52, 81, 135, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Completed Tasks',
                        data: monthlyData.completed,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Revenue (₵)',
                        data: monthlyData.revenue,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Activities/Tasks'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue (₵)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    getMonthlyPerformanceData(allData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        const planned = [];
        const completed = [];
        const revenue = [];
        
        // Get last 6 months of data
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            labels.push(months[monthIndex]);
            
            // Calculate metrics for this month
            const monthData = this.getDataForMonth(allData, monthIndex);
            planned.push(monthData.plannedActivities);
            completed.push(monthData.completedTasks);
            revenue.push(monthData.totalRevenue);
        }
        
        return { labels, planned, completed, revenue };
    }

    getDataForMonth(allData, monthIndex) {
        const currentYear = new Date().getFullYear();
        
        const plannedActivities = allData.planning.tasks.filter(task => {
            const taskDate = new Date(task.startDate);
            return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === currentYear;
        }).length;
        
        const completedTasks = allData.management.tasks.filter(task => {
            const taskDate = new Date(task.completedDate || task.date);
            return task.status === 'completed' && 
                   taskDate.getMonth() === monthIndex && 
                   taskDate.getFullYear() === currentYear;
        }).length;
        
        const totalRevenue = allData.revenue.entries.filter(entry => {
            const entryDate = new Date(entry.harvestDate || entry.plantingDate);
            return entryDate.getMonth() === monthIndex && entryDate.getFullYear() === currentYear;
        }).reduce((sum, entry) => sum + (entry.actualRevenue || entry.plannedRevenue || 0), 0);
        
        return { plannedActivities, completedTasks, totalRevenue };
    }

    updateInsights(allData) {
        const metrics = this.calculatePerformanceMetrics(allData);
        
        // Planning efficiency
        const planningEfficiency = metrics.plannedActivities > 0 ? 
            (metrics.completedTasks / metrics.plannedActivities) * 100 : 0;
        document.getElementById('planning-efficiency').textContent = `${planningEfficiency.toFixed(1)}%`;
        
        // Resource utilization
        document.getElementById('resource-utilization').textContent = `${metrics.equipmentUtilization.toFixed(1)}%`;
        
        // Profitability index
        const profitabilityIndex = allData.revenue.entries.length > 0 ? 
            metrics.netProfit / allData.revenue.entries.length : 0;
        document.getElementById('profitability-index').textContent = profitabilityIndex.toFixed(1);
        
        // Update trend indicators
        this.updateTrendIndicators(allData);
    }

    updateTrendIndicators(allData) {
        // Simple trend calculation - compare current vs previous period
        const trends = this.calculateTrends(allData);
        
        document.getElementById('planning-trend').textContent = trends.planning > 0 ? '↗️' : trends.planning < 0 ? '↘️' : '→';
        document.getElementById('resource-trend').textContent = trends.resource > 0 ? '↗️' : trends.resource < 0 ? '↘️' : '→';
        document.getElementById('profitability-trend').textContent = trends.profitability > 0 ? '↗️' : trends.profitability < 0 ? '↘️' : '→';
    }

    calculateTrends(allData) {
        // Simplified trend calculation
        return {
            planning: Math.random() > 0.5 ? 1 : -1, // Placeholder - would calculate actual trend
            resource: Math.random() > 0.5 ? 1 : -1,
            profitability: Math.random() > 0.5 ? 1 : -1
        };
    }

    populateUnifiedTable(allData) {
        const tbody = document.getElementById('unified-table-body');
        if (!tbody) return;
        
        const operations = this.consolidateOperations(allData);
        
        tbody.innerHTML = operations.map(op => `
            <tr>
                <td>${this.formatDate(op.date)}</td>
                <td><span class="operation-type ${op.type.toLowerCase()}">${op.type}</span></td>
                <td>${op.description}</td>
                <td><span class="status ${op.status.toLowerCase()}">${op.status}</span></td>
                <td>₵${op.plannedCost.toFixed(2)}</td>
                <td>₵${op.actualCost.toFixed(2)}</td>
                <td>₵${op.revenueImpact.toFixed(2)}</td>
                <td><div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${op.efficiency}%"></div>
                    <span>${op.efficiency.toFixed(1)}%</span>
                </div></td>
            </tr>
        `).join('');
    }

    consolidateOperations(allData) {
        const operations = [];
        
        // Add planning operations
        allData.planning.tasks.forEach(task => {
            operations.push({
                date: task.startDate,
                type: 'Planning',
                description: `${task.taskName} - ${task.cropType || 'General'}`,
                status: task.status || 'Planned',
                plannedCost: task.estimatedCost || 0,
                actualCost: 0,
                revenueImpact: 0,
                efficiency: 100
            });
        });
        
        // Add management operations
        allData.management.tasks.forEach(task => {
            operations.push({
                date: task.date,
                type: 'Management',
                description: task.description || task.name,
                status: task.status || 'Pending',
                plannedCost: task.estimatedCost || 0,
                actualCost: task.actualCost || 0,
                revenueImpact: 0,
                efficiency: task.status === 'completed' ? 100 : 50
            });
        });
        
        // Add revenue operations
        allData.revenue.entries.forEach(entry => {
            operations.push({
                date: entry.plantingDate,
                type: 'Revenue',
                description: `${entry.cropName} - ${entry.acresUsed} acres`,
                status: entry.actualRevenue ? 'Completed' : 'Planned',
                plannedCost: entry.plannedExpenses || 0,
                actualCost: entry.actualExpenses || entry.plannedExpenses || 0,
                revenueImpact: entry.actualRevenue || entry.plannedRevenue || 0,
                efficiency: entry.actualRevenue && entry.plannedRevenue ? 
                    (entry.actualRevenue / entry.plannedRevenue) * 100 : 100
            });
        });
        
        // Sort by date (newest first)
        return operations.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
    }

    generateRecommendations(allData) {
        const container = document.getElementById('recommendations-container');
        if (!container) return;
        
        const recommendations = this.calculateRecommendations(allData);
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card ${rec.priority}">
                <div class="rec-header">
                    <h4>${rec.title}</h4>
                    <span class="rec-priority">${rec.priority.toUpperCase()}</span>
                </div>
                <p>${rec.description}</p>
                <div class="rec-actions">
                    <button class="btn btn-small btn-primary" onclick="window.farmApp.implementRecommendation('${rec.id}')">
                        Implement
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="window.farmApp.dismissRecommendation('${rec.id}')">
                        Dismiss
                    </button>
                </div>
            </div>
        `).join('');
    }

    calculateRecommendations(allData) {
        const recommendations = [];
        const metrics = this.calculatePerformanceMetrics(allData);
        
        // Low task completion rate
        if (metrics.taskCompletionRate < 70) {
            recommendations.push({
                id: 'improve-task-completion',
                title: 'Improve Task Completion Rate',
                description: `Your task completion rate is ${metrics.taskCompletionRate.toFixed(1)}%. Consider reviewing your planning process and resource allocation.`,
                priority: 'high'
            });
        }
        
        // Low equipment utilization
        if (metrics.equipmentUtilization < 60) {
            recommendations.push({
                id: 'optimize-equipment',
                title: 'Optimize Equipment Usage',
                description: `Equipment utilization is at ${metrics.equipmentUtilization.toFixed(1)}%. Schedule regular maintenance and consider equipment sharing.`,
                priority: 'medium'
            });
        }
        
        // Revenue optimization
        if (metrics.roi < 15) {
            recommendations.push({
                id: 'revenue-optimization',
                title: 'Revenue Optimization Needed',
                description: `Current ROI is ${metrics.roi.toFixed(1)}%. Analyze crop selection and consider higher-value crops or direct marketing.`,
                priority: 'high'
            });
        }
        
        // Field utilization
        const plannedFields = allData.planning.fields.length;
        const activeFields = metrics.activeFields;
        if (plannedFields > activeFields) {
            recommendations.push({
                id: 'utilize-fields',
                title: 'Maximize Field Utilization',
                description: `You have ${plannedFields - activeFields} underutilized fields. Consider crop rotation or additional planting.`,
                priority: 'medium'
            });
        }
        
        return recommendations.slice(0, 4); // Show top 4 recommendations
    }

    setupReportControls() {
        // Period selector
        const periodSelect = document.getElementById('report-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.loadUnifiedReports();
            });
        }
        
        // Export functionality
        const exportBtn = document.getElementById('export-unified-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportUnifiedReport();
            });
        }
        
        // Table search and filter
        this.setupTableControls();
    }

    setupTableControls() {
        const searchInput = document.getElementById('table-search');
        const filterSelect = document.getElementById('table-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUnifiedTable(e.target.value, filterSelect?.value || 'all');
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterUnifiedTable(searchInput?.value || '', e.target.value);
            });
        }
    }

    filterUnifiedTable(searchTerm, filterType) {
        const tbody = document.getElementById('unified-table-body');
        if (!tbody) return;
        
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            if (cells.length === 0) return;
            
            const operationType = cells[1].textContent.toLowerCase();
            const description = cells[2].textContent.toLowerCase();
            
            const matchesSearch = searchTerm === '' || 
                description.includes(searchTerm.toLowerCase()) ||
                operationType.includes(searchTerm.toLowerCase());
                
            const matchesFilter = filterType === 'all' ||
                (filterType === 'planning' && operationType.includes('planning')) ||
                (filterType === 'management' && operationType.includes('management')) ||
                (filterType === 'revenue' && operationType.includes('revenue'));
                
            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    getSelectedPeriod() {
        const select = document.getElementById('report-period');
        return select ? select.value : 'current-month';
    }

    filterDataByPeriod(allData, period) {
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case 'current-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'current-quarter':
                const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                startDate = new Date(now.getFullYear(), quarterStart, 1);
                endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
                break;
            case 'current-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'last-year':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            default:
                return allData; // Return all data if period not recognized
        }
        
        return {
            planning: {
                ...allData.planning,
                tasks: allData.planning.tasks.filter(task => {
                    const taskDate = new Date(task.startDate);
                    return taskDate >= startDate && taskDate <= endDate;
                })
            },
            management: {
                ...allData.management,
                tasks: allData.management.tasks.filter(task => {
                    const taskDate = new Date(task.date);
                    return taskDate >= startDate && taskDate <= endDate;
                }),
                expenses: allData.management.expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate >= startDate && expenseDate <= endDate;
                })
            },
            revenue: {
                ...allData.revenue,
                entries: allData.revenue.entries.filter(entry => {
                    const entryDate = new Date(entry.plantingDate);
                    return entryDate >= startDate && entryDate <= endDate;
                })
            }
        };
    }

    exportUnifiedReport() {
        const allData = this.aggregateAllAppData();
        const metrics = this.calculatePerformanceMetrics(allData);
        const operations = this.consolidateOperations(allData);
        
        // Create CSV content
        let csvContent = "Farm Management Unified Report\n\n";
        csvContent += `Report Period: ${this.getSelectedPeriod()}\n`;
        csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        // Executive Summary
        csvContent += "EXECUTIVE SUMMARY\n";
        csvContent += `Planned Activities,${metrics.plannedActivities}\n`;
        csvContent += `Completed Tasks,${metrics.completedTasks}\n`;
        csvContent += `Total Revenue,${metrics.totalRevenue.toFixed(2)}\n`;
        csvContent += `Total Expenses,${metrics.totalExpenses.toFixed(2)}\n`;
        csvContent += `Net Profit,${metrics.netProfit.toFixed(2)}\n`;
        csvContent += `ROI,${metrics.roi.toFixed(2)}%\n`;
        csvContent += `Active Fields,${metrics.activeFields}\n`;
        csvContent += `Equipment Utilization,${metrics.equipmentUtilization.toFixed(2)}%\n`;
        csvContent += `Task Completion Rate,${metrics.taskCompletionRate.toFixed(2)}%\n\n`;
        
        // Operations Detail
        csvContent += "OPERATIONS DETAIL\n";
        csvContent += "Date,Operation Type,Description,Status,Planned Cost,Actual Cost,Revenue Impact,Efficiency\n";
        
        operations.forEach(op => {
            csvContent += `${op.date},${op.type},${op.description},${op.status},${op.plannedCost.toFixed(2)},${op.actualCost.toFixed(2)},${op.revenueImpact.toFixed(2)},${op.efficiency.toFixed(2)}%\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-unified-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    implementRecommendation(recId) {
        // Placeholder for recommendation implementation
        console.log(`Implementing recommendation: ${recId}`);
        alert(`Recommendation "${recId}" implementation started. Check individual apps for specific actions.`);
    }

    dismissRecommendation(recId) {
        // Remove recommendation from display
        const recCard = document.querySelector(`[onclick*="${recId}"]`)?.closest('.recommendation-card');
        if (recCard) {
            recCard.remove();
        }
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString || 'N/A';
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