// Revenue Planner Application JavaScript
class RevenuePlanner {
    constructor() {
        this.cropData = [];
        this.cropEntries = [];
        this.currentTab = 'planner';
        
        this.init();
    }
    
    init() {
        // Clear empty localStorage entries to show sample data
        const savedEntries = localStorage.getItem('sefake-farm-entries');
        if (!savedEntries || JSON.parse(savedEntries).length === 0) {
            localStorage.removeItem('sefake-farm-entries');
        }
        
        this.loadDefaultCropData();
        this.loadFromStorage();
        this.setupEventListeners();
        this.populateCropSelectors();
        this.updateAllDisplays();
        this.checkOnlineStatus();
        
        // Initialize with current year
        this.populateYearSelectors();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                console.log('Switching to tab:', tabName);
                this.switchTab(tabName);
            });
        });
        
        // Crop planner events
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
        
        // Crop data events
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
        
        // Other events
        document.getElementById('generate-rotation-plan').addEventListener('click', () => {
            this.generateRotationPlan();
        });
        
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportToCSV();
        });
        
        // Year selector events
        ['financial', 'success', 'summary', 'charts'].forEach(tab => {
            const selector = document.getElementById(`${tab}-year-select`);
            if (selector) {
                selector.addEventListener('change', () => {
                    this.updateDisplaysForYear(tab);
                });
            }
        });
    }
    
    loadDefaultCropData() {
        const defaultCrops = [
            { name: 'Tomatoes', pricePerUnit: 2.50, yieldPerAcre: 2000, yieldUnit: 'kg', daysToTransplant: 30, daysToMaturity: 90, expensePerAcre: 500, rotationGroup: 'Nightshades' },
            { name: 'Maize (Corn)', pricePerUnit: 1.20, yieldPerAcre: 1500, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 120, expensePerAcre: 300, rotationGroup: 'Grasses' },
            { name: 'Lettuce', pricePerUnit: 3.00, yieldPerAcre: 800, yieldUnit: 'kg', daysToTransplant: 21, daysToMaturity: 60, expensePerAcre: 250, rotationGroup: 'Leafy Greens' },
            { name: 'Beans', pricePerUnit: 4.00, yieldPerAcre: 600, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 75, expensePerAcre: 200, rotationGroup: 'Legumes' },
            { name: 'Carrots', pricePerUnit: 2.00, yieldPerAcre: 1200, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 80, expensePerAcre: 180, rotationGroup: 'Root Vegetables' },
            { name: 'Peppers', pricePerUnit: 5.00, yieldPerAcre: 800, yieldUnit: 'kg', daysToTransplant: 45, daysToMaturity: 100, expensePerAcre: 400, rotationGroup: 'Nightshades' },
            { name: 'Onions', pricePerUnit: 1.80, yieldPerAcre: 1000, yieldUnit: 'kg', daysToTransplant: 60, daysToMaturity: 120, expensePerAcre: 220, rotationGroup: 'Alliums' },
            { name: 'Cabbage', pricePerUnit: 1.50, yieldPerAcre: 1800, yieldUnit: 'kg', daysToTransplant: 30, daysToMaturity: 90, expensePerAcre: 300, rotationGroup: 'Brassicas' }
        ];
        
        if (!localStorage.getItem('sefake-farm-crop-data')) {
            this.cropData = defaultCrops;
            this.saveToStorage();
        }
    }
    
    loadFromStorage() {
        const savedCropData = localStorage.getItem('sefake-farm-crop-data');
        const savedEntries = localStorage.getItem('sefake-farm-entries');
        
        if (savedCropData) {
            this.cropData = JSON.parse(savedCropData);
        }
        
        if (savedEntries && savedEntries !== 'null') {
            const parsedEntries = JSON.parse(savedEntries);
            // Only use saved entries if they exist and have data
            if (Array.isArray(parsedEntries) && parsedEntries.length > 0) {
                this.cropEntries = parsedEntries;
                return; // Exit early if we have valid data
            }
        }
        
        // Add sample crop entries if none exist
        this.cropEntries = [
                {
                    id: 1,
                    cropName: 'Maize (Corn)',
                    fieldName: 'North Field',
                    acreage: 2.5,
                    season: 'A',
                    plantingDate: '2025-01-15',
                    harvestDate: '2025-06-15',
                    year: 2025,
                    expectedYield: 3750, // 1500 kg/acre * 2.5 acres
                    actualYield: 3600,
                    totalCosts: 750, // 300/acre * 2.5 acres
                    revenue: 4320, // 3600 kg * 1.20/kg
                    profit: 3570,
                    success: 96 // actualYield/expectedYield * 100
                },
                {
                    id: 2,
                    cropName: 'Tomatoes',
                    fieldName: 'South Field',
                    acreage: 1.5,
                    season: 'B',
                    plantingDate: '2025-07-15',
                    harvestDate: '2025-10-15',
                    year: 2025,
                    expectedYield: 3000, // 2000 kg/acre * 1.5 acres
                    actualYield: 2850,
                    totalCosts: 750, // 500/acre * 1.5 acres
                    revenue: 7125, // 2850 kg * 2.50/kg
                    profit: 6375,
                    success: 95 // actualYield/expectedYield * 100
                },
                {
                    id: 3,
                    cropName: 'Beans',
                    fieldName: 'East Field',
                    acreage: 1.0,
                    season: 'A',
                    plantingDate: '2025-03-01',
                    harvestDate: '2025-05-15',
                    year: 2025,
                    expectedYield: 600, // 600 kg/acre * 1 acre
                    actualYield: 580,
                    totalCosts: 200, // 200/acre * 1 acre
                    revenue: 2320, // 580 kg * 4.00/kg
                    profit: 2120,
                    success: 97 // actualYield/expectedYield * 100
                }
            ];
            this.saveToStorage();
    }
    
    saveToStorage() {
        localStorage.setItem('sefake-farm-crop-data', JSON.stringify(this.cropData));
        localStorage.setItem('sefake-farm-entries', JSON.stringify(this.cropEntries));
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Update displays for the new tab
        this.updateTabDisplay(tabName);
    }
    
    updateTabDisplay(tabName) {
        console.log('Updating tab display for:', tabName);
        switch(tabName) {
            case 'planner':
                this.updateCropEntriesTable();
                break;
            case 'crops':
                this.updateCropDataTable();
                break;
            case 'rotation':
                this.updateRotationDisplay();
                break;
            case 'financial':
                this.updateFinancialDisplay();
                break;
            case 'success':
                this.updateSuccessDisplay();
                break;
            case 'summary':
                this.updateSummaryDisplay();
                break;
            case 'charts':
                this.updateChartsDisplay();
                break;
        }
    }
    
    populateCropSelectors() {
        const selector = document.getElementById('crop-select');
        selector.innerHTML = '<option value="">Select a crop...</option>';
        
        this.cropData.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.name;
            option.textContent = crop.name;
            selector.appendChild(option);
        });
    }
    
    populateYearSelectors() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        // Get years from existing entries
        this.cropEntries.forEach(entry => {
            const year = new Date(entry.plantingDate).getFullYear();
            if (!years.includes(year)) {
                years.push(year);
            }
        });
        
        // Add current year if not present
        if (!years.includes(currentYear)) {
            years.push(currentYear);
        }
        
        // Sort years in descending order
        years.sort((a, b) => b - a);
        
        // Populate all year selectors
        ['financial', 'success', 'summary', 'charts'].forEach(tab => {
            const selector = document.getElementById(`${tab}-year-select`);
            if (selector) {
                selector.innerHTML = '';
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    if (year === currentYear) option.selected = true;
                    selector.appendChild(option);
                });
            }
        });
    }
    
    showAddCropForm() {
        document.getElementById('add-crop-form').classList.remove('hidden');
        document.getElementById('planting-date').value = new Date().toISOString().split('T')[0];
    }
    
    hideAddCropForm() {
        document.getElementById('add-crop-form').classList.add('hidden');
        document.getElementById('crop-entry-form').reset();
    }
    
    showCropDataForm(editData = null) {
        const form = document.getElementById('crop-data-form');
        const title = document.getElementById('crop-data-form-title');
        
        form.classList.remove('hidden');
        
        if (editData) {
            title.textContent = 'Edit Crop Data';
            document.getElementById('crop-name').value = editData.name;
            document.getElementById('price-per-unit').value = editData.pricePerUnit;
            document.getElementById('yield-per-acre').value = editData.yieldPerAcre;
            document.getElementById('yield-unit').value = editData.yieldUnit;
            document.getElementById('days-to-transplant').value = editData.daysToTransplant;
            document.getElementById('days-to-maturity').value = editData.daysToMaturity;
            document.getElementById('expense-per-acre').value = editData.expensePerAcre;
            document.getElementById('rotation-group').value = editData.rotationGroup;
            form.dataset.editIndex = this.cropData.indexOf(editData);
        } else {
            title.textContent = 'Add New Crop';
            delete form.dataset.editIndex;
        }
    }
    
    hideCropDataForm() {
        document.getElementById('crop-data-form').classList.add('hidden');
        document.getElementById('crop-data-entry-form').reset();
        delete document.getElementById('crop-data-form').dataset.editIndex;
    }
    
    addCropEntry() {
        const cropName = document.getElementById('crop-select').value;
        const plantingDate = document.getElementById('planting-date').value;
        const acresUsed = parseFloat(document.getElementById('acres-used').value);
        
        const cropInfo = this.cropData.find(crop => crop.name === cropName);
        if (!cropInfo) {
            alert('Please select a valid crop');
            return;
        }
        
        const plantingDateObj = new Date(plantingDate);
        const harvestDate = new Date(plantingDateObj);
        harvestDate.setDate(harvestDate.getDate() + cropInfo.daysToMaturity);
        
        const plannedYield = cropInfo.yieldPerAcre * acresUsed;
        const plannedRevenue = plannedYield * cropInfo.pricePerUnit;
        const totalExpense = cropInfo.expensePerAcre * acresUsed;
        
        const entry = {
            id: Date.now(),
            crop: cropName,
            plantingDate: plantingDate,
            harvestDate: harvestDate.toISOString().split('T')[0],
            acresUsed: acresUsed,
            plannedYield: plannedYield,
            plannedRevenue: plannedRevenue,
            totalExpense: totalExpense,
            actualYield: null,
            actualRevenue: null,
            cropInfo: cropInfo
        };
        
        this.cropEntries.push(entry);
        this.saveToStorage();
        this.hideAddCropForm();
        this.updateCropEntriesTable();
        this.populateYearSelectors();
    }
    
    saveCropData() {
        const form = document.getElementById('crop-data-form');
        const editIndex = form.dataset.editIndex;
        
        const cropData = {
            name: document.getElementById('crop-name').value,
            pricePerUnit: parseFloat(document.getElementById('price-per-unit').value),
            yieldPerAcre: parseFloat(document.getElementById('yield-per-acre').value),
            yieldUnit: document.getElementById('yield-unit').value,
            daysToTransplant: parseInt(document.getElementById('days-to-transplant').value),
            daysToMaturity: parseInt(document.getElementById('days-to-maturity').value),
            expensePerAcre: parseFloat(document.getElementById('expense-per-acre').value),
            rotationGroup: document.getElementById('rotation-group').value
        };
        
        if (editIndex !== undefined) {
            this.cropData[editIndex] = cropData;
        } else {
            this.cropData.push(cropData);
        }
        
        this.saveToStorage();
        this.hideCropDataForm();
        this.updateCropDataTable();
        this.populateCropSelectors();
    }
    
    resetCropData() {
        if (confirm('Are you sure you want to reset all crop data to defaults? This will remove any custom crops you\'ve added.')) {
            localStorage.removeItem('sefake-farm-crop-data');
            this.loadDefaultCropData();
            this.updateCropDataTable();
            this.populateCropSelectors();
        }
    }
    
    deleteCropEntry(id) {
        if (confirm('Are you sure you want to delete this crop entry?')) {
            this.cropEntries = this.cropEntries.filter(entry => entry.id !== id);
            this.saveToStorage();
            this.updateCropEntriesTable();
        }
    }
    
    deleteCropData(index) {
        if (confirm('Are you sure you want to delete this crop?')) {
            this.cropData.splice(index, 1);
            this.saveToStorage();
            this.updateCropDataTable();
            this.populateCropSelectors();
        }
    }
    
    updateActualValues(id, actualYield, actualRevenue) {
        const entry = this.cropEntries.find(e => e.id === id);
        if (entry) {
            entry.actualYield = actualYield;
            entry.actualRevenue = actualRevenue;
            this.saveToStorage();
            this.updateCropEntriesTable();
        }
    }
    
    updateCropEntriesTable() {
        const tbody = document.getElementById('crop-entries-tbody');
        const noEntriesMsg = document.getElementById('no-entries-message');
        
        if (this.cropEntries.length === 0) {
            tbody.innerHTML = '';
            noEntriesMsg.style.display = 'block';
            return;
        }
        
        noEntriesMsg.style.display = 'none';
        
        tbody.innerHTML = this.cropEntries.map(entry => `
            <tr>
                <td>${entry.crop}</td>
                <td>${new Date(entry.plantingDate).toLocaleDateString()}</td>
                <td>${new Date(entry.harvestDate).toLocaleDateString()}</td>
                <td>${entry.acresUsed} acres</td>
                <td>
                    <div>Planned: ${entry.plannedYield.toFixed(1)} ${entry.cropInfo.yieldUnit}</div>
                    <div>Actual: <input type="number" value="${entry.actualYield || ''}" 
                          onchange="revenuePlanner.updateActualValues(${entry.id}, this.value, null)" 
                          style="width: 80px; padding: 2px;" placeholder="Enter actual">
                    </div>
                </td>
                <td>
                    <div>Planned: ₵${entry.plannedRevenue.toFixed(2)}</div>
                    <div>Actual: <input type="number" value="${entry.actualRevenue || ''}" 
                          onchange="revenuePlanner.updateActualValues(${entry.id}, null, this.value)" 
                          style="width: 80px; padding: 2px;" placeholder="Enter actual">
                    </div>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="revenuePlanner.deleteCropEntry(${entry.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    updateCropDataTable() {
        const tbody = document.getElementById('crop-data-tbody');
        
        tbody.innerHTML = this.cropData.map((crop, index) => `
            <tr>
                <td>${crop.name}</td>
                <td>₵${crop.pricePerUnit.toFixed(2)}</td>
                <td>${crop.yieldPerAcre}</td>
                <td>${crop.yieldUnit}</td>
                <td>${crop.daysToTransplant}</td>
                <td>${crop.daysToMaturity}</td>
                <td>₵${crop.expensePerAcre.toFixed(2)}</td>
                <td>${crop.rotationGroup}</td>
                <td>
                    <button class="btn btn-secondary" onclick="revenuePlanner.showCropDataForm(revenuePlanner.cropData[${index}])">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="revenuePlanner.deleteCropData(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    updateFinancialDisplay() {
        const selectedYear = document.getElementById('financial-year-select').value;
        const yearEntries = this.cropEntries.filter(entry => 
            new Date(entry.plantingDate).getFullYear().toString() === selectedYear
        );
        
        let totalProfit = 0;
        let totalExpenses = 0;
        let totalRevenue = 0;
        
        const tbody = document.getElementById('financial-tbody');
        
        if (yearEntries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No entries for selected year</td></tr>';
        } else {
            tbody.innerHTML = yearEntries.map(entry => {
                const revenue = entry.actualRevenue || entry.plannedRevenue;
                const profit = revenue - entry.totalExpense;
                const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;
                
                totalRevenue += revenue;
                totalExpenses += entry.totalExpense;
                totalProfit += profit;
                
                return `
                    <tr>
                        <td>${entry.crop}</td>
                        <td>${new Date(entry.plantingDate).toLocaleDateString()}</td>
                        <td>${entry.acresUsed} acres</td>
                        <td>₵${entry.totalExpense.toFixed(2)}</td>
                        <td>₵${revenue.toFixed(2)}</td>
                        <td>₵${profit.toFixed(2)}</td>
                        <td>${margin.toFixed(1)}%</td>
                    </tr>
                `;
            }).join('');
        }
        
        const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
        const roi = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100) : 0;
        
        document.getElementById('total-profit').textContent = `₵${totalProfit.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `₵${totalExpenses.toFixed(2)}`;
        document.getElementById('average-margin').textContent = `${avgMargin.toFixed(1)}%`;
        document.getElementById('roi').textContent = `${roi.toFixed(1)}%`;
    }
    
    updateSuccessDisplay() {
        const selectedYear = document.getElementById('success-year-select').value;
        const yearEntries = this.cropEntries.filter(entry => 
            new Date(entry.plantingDate).getFullYear().toString() === selectedYear &&
            entry.actualYield !== null && entry.actualRevenue !== null
        );
        
        if (yearEntries.length === 0) {
            document.getElementById('overall-success-rate').innerHTML = `
                <div class="success-circle">
                    <div class="success-percentage">0%</div>
                    <div class="success-label">Overall Success</div>
                </div>
            `;
            document.getElementById('success-meters-container').innerHTML = 
                '<p class="empty-state">No actual data available for success metrics</p>';
            return;
        }
        
        // Calculate overall success rate based on planned vs actual performance
        let totalSuccessScore = 0;
        const cropPerformance = {};
        
        yearEntries.forEach(entry => {
            const yieldPerformance = entry.actualYield / entry.plannedYield;
            const revenuePerformance = entry.actualRevenue / entry.plannedRevenue;
            const avgPerformance = (yieldPerformance + revenuePerformance) / 2;
            
            totalSuccessScore += Math.min(avgPerformance, 1.2); // Cap at 120%
            
            if (!cropPerformance[entry.crop]) {
                cropPerformance[entry.crop] = [];
            }
            cropPerformance[entry.crop].push(avgPerformance);
        });
        
        const overallSuccess = Math.min((totalSuccessScore / yearEntries.length) * 100, 100);
        
        // Update success circle
        const successCircle = document.querySelector('.success-circle');
        successCircle.style.background = `conic-gradient(var(--success-color) ${overallSuccess}%, var(--border-color) 0%)`;
        document.querySelector('.success-percentage').textContent = `${overallSuccess.toFixed(0)}%`;
        
        // Update individual crop meters
        const metersContainer = document.getElementById('success-meters-container');
        metersContainer.innerHTML = Object.entries(cropPerformance).map(([crop, performances]) => {
            const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length;
            const percentage = Math.min(avgPerformance * 100, 100);
            
            return `
                <div class="crop-meter" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${crop}</span>
                        <span>${percentage.toFixed(0)}%</span>
                    </div>
                    <div style="background: var(--border-color); height: 10px; border-radius: 5px; overflow: hidden;">
                        <div style="background: var(--success-color); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateSummaryDisplay() {
        const selectedYear = document.getElementById('summary-year-select').value;
        const yearEntries = this.cropEntries.filter(entry => 
            new Date(entry.plantingDate).getFullYear().toString() === selectedYear
        );
        
        if (yearEntries.length === 0) {
            document.getElementById('total-revenue').textContent = '₵0.00';
            document.getElementById('total-entries').textContent = '0';
            document.getElementById('peak-month').textContent = '-';
            document.getElementById('monthly-summary-tbody').innerHTML = '';
            document.getElementById('no-summary-message').style.display = 'block';
            return;
        }
        
        document.getElementById('no-summary-message').style.display = 'none';
        
        // Group entries by month
        const monthlyData = {};
        let totalRevenue = 0;
        
        yearEntries.forEach(entry => {
            const harvestDate = new Date(entry.harvestDate);
            const monthKey = `${harvestDate.getFullYear()}-${harvestDate.getMonth()}`;
            const monthName = harvestDate.toLocaleDateString('en-US', { month: 'long' });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    name: monthName,
                    revenue: 0,
                    crops: {}
                };
            }
            
            const revenue = entry.actualRevenue || entry.plannedRevenue;
            monthlyData[monthKey].revenue += revenue;
            totalRevenue += revenue;
            
            if (!monthlyData[monthKey].crops[entry.crop]) {
                monthlyData[monthKey].crops[entry.crop] = 0;
            }
            monthlyData[monthKey].crops[entry.crop] += revenue;
        });
        
        // Find peak month
        const peakMonth = Object.values(monthlyData).reduce((max, current) => 
            current.revenue > max.revenue ? current : max, { revenue: 0, name: '-' }
        );
        
        // Update summary stats
        document.getElementById('total-revenue').textContent = `₵${totalRevenue.toFixed(2)}`;
        document.getElementById('total-entries').textContent = yearEntries.length.toString();
        document.getElementById('peak-month').textContent = peakMonth.name;
        
        // Update monthly table
        const tbody = document.getElementById('monthly-summary-tbody');
        tbody.innerHTML = Object.values(monthlyData).map(month => {
            const cropBreakdown = Object.entries(month.crops)
                .map(([crop, revenue]) => `${crop}: ₵${revenue.toFixed(0)}`)
                .join(', ');
            
            return `
                <tr>
                    <td>${month.name}</td>
                    <td>₵${month.revenue.toFixed(2)}</td>
                    <td>${cropBreakdown}</td>
                </tr>
            `;
        }).join('');
    }
    
    updateChartsDisplay() {
        // This would integrate with Chart.js for data visualization
        // For now, we'll show placeholder content
        const chartsContainer = document.querySelector('.charts-container');
        if (!this.cropEntries.length) {
            chartsContainer.querySelectorAll('.empty-state').forEach(state => {
                state.style.display = 'block';
            });
            chartsContainer.querySelectorAll('canvas').forEach(canvas => {
                canvas.style.display = 'none';
            });
        } else {
            chartsContainer.querySelectorAll('.empty-state').forEach(state => {
                state.style.display = 'none';
            });
            chartsContainer.querySelectorAll('canvas').forEach(canvas => {
                canvas.style.display = 'block';
            });
            
            // Initialize charts if Chart.js is available
            if (typeof Chart !== 'undefined') {
                this.initializeCharts();
            }
        }
    }
    
    updateRotationDisplay() {
        const rotationContent = document.getElementById('rotation-suggestions-content');
        const companionContent = document.getElementById('companion-planting-content');
        
        if (this.cropEntries.length === 0) {
            rotationContent.innerHTML = '<p class="empty-state">Click "Generate Rotation Plan" to see crop rotation suggestions based on your entries.</p>';
            companionContent.innerHTML = '<p class="empty-state">Add crop entries to see companion planting suggestions.</p>';
            return;
        }
        
        // Show basic companion planting info
        const companionInfo = {
            'Tomatoes': { good: ['Basil', 'Carrots', 'Lettuce'], bad: ['Broccoli', 'Corn'] },
            'Lettuce': { good: ['Tomatoes', 'Carrots', 'Onions'], bad: ['Broccoli'] },
            'Carrots': { good: ['Tomatoes', 'Lettuce', 'Onions'], bad: ['Dill'] },
            'Beans': { good: ['Corn', 'Carrots'], bad: ['Onions', 'Garlic'] },
            'Peppers': { good: ['Tomatoes', 'Basil'], bad: ['Beans'] },
            'Onions': { good: ['Tomatoes', 'Carrots', 'Lettuce'], bad: ['Beans', 'Peas'] }
        };
        
        const uniqueCrops = [...new Set(this.cropEntries.map(entry => entry.crop))];
        
        companionContent.innerHTML = uniqueCrops.map(crop => {
            const info = companionInfo[crop];
            if (!info) return `<div><strong>${crop}:</strong> No companion planting data available</div>`;
            
            return `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 5px;">
                    <strong>${crop}:</strong><br>
                    <span style="color: green;">Good companions: ${info.good.join(', ')}</span><br>
                    <span style="color: red;">Avoid: ${info.bad.join(', ')}</span>
                </div>
            `;
        }).join('');
    }
    
    generateRotationPlan() {
        if (this.cropEntries.length === 0) {
            alert('Add some crop entries first to generate a rotation plan.');
            return;
        }
        
        const rotationGroups = {};
        this.cropEntries.forEach(entry => {
            const group = entry.cropInfo.rotationGroup;
            if (!rotationGroups[group]) {
                rotationGroups[group] = [];
            }
            rotationGroups[group].push(entry);
        });
        
        const suggestions = [
            "Year 1: Plant nitrogen-fixing legumes (beans, peas) to enrich soil",
            "Year 2: Follow with heavy feeders like tomatoes and peppers",
            "Year 3: Plant light feeders such as carrots and onions",
            "Year 4: Use cover crops or let fields rest",
            "Avoid planting crops from the same family in consecutive years"
        ];
        
        const rotationContent = document.getElementById('rotation-suggestions-content');
        rotationContent.innerHTML = `
            <div class="rotation-plan">
                <h4>Recommended Rotation Plan</h4>
                <ul style="margin-left: 1.5rem;">
                    ${suggestions.map(suggestion => `<li style="margin-bottom: 0.5rem;">${suggestion}</li>`).join('')}
                </ul>
                
                <h4 style="margin-top: 1.5rem;">Your Crop Groups</h4>
                <div style="margin-top: 1rem;">
                    ${Object.entries(rotationGroups).map(([group, crops]) => `
                        <div style="margin-bottom: 1rem; padding: 0.8rem; background: #f0f8f0; border-radius: 5px;">
                            <strong>${group}:</strong> ${[...new Set(crops.map(c => c.crop))].join(', ')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    initializeCharts() {
        // This would implement Chart.js integration
        // Placeholder for chart initialization
        console.log('Charts would be initialized here with Chart.js');
    }
    
    exportToCSV() {
        if (this.cropEntries.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = ['Crop', 'Planting Date', 'Harvest Date', 'Acres', 'Planned Yield', 'Actual Yield', 'Planned Revenue', 'Actual Revenue', 'Expenses', 'Profit'];
        
        const csvContent = [
            headers.join(','),
            ...this.cropEntries.map(entry => {
                const profit = (entry.actualRevenue || entry.plannedRevenue) - entry.totalExpense;
                return [
                    entry.crop,
                    entry.plantingDate,
                    entry.harvestDate,
                    entry.acresUsed,
                    entry.plannedYield,
                    entry.actualYield || '',
                    entry.plannedRevenue,
                    entry.actualRevenue || '',
                    entry.totalExpense,
                    profit
                ].join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sefake-farm-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    updateDisplaysForYear(tab) {
        switch(tab) {
            case 'financial':
                this.updateFinancialDisplay();
                break;
            case 'success':
                this.updateSuccessDisplay();
                break;
            case 'summary':
                this.updateSummaryDisplay();
                break;
            case 'charts':
                this.updateChartsDisplay();
                break;
        }
    }
    
    updateAllDisplays() {
        this.updateTabDisplay(this.currentTab);
    }
    
    checkOnlineStatus() {
        const statusElement = document.getElementById('online-status');
        if (navigator.onLine) {
            statusElement.textContent = 'Online';
            statusElement.className = 'status-badge online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'status-badge offline';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.revenuePlanner = new RevenuePlanner();
    
    // Listen for online/offline events
    window.addEventListener('online', () => revenuePlanner.checkOnlineStatus());
    window.addEventListener('offline', () => revenuePlanner.checkOnlineStatus());
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}