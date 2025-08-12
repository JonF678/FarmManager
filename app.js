// Sefake Farms - Crop Planning & Management Application
// Complete Application with All Features

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
            },
            {
                name: "Spinach",
                pricePerUnit: 7.00,
                yieldPerAcre: 600,
                yieldUnit: "kg",
                daysToTransplant: 0,
                daysToMaturity: 40,
                expensePerAcre: 250,
                rotationGroup: "Leafy Greens"
            },
            {
                name: "Beans",
                pricePerUnit: 9.00,
                yieldPerAcre: 800,
                yieldUnit: "kg",
                daysToTransplant: 0,
                daysToMaturity: 65,
                expensePerAcre: 350,
                rotationGroup: "Legumes"
            },
            {
                name: "Cucumbers",
                pricePerUnit: 6.50,
                yieldPerAcre: 1100,
                yieldUnit: "kg",
                daysToTransplant: 25,
                daysToMaturity: 70,
                expensePerAcre: 450,
                rotationGroup: "Cucurbits"
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
        this.updateSuccessMetrics();
        this.initializeCharts();
        this.updateOnlineStatus();
        this.populateYearSelectors();
        
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
        const addCropBtn = document.getElementById('add-crop-btn');
        if (addCropBtn) {
            addCropBtn.addEventListener('click', () => {
                this.showAddCropForm();
            });
        }

        const cancelAddBtn = document.getElementById('cancel-add');
        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => {
                this.hideAddCropForm();
            });
        }

        const cropEntryForm = document.getElementById('crop-entry-form');
        if (cropEntryForm) {
            cropEntryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCropEntry();
            });
        }

        // Crop data management
        const addCropDataBtn = document.getElementById('add-crop-data-btn');
        if (addCropDataBtn) {
            addCropDataBtn.addEventListener('click', () => {
                this.showCropDataForm();
            });
        }

        const cancelCropDataBtn = document.getElementById('cancel-crop-data');
        if (cancelCropDataBtn) {
            cancelCropDataBtn.addEventListener('click', () => {
                this.hideCropDataForm();
            });
        }

        const cropDataForm = document.getElementById('crop-data-entry-form');
        if (cropDataForm) {
            cropDataForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCropData();
            });
        }

        const resetCropDataBtn = document.getElementById('reset-crop-data-btn');
        if (resetCropDataBtn) {
            resetCropDataBtn.addEventListener('click', () => {
                this.resetCropData();
            });
        }

        // Year selectors
        document.querySelectorAll('[id$="-year-select"]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.currentYear = parseInt(e.target.value);
                this.updateFinancialReports();
                this.updateSummaryReport();
                this.updateSuccessMetrics();
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
        setTimeout(() => {
            if (tabName === 'financial') {
                this.updateFinancialReports();
            } else if (tabName === 'summary') {
                this.updateSummaryReport();
            } else if (tabName === 'charts') {
                this.updateCharts();
            } else if (tabName === 'success') {
                this.updateSuccessMetrics();
            } else if (tabName === 'rotation') {
                this.updateRotationPlanning();
            }
        }, 100);
    }

    showAddCropForm() {
        const form = document.getElementById('add-crop-form');
        if (form) {
            form.classList.remove('hidden');
            this.populateCropSelect();
            
            // Set default planting date to today
            const plantingDateInput = document.getElementById('planting-date');
            if (plantingDateInput) {
                plantingDateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    hideAddCropForm() {
        const form = document.getElementById('add-crop-form');
        const cropEntryForm = document.getElementById('crop-entry-form');
        if (form) form.classList.add('hidden');
        if (cropEntryForm) cropEntryForm.reset();
    }

    populateCropSelect() {
        const select = document.getElementById('crop-select');
        if (select) {
            select.innerHTML = '<option value="">Select a crop...</option>';
            
            this.data.crops.forEach(crop => {
                const option = document.createElement('option');
                option.value = crop.name;
                option.textContent = crop.name;
                select.appendChild(option);
            });
        }
    }

    addCropEntry() {
        const form = document.getElementById('crop-entry-form');
        if (!form) return;

        const formData = new FormData(form);
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
        this.updateSuccessMetrics();
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
        
        if (!tbody) return;

        if (this.data.entries.length === 0) {
            tbody.innerHTML = '';
            if (noEntriesMsg) noEntriesMsg.style.display = 'block';
            return;
        }

        if (noEntriesMsg) noEntriesMsg.style.display = 'none';
        
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
                                   onchange="window.app.updateActualYield('${entry.id}', this.value)">
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
                                   onchange="window.app.updateActualRevenue('${entry.id}', this.value)">
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-danger" onclick="window.app.deleteCropEntry('${entry.id}')">Delete</button>
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
            this.updateSuccessMetrics();
        }
    }

    updateActualRevenue(entryId, value) {
        const entry = this.data.entries.find(e => e.id === entryId);
        if (entry) {
            entry.actualRevenue = value ? parseFloat(value) : null;
            this.saveData();
            this.updateFinancialReports();
            this.updateSummaryReport();
            this.updateSuccessMetrics();
        }
    }

    deleteCropEntry(entryId) {
        if (confirm('Are you sure you want to delete this crop entry?')) {
            this.data.entries = this.data.entries.filter(e => e.id !== entryId);
            this.saveData();
            this.renderCropEntries();
            this.updateFinancialReports();
            this.updateSummaryReport();
            this.updateSuccessMetrics();
        }
    }

    showCropDataForm(editCrop = null) {
        const form = document.getElementById('crop-data-form');
        const title = document.getElementById('crop-data-form-title');
        
        if (!form) return;
        
        form.classList.remove('hidden');
        
        if (editCrop) {
            if (title) title.textContent = 'Edit Crop Data';
            
            const setFieldValue = (id, value) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            };
            
            setFieldValue('crop-name', editCrop.name);
            setFieldValue('price-per-unit', editCrop.pricePerUnit);
            setFieldValue('yield-per-acre', editCrop.yieldPerAcre);
            setFieldValue('yield-unit', editCrop.yieldUnit);
            setFieldValue('days-to-transplant', editCrop.daysToTransplant);
            setFieldValue('days-to-maturity', editCrop.daysToMaturity);
            setFieldValue('expense-per-acre', editCrop.expensePerAcre);
            setFieldValue('rotation-group', editCrop.rotationGroup);
            
            // Store the index for editing
            form.dataset.editIndex = this.data.crops.findIndex(c => c.name === editCrop.name);
        } else {
            if (title) title.textContent = 'Add New Crop';
            delete form.dataset.editIndex;
        }
    }

    hideCropDataForm() {
        const form = document.getElementById('crop-data-form');
        const cropDataForm = document.getElementById('crop-data-entry-form');
        if (form) form.classList.add('hidden');
        if (cropDataForm) cropDataForm.reset();
    }

    saveCropData() {
        const form = document.getElementById('crop-data-entry-form');
        if (!form) return;

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

        const parentForm = document.getElementById('crop-data-form');
        const editIndex = parentForm ? parentForm.dataset.editIndex : undefined;
        
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
        if (!tbody) return;
        
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
                        <button class="btn btn-small btn-primary" onclick="window.app.editCrop(${index})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="window.app.deleteCrop(${index})">Delete</button>
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
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateElement('total-profit', `₵${totalProfit.toFixed(2)}`);
        updateElement('total-expenses', `₵${totalExpenses.toFixed(2)}`);
        
        const averageMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
        updateElement('average-margin', `${averageMargin.toFixed(1)}%`);
        
        const roi = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100) : 0;
        updateElement('roi', `${roi.toFixed(1)}%`);

        // Update financial table
        const tbody = document.getElementById('financial-tbody');
        if (tbody) {
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
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateElement('total-crops-planted', totalCropsPlanted);
        updateElement('total-acres-used', totalAcresUsed.toFixed(1));
        updateElement('active-plantings', activePlantings);
        updateElement('total-revenue', `₵${totalRevenue.toFixed(2)}`);

        // Update monthly summary
        this.updateMonthlySummary(yearEntries);
    }

    updateMonthlySummary(entries) {
        const monthlyData = {};
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Initialize all months
        months.forEach(month => {
            monthlyData[month] = { revenue: 0, crops: [] };
        });

        // Process entries
        entries.forEach(entry => {
            const harvestDate = new Date(entry.harvestDate);
            const monthName = months[harvestDate.getMonth()];
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            
            monthlyData[monthName].revenue += revenue;
            monthlyData[monthName].crops.push({
                name: entry.cropName,
                revenue: revenue
            });
        });

        // Update monthly table
        const tbody = document.getElementById('monthly-summary-tbody');
        const noSummaryMsg = document.getElementById('no-summary-message');
        
        if (!tbody) return;

        const hasData = entries.length > 0;
        
        if (hasData) {
            if (noSummaryMsg) noSummaryMsg.style.display = 'none';
            
            tbody.innerHTML = months.map(month => {
                const monthData = monthlyData[month];
                const cropBreakdown = monthData.crops.length > 0 
                    ? monthData.crops.map(crop => `${crop.name}: ₵${crop.revenue.toFixed(2)}`).join(', ')
                    : 'No harvests';

                return `
                    <tr>
                        <td>${month}</td>
                        <td>₵${monthData.revenue.toFixed(2)}</td>
                        <td>${cropBreakdown}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '';
            if (noSummaryMsg) noSummaryMsg.style.display = 'block';
        }
    }

    updateSuccessMetrics() {
        const yearEntries = this.data.entries.filter(entry => {
            const entryYear = new Date(entry.plantingDate).getFullYear();
            return entryYear === this.currentYear;
        });

        if (yearEntries.length === 0) {
            const container = document.getElementById('success-meters-container');
            if (container) {
                container.innerHTML = '<p class="text-center text-muted">No crop entries for success analysis. Add some crop entries to see performance metrics.</p>';
            }
            
            const overallRate = document.querySelector('.success-percentage');
            if (overallRate) overallRate.textContent = '0%';
            
            return;
        }

        // Calculate overall success rate
        let totalEntries = 0;
        let successfulEntries = 0;

        const cropSuccess = {};

        yearEntries.forEach(entry => {
            totalEntries++;
            
            if (!cropSuccess[entry.cropName]) {
                cropSuccess[entry.cropName] = {
                    planned: 0,
                    actual: 0,
                    count: 0
                };
            }

            const crop = cropSuccess[entry.cropName];
            crop.planned += entry.plannedRevenue;
            crop.actual += (entry.actualRevenue || entry.plannedRevenue);
            crop.count++;

            // Consider successful if actual revenue is >= 80% of planned
            const actualRevenue = entry.actualRevenue || entry.plannedRevenue;
            const successRate = (actualRevenue / entry.plannedRevenue) * 100;
            
            if (successRate >= 80) {
                successfulEntries++;
            }
        });

        const overallSuccessRate = totalEntries > 0 ? (successfulEntries / totalEntries) * 100 : 0;

        // Update overall success display
        const overallRateEl = document.querySelector('.success-percentage');
        const successCircle = document.querySelector('.success-circle');
        
        if (overallRateEl) overallRateEl.textContent = `${overallSuccessRate.toFixed(0)}%`;
        if (successCircle) {
            successCircle.style.setProperty('--success-rate', `${overallSuccessRate}%`);
        }

        // Update individual crop success meters
        const container = document.getElementById('success-meters-container');
        if (container) {
            container.innerHTML = Object.entries(cropSuccess).map(([cropName, data]) => {
                const successRate = data.planned > 0 ? (data.actual / data.planned) * 100 : 0;
                const color = successRate >= 80 ? '#27ae60' : successRate >= 60 ? '#f39c12' : '#e74c3c';

                return `
                    <div class="success-meter-item">
                        <div class="meter-header">
                            <h4>${cropName}</h4>
                            <div class="success-score">${successRate.toFixed(1)}%</div>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${successRate}%; background-color: ${color};">
                                <div class="progress-animation"></div>
                            </div>
                        </div>
                        <div class="meter-details">
                            <span>Planned: ₵${data.planned.toFixed(2)}</span>
                            <span>Actual: ₵${data.actual.toFixed(2)}</span>
                            <span>Entries: ${data.count}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateRotationPlanning() {
        // This would implement rotation planning logic
        // For now, just ensure the tab content is visible
        console.log('Rotation planning update - feature coming soon');
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
        this.renderMonthlyRevenueChart(yearEntries);
        this.renderMonthlyExpenseChart(yearEntries);
        this.renderCropDistributionChart(yearEntries);
        this.renderExpenseDistributionChart(yearEntries);
        this.renderRevenueRainbow(yearEntries);
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

    renderMonthlyRevenueChart(entries) {
        const ctx = document.getElementById('monthly-revenue-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.monthlyRevenue) {
            this.charts.monthlyRevenue.destroy();
        }

        const monthlyRevenue = new Array(12).fill(0);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        entries.forEach(entry => {
            const harvestDate = new Date(entry.harvestDate);
            const month = harvestDate.getMonth();
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            monthlyRevenue[month] += revenue;
        });

        this.charts.monthlyRevenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Revenue (₵)',
                    data: monthlyRevenue,
                    borderColor: '#345187',
                    backgroundColor: 'rgba(52, 81, 135, 0.1)',
                    tension: 0.4,
                    fill: true
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

    renderMonthlyExpenseChart(entries) {
        const ctx = document.getElementById('monthly-expense-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.monthlyExpense) {
            this.charts.monthlyExpense.destroy();
        }

        const monthlyExpense = new Array(12).fill(0);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        entries.forEach(entry => {
            const plantingDate = new Date(entry.plantingDate);
            const month = plantingDate.getMonth();
            const expense = entry.actualExpenses || entry.plannedExpenses;
            monthlyExpense[month] += expense;
        });

        this.charts.monthlyExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Expenses (₵)',
                    data: monthlyExpense,
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
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

    renderCropDistributionChart(entries) {
        const ctx = document.getElementById('crop-distribution-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.cropDistribution) {
            this.charts.cropDistribution.destroy();
        }

        const cropRevenue = {};
        entries.forEach(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            cropRevenue[entry.cropName] = (cropRevenue[entry.cropName] || 0) + revenue;
        });

        this.charts.cropDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cropRevenue),
                datasets: [{
                    data: Object.values(cropRevenue),
                    backgroundColor: [
                        '#345187', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0',
                        '#2196F3', '#FF9800', '#795548', '#607D8B', '#E91E63'
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

    renderExpenseDistributionChart(entries) {
        const ctx = document.getElementById('expense-distribution-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.expenseDistribution) {
            this.charts.expenseDistribution.destroy();
        }

        const cropExpenses = {};
        entries.forEach(entry => {
            const expense = entry.actualExpenses || entry.plannedExpenses;
            cropExpenses[entry.cropName] = (cropExpenses[entry.cropName] || 0) + expense;
        });

        this.charts.expenseDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(cropExpenses),
                datasets: [{
                    data: Object.values(cropExpenses),
                    backgroundColor: [
                        '#e74c3c', '#f39c12', '#f1c40f', '#e67e22', '#d35400',
                        '#c0392b', '#a93226', '#922b21', '#7b241c', '#641e16'
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

    renderRevenueRainbow(entries) {
        const container = document.getElementById('revenue-rainbow');
        const noDataMsg = document.getElementById('no-rainbow-data');
        
        if (!container) return;

        if (entries.length === 0) {
            container.style.display = 'none';
            if (noDataMsg) noDataMsg.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        if (noDataMsg) noDataMsg.style.display = 'none';

        const cropRevenue = {};
        let totalRevenue = 0;

        entries.forEach(entry => {
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            cropRevenue[entry.cropName] = (cropRevenue[entry.cropName] || 0) + revenue;
            totalRevenue += revenue;
        });

        const colors = [
            '#345187', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0',
            '#2196F3', '#FF9800', '#795548', '#607D8B', '#E91E63'
        ];

        const barsContainer = container.querySelector('.rainbow-bars-container');
        const legendContainer = container.querySelector('.rainbow-legend');

        if (barsContainer && legendContainer) {
            // Create rainbow bars
            let colorIndex = 0;
            barsContainer.innerHTML = Object.entries(cropRevenue).map(([crop, revenue]) => {
                const percentage = (revenue / totalRevenue) * 100;
                const color = colors[colorIndex % colors.length];
                colorIndex++;

                return `
                    <div class="rainbow-bar" 
                         style="width: ${percentage}%; background-color: ${color};"
                         title="${crop}: ₵${revenue.toFixed(2)} (${percentage.toFixed(1)}%)">
                        ${percentage > 10 ? crop : ''}
                    </div>
                `;
            }).join('');

            // Create legend
            colorIndex = 0;
            legendContainer.innerHTML = Object.entries(cropRevenue).map(([crop, revenue]) => {
                const percentage = (revenue / totalRevenue) * 100;
                const color = colors[colorIndex % colors.length];
                colorIndex++;

                return `
                    <div class="rainbow-legend-item">
                        <div class="legend-color" style="background-color: ${color};"></div>
                        <span>${crop}: ₵${revenue.toFixed(2)} (${percentage.toFixed(1)}%)</span>
                    </div>
                `;
            }).join('');
        }
    }

    populateYearSelectors() {
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
        if (statusElement) {
            if (navigator.onLine) {
                statusElement.textContent = 'Online';
                statusElement.className = 'status-badge online';
            } else {
                statusElement.textContent = 'Offline';
                statusElement.className = 'status-badge offline';
            }
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
window.addEventListener('DOMContentLoaded', function() {
    window.app = new CropPlanningApp();
});