// Sefake Farms - Crop Planning & Management Application
// Main JavaScript file

class CropPlanningApp {
    constructor() {
        this.data = {
            crops: this.getDefaultCrops(),
            entries: JSON.parse(localStorage.getItem('cropEntries') || '[]'),
            settings: JSON.parse(localStorage.getItem('appSettings') || '{}')
        };
        
        this.charts = {};
        this.currentYear = new Date().getFullYear();
        
        this.initializeApp();
    }

    getDefaultCrops() {
        return [
            {
                name: "Tomatoes",
                pricePerUnit: 8.50,
                yieldPerAcre: 1200,
                yieldUnit: "kg",
                daysToTransplant: 30,
                daysToMaturity: 90,
                expensePerAcre: 500,
                rotationGroup: "Nightshades"
            },
            {
                name: "Lettuce",
                pricePerUnit: 5.00,
                yieldPerAcre: 800,
                yieldUnit: "kg",
                daysToTransplant: 0,
                daysToMaturity: 45,
                expensePerAcre: 300,
                rotationGroup: "Leafy Greens"
            },
            {
                name: "Onions",
                pricePerUnit: 4.00,
                yieldPerAcre: 1500,
                yieldUnit: "kg",
                daysToTransplant: 0,
                daysToMaturity: 120,
                expensePerAcre: 400,
                rotationGroup: "Alliums"
            },
            {
                name: "Carrots",
                pricePerUnit: 6.00,
                yieldPerAcre: 1000,
                yieldUnit: "kg",
                daysToTransplant: 0,
                daysToMaturity: 75,
                expensePerAcre: 350,
                rotationGroup: "Root Vegetables"
            },
            {
                name: "Bell Peppers",
                pricePerUnit: 12.00,
                yieldPerAcre: 900,
                yieldUnit: "kg",
                daysToTransplant: 35,
                daysToMaturity: 100,
                expensePerAcre: 600,
                rotationGroup: "Nightshades"
            }
        ];
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadCropData();
        this.renderCropEntries();
        this.renderCropDatabase();
        this.updateFinancialReports();
        this.updateSummaryReport();
        this.initializeCharts();
        this.updateOnlineStatus();
        
        // Set default active tab
        this.showTab('planner');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Add crop entry
        document.getElementById('add-crop-btn').addEventListener('click', () => {
            this.showAddCropForm();
        });

        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddCropForm();
        });

        document.getElementById('crop-entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCropEntry();
        });

        // Crop data management
        document.getElementById('add-crop-data-btn').addEventListener('click', () => {
            this.showCropDataForm();
        });

        document.getElementById('cancel-crop-data').addEventListener('click', () => {
            this.hideCropDataForm();
        });

        document.getElementById('crop-data-entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCropData();
        });

        document.getElementById('reset-crop-data-btn').addEventListener('click', () => {
            this.resetCropData();
        });

        // Year selectors
        document.querySelectorAll('[id$="-year-select"]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.currentYear = parseInt(e.target.value);
                this.updateFinancialReports();
                this.updateSummaryReport();
                this.updateCharts();
            });
        });

        // Export functionality
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        // Online status monitoring
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab && selectedButton) {
            selectedTab.classList.add('active');
            selectedButton.classList.add('active');
        }

        // Update specific tab content
        if (tabName === 'financial') {
            this.updateFinancialReports();
        } else if (tabName === 'summary') {
            this.updateSummaryReport();
        } else if (tabName === 'charts') {
            this.updateCharts();
        } else if (tabName === 'success') {
            this.updateSuccessMetrics();
        }
    }

    showAddCropForm() {
        const form = document.getElementById('add-crop-form');
        form.classList.remove('hidden');
        this.populateCropSelect();
        
        // Set default planting date to today
        document.getElementById('planting-date').value = new Date().toISOString().split('T')[0];
    }

    hideAddCropForm() {
        document.getElementById('add-crop-form').classList.add('hidden');
        document.getElementById('crop-entry-form').reset();
    }

    populateCropSelect() {
        const select = document.getElementById('crop-select');
        select.innerHTML = '<option value="">Select a crop...</option>';
        
        this.data.crops.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.name;
            option.textContent = crop.name;
            select.appendChild(option);
        });
    }

    addCropEntry() {
        const formData = new FormData(document.getElementById('crop-entry-form'));
        const cropName = formData.get('crop-select');
        const plantingDate = formData.get('planting-date');
        const acresUsed = parseFloat(formData.get('acres-used'));

        const crop = this.data.crops.find(c => c.name === cropName);
        if (!crop) {
            alert('Please select a valid crop');
            return;
        }

        const entry = {
            id: Date.now().toString(),
            cropName: cropName,
            plantingDate: plantingDate,
            acresUsed: acresUsed,
            harvestDate: this.calculateHarvestDate(plantingDate, crop.daysToMaturity),
            plannedYield: crop.yieldPerAcre * acresUsed,
            plannedRevenue: crop.yieldPerAcre * acresUsed * crop.pricePerUnit,
            plannedExpenses: crop.expensePerAcre * acresUsed,
            actualYield: null,
            actualRevenue: null,
            actualExpenses: null,
            crop: crop
        };

        this.data.entries.push(entry);
        this.saveData();
        this.renderCropEntries();
        this.hideAddCropForm();
        this.updateFinancialReports();
        this.updateSummaryReport();
    }

    calculateHarvestDate(plantingDate, daysToMaturity) {
        const planting = new Date(plantingDate);
        const harvest = new Date(planting);
        harvest.setDate(harvest.getDate() + daysToMaturity);
        return harvest.toISOString().split('T')[0];
    }

    renderCropEntries() {
        const tbody = document.getElementById('crop-entries-tbody');
        const noEntriesMsg = document.getElementById('no-entries-message');
        
        if (this.data.entries.length === 0) {
            tbody.innerHTML = '';
            noEntriesMsg.style.display = 'block';
            return;
        }

        noEntriesMsg.style.display = 'none';
        
        tbody.innerHTML = this.data.entries.map(entry => `
            <tr>
                <td>${entry.cropName}</td>
                <td>${this.formatDate(entry.plantingDate)}</td>
                <td>${this.formatDate(entry.harvestDate)}</td>
                <td>${entry.acresUsed}</td>
                <td>
                    <div class="planned-actual-container">
                        <div class="planned-data">
                            <span class="data-label">Planned:</span>
                            <span>${entry.plannedYield.toFixed(1)} ${entry.crop.yieldUnit}</span>
                        </div>
                        <div class="actual-input">
                            <span class="data-label">Actual:</span>
                            <input type="number" 
                                   class="actual-input-field" 
                                   placeholder="Enter actual"
                                   value="${entry.actualYield || ''}"
                                   onchange="app.updateActualYield('${entry.id}', this.value)">
                        </div>
                    </div>
                </td>
                <td>
                    <div class="planned-actual-container">
                        <div class="planned-data">
                            <span class="data-label">Planned:</span>
                            <span>₵${entry.plannedRevenue.toFixed(2)}</span>
                        </div>
                        <div class="actual-input">
                            <span class="data-label">Actual:</span>
                            <input type="number" 
                                   class="actual-input-field" 
                                   placeholder="Enter actual"
                                   value="${entry.actualRevenue || ''}"
                                   onchange="app.updateActualRevenue('${entry.id}', this.value)">
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-danger" onclick="app.deleteCropEntry('${entry.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateActualYield(entryId, value) {
        const entry = this.data.entries.find(e => e.id === entryId);
        if (entry) {
            entry.actualYield = value ? parseFloat(value) : null;
            this.saveData();
            this.updateFinancialReports();
            this.updateSummaryReport();
        }
    }

    updateActualRevenue(entryId, value) {
        const entry = this.data.entries.find(e => e.id === entryId);
        if (entry) {
            entry.actualRevenue = value ? parseFloat(value) : null;
            this.saveData();
            this.updateFinancialReports();
            this.updateSummaryReport();
        }
    }

    deleteCropEntry(entryId) {
        if (confirm('Are you sure you want to delete this crop entry?')) {
            this.data.entries = this.data.entries.filter(e => e.id !== entryId);
            this.saveData();
            this.renderCropEntries();
            this.updateFinancialReports();
            this.updateSummaryReport();
        }
    }

    showCropDataForm(editCrop = null) {
        const form = document.getElementById('crop-data-form');
        const title = document.getElementById('crop-data-form-title');
        
        form.classList.remove('hidden');
        
        if (editCrop) {
            title.textContent = 'Edit Crop Data';
            document.getElementById('crop-name').value = editCrop.name;
            document.getElementById('price-per-unit').value = editCrop.pricePerUnit;
            document.getElementById('yield-per-acre').value = editCrop.yieldPerAcre;
            document.getElementById('yield-unit').value = editCrop.yieldUnit;
            document.getElementById('days-to-transplant').value = editCrop.daysToTransplant;
            document.getElementById('days-to-maturity').value = editCrop.daysToMaturity;
            document.getElementById('expense-per-acre').value = editCrop.expensePerAcre;
            document.getElementById('rotation-group').value = editCrop.rotationGroup;
            
            // Store the index for editing
            form.dataset.editIndex = this.data.crops.findIndex(c => c.name === editCrop.name);
        } else {
            title.textContent = 'Add New Crop';
            delete form.dataset.editIndex;
        }
    }

    hideCropDataForm() {
        document.getElementById('crop-data-form').classList.add('hidden');
        document.getElementById('crop-data-entry-form').reset();
    }

    saveCropData() {
        const form = document.getElementById('crop-data-entry-form');
        const formData = new FormData(form);
        
        const cropData = {
            name: formData.get('crop-name'),
            pricePerUnit: parseFloat(formData.get('price-per-unit')),
            yieldPerAcre: parseFloat(formData.get('yield-per-acre')),
            yieldUnit: formData.get('yield-unit'),
            daysToTransplant: parseInt(formData.get('days-to-transplant')),
            daysToMaturity: parseInt(formData.get('days-to-maturity')),
            expensePerAcre: parseFloat(formData.get('expense-per-acre')),
            rotationGroup: formData.get('rotation-group')
        };

        const editIndex = form.dataset.editIndex;
        
        if (editIndex !== undefined) {
            // Editing existing crop
            this.data.crops[parseInt(editIndex)] = cropData;
        } else {
            // Adding new crop
            this.data.crops.push(cropData);
        }

        this.saveData();
        this.renderCropDatabase();
        this.hideCropDataForm();
    }

    renderCropDatabase() {
        const tbody = document.getElementById('crop-data-tbody');
        
        tbody.innerHTML = this.data.crops.map((crop, index) => `
            <tr>
                <td>${crop.name}</td>
                <td>₵${crop.pricePerUnit.toFixed(2)}</td>
                <td>${crop.yieldPerAcre}</td>
                <td><span class="unit-badge">${crop.yieldUnit}</span></td>
                <td>${crop.daysToTransplant}</td>
                <td>${crop.daysToMaturity}</td>
                <td>₵${crop.expensePerAcre.toFixed(2)}</td>
                <td><span class="rotation-tag">${crop.rotationGroup}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="app.editCrop(${index})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="app.deleteCrop(${index})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    editCrop(index) {
        const crop = this.data.crops[index];
        this.showCropDataForm(crop);
    }

    deleteCrop(index) {
        if (confirm('Are you sure you want to delete this crop?')) {
            this.data.crops.splice(index, 1);
            this.saveData();
            this.renderCropDatabase();
        }
    }

    resetCropData() {
        if (confirm('This will reset all crop data to defaults. Are you sure?')) {
            this.data.crops = this.getDefaultCrops();
            this.saveData();
            this.renderCropDatabase();
        }
    }

    updateFinancialReports() {
        const yearEntries = this.data.entries.filter(entry => {
            const entryYear = new Date(entry.plantingDate).getFullYear();
            return entryYear === this.currentYear;
        });

        this.populateYearSelector();

        // Calculate totals
        let totalProfit = 0;
        let totalExpenses = 0;
        let totalRevenue = 0;

        yearEntries.forEach(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            const expenses = entry.actualExpenses || entry.plannedExpenses;
            totalRevenue += revenue;
            totalExpenses += expenses;
            totalProfit += (revenue - expenses);
        });

        // Update summary cards
        document.getElementById('total-profit').textContent = `₵${totalProfit.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `₵${totalExpenses.toFixed(2)}`;
        
        const averageMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
        document.getElementById('average-margin').textContent = `${averageMargin.toFixed(1)}%`;
        
        const roi = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100) : 0;
        document.getElementById('roi').textContent = `${roi.toFixed(1)}%`;

        // Update financial table
        const tbody = document.getElementById('financial-tbody');
        tbody.innerHTML = yearEntries.map(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            const expenses = entry.actualExpenses || entry.plannedExpenses;
            const profit = revenue - expenses;
            const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;

            return `
                <tr>
                    <td>${entry.cropName}</td>
                    <td>${this.formatDate(entry.plantingDate)}</td>
                    <td>${entry.acresUsed}</td>
                    <td>₵${expenses.toFixed(2)}</td>
                    <td>₵${revenue.toFixed(2)}</td>
                    <td>₵${profit.toFixed(2)}</td>
                    <td>${margin.toFixed(1)}%</td>
                </tr>
            `;
        }).join('');
    }

    updateSummaryReport() {
        const yearEntries = this.data.entries.filter(entry => {
            const entryYear = new Date(entry.plantingDate).getFullYear();
            return entryYear === this.currentYear;
        });

        // Calculate summary stats
        const totalCropsPlanted = yearEntries.length;
        const totalAcresUsed = yearEntries.reduce((sum, entry) => sum + entry.acresUsed, 0);
        const activePlantings = yearEntries.filter(entry => {
            const harvestDate = new Date(entry.harvestDate);
            return harvestDate > new Date();
        }).length;
        const totalRevenue = yearEntries.reduce((sum, entry) => {
            return sum + (entry.actualRevenue || entry.plannedRevenue);
        }, 0);

        // Update summary cards
        document.getElementById('total-crops-planted').textContent = totalCropsPlanted;
        document.getElementById('total-acres-used').textContent = totalAcresUsed.toFixed(1);
        document.getElementById('active-plantings').textContent = activePlantings;
        document.getElementById('total-revenue').textContent = `₵${totalRevenue.toFixed(2)}`;
    }

    initializeCharts() {
        this.updateCharts();
    }

    updateCharts() {
        const yearEntries = this.data.entries.filter(entry => {
            const entryYear = new Date(entry.plantingDate).getFullYear();
            return entryYear === this.currentYear;
        });

        if (yearEntries.length === 0) {
            this.hideCharts();
            return;
        }

        this.showCharts();
        this.renderRevenueChart(yearEntries);
        this.renderProfitChart(yearEntries);
    }

    hideCharts() {
        document.querySelectorAll('.chart-wrapper canvas').forEach(canvas => {
            canvas.style.display = 'none';
        });
        document.querySelectorAll('.empty-state').forEach(state => {
            state.style.display = 'block';
        });
    }

    showCharts() {
        document.querySelectorAll('.chart-wrapper canvas').forEach(canvas => {
            canvas.style.display = 'block';
        });
        document.querySelectorAll('.empty-state').forEach(state => {
            state.style.display = 'none';
        });
    }

    renderRevenueChart(entries) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        const cropRevenue = {};
        entries.forEach(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            cropRevenue[entry.cropName] = (cropRevenue[entry.cropName] || 0) + revenue;
        });

        this.charts.revenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cropRevenue),
                datasets: [{
                    data: Object.values(cropRevenue),
                    backgroundColor: [
                        '#345187',
                        '#4CAF50',
                        '#FFC107',
                        '#FF5722',
                        '#9C27B0',
                        '#2196F3',
                        '#FF9800',
                        '#795548'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderProfitChart(entries) {
        const ctx = document.getElementById('profit-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.profit) {
            this.charts.profit.destroy();
        }

        const cropProfit = {};
        entries.forEach(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            const expenses = entry.actualExpenses || entry.plannedExpenses;
            const profit = revenue - expenses;
            cropProfit[entry.cropName] = (cropProfit[entry.cropName] || 0) + profit;
        });

        this.charts.profit = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(cropProfit),
                datasets: [{
                    label: 'Profit (₵)',
                    data: Object.values(cropProfit),
                    backgroundColor: '#345187',
                    borderColor: '#293f6b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₵' + value.toFixed(0);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    populateYearSelector() {
        const years = [...new Set(this.data.entries.map(entry => 
            new Date(entry.plantingDate).getFullYear()
        ))].sort((a, b) => b - a);

        if (years.length === 0) {
            years.push(this.currentYear);
        }

        document.querySelectorAll('[id$="-year-select"]').forEach(select => {
            select.innerHTML = years.map(year => 
                `<option value="${year}" ${year === this.currentYear ? 'selected' : ''}>${year}</option>`
            ).join('');
        });
    }

    exportToCSV() {
        const yearEntries = this.data.entries.filter(entry => {
            const entryYear = new Date(entry.plantingDate).getFullYear();
            return entryYear === this.currentYear;
        });

        if (yearEntries.length === 0) {
            alert('No data to export for the selected year.');
            return;
        }

        const headers = [
            'Crop', 'Planting Date', 'Harvest Date', 'Acres Used',
            'Planned Yield', 'Actual Yield', 'Planned Revenue', 'Actual Revenue',
            'Planned Expenses', 'Actual Expenses', 'Profit'
        ];

        const csvContent = [
            headers.join(','),
            ...yearEntries.map(entry => {
                const revenue = entry.actualRevenue || entry.plannedRevenue;
                const expenses = entry.actualExpenses || entry.plannedExpenses;
                const profit = revenue - expenses;

                return [
                    entry.cropName,
                    entry.plantingDate,
                    entry.harvestDate,
                    entry.acresUsed,
                    entry.plannedYield,
                    entry.actualYield || '',
                    entry.plannedRevenue,
                    entry.actualRevenue || '',
                    entry.plannedExpenses,
                    entry.actualExpenses || '',
                    profit
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sefake-farms-report-${this.currentYear}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    updateOnlineStatus() {
        const statusElement = document.getElementById('online-status');
        if (navigator.onLine) {
            statusElement.textContent = 'Online';
            statusElement.className = 'status-badge online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'status-badge offline';
        }
    }

    updateSuccessMetrics() {
        // This would implement crop success metrics
        // For now, just show placeholder
        const container = document.getElementById('success-meters-container');
        if (container) {
            container.innerHTML = '<p class="text-center text-muted">Success metrics coming soon...</p>';
        }
    }

    loadCropData() {
        const savedCrops = localStorage.getItem('cropDatabase');
        if (savedCrops) {
            this.data.crops = JSON.parse(savedCrops);
        }
    }

    saveData() {
        localStorage.setItem('cropEntries', JSON.stringify(this.data.entries));
        localStorage.setItem('cropDatabase', JSON.stringify(this.data.crops));
        localStorage.setItem('appSettings', JSON.stringify(this.data.settings));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new CropPlanningApp();
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}