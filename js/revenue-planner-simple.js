// Simplified Revenue Planner - Working Version
class RevenuePlanner {
    constructor() {
        this.cropData = [
            { name: 'Tomatoes', pricePerUnit: 2.50, yieldPerAcre: 2000, yieldUnit: 'kg', daysToTransplant: 30, daysToMaturity: 90, expensePerAcre: 500, rotationGroup: 'Nightshades' },
            { name: 'Maize (Corn)', pricePerUnit: 1.20, yieldPerAcre: 1500, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 120, expensePerAcre: 300, rotationGroup: 'Grasses' },
            { name: 'Lettuce', pricePerUnit: 3.00, yieldPerAcre: 800, yieldUnit: 'kg', daysToTransplant: 21, daysToMaturity: 60, expensePerAcre: 250, rotationGroup: 'Leafy Greens' },
            { name: 'Beans', pricePerUnit: 4.00, yieldPerAcre: 600, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 75, expensePerAcre: 200, rotationGroup: 'Legumes' },
            { name: 'Carrots', pricePerUnit: 2.00, yieldPerAcre: 1200, yieldUnit: 'kg', daysToTransplant: 0, daysToMaturity: 80, expensePerAcre: 180, rotationGroup: 'Root Vegetables' },
            { name: 'Peppers', pricePerUnit: 5.00, yieldPerAcre: 800, yieldUnit: 'kg', daysToTransplant: 45, daysToMaturity: 100, expensePerAcre: 400, rotationGroup: 'Nightshades' },
            { name: 'Onions', pricePerUnit: 1.80, yieldPerAcre: 1000, yieldUnit: 'kg', daysToTransplant: 60, daysToMaturity: 120, expensePerAcre: 220, rotationGroup: 'Alliums' },
            { name: 'Cabbage', pricePerUnit: 1.50, yieldPerAcre: 1800, yieldUnit: 'kg', daysToTransplant: 30, daysToMaturity: 90, expensePerAcre: 300, rotationGroup: 'Brassicas' }
        ];
        this.cropEntries = [];
        this.currentTab = 'planner';
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.populateCropSelectors();
        this.updateAllDisplays();
        this.populateYearSelectors();
    }
    
    loadFromStorage() {
        const savedCropData = localStorage.getItem('sefake-farm-crop-data');
        const savedEntries = localStorage.getItem('sefake-farm-entries');
        
        if (savedCropData) {
            this.cropData = JSON.parse(savedCropData);
        }
        
        if (savedEntries && savedEntries !== 'null') {
            const parsedEntries = JSON.parse(savedEntries);
            if (Array.isArray(parsedEntries)) {
                this.cropEntries = parsedEntries;
            }
        }
    }
    
    saveToStorage() {
        localStorage.setItem('sefake-farm-crop-data', JSON.stringify(this.cropData));
        localStorage.setItem('sefake-farm-entries', JSON.stringify(this.cropEntries));
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Form event listeners
        const addCropBtn = document.getElementById('add-crop-btn');
        if (addCropBtn) {
            addCropBtn.addEventListener('click', () => this.showAddCropForm());
        }
        
        const cancelAddBtn = document.getElementById('cancel-add');
        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => this.hideAddCropForm());
        }
        
        const cropEntryForm = document.getElementById('crop-entry-form');
        if (cropEntryForm) {
            cropEntryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCropEntry();
            });
        }
        
        const addCropDataBtn = document.getElementById('add-crop-data-btn');
        if (addCropDataBtn) {
            addCropDataBtn.addEventListener('click', () => this.showCropDataForm());
        }
        
        const cancelCropDataBtn = document.getElementById('cancel-crop-data');
        if (cancelCropDataBtn) {
            cancelCropDataBtn.addEventListener('click', () => this.hideCropDataForm());
        }
        
        const cropDataForm = document.getElementById('crop-data-entry-form');
        if (cropDataForm) {
            cropDataForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCropData();
            });
        }
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
        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetButton) targetButton.classList.add('active');
        
        this.currentTab = tabName;
        this.updateTabDisplay(tabName);
    }
    
    updateTabDisplay(tabName) {
        switch(tabName) {
            case 'planner':
                this.updateCropEntriesTable();
                break;
            case 'crops':
                this.updateCropDataTable();
                break;
            case 'financial':
                this.updateFinancialDisplay();
                break;
            case 'summary':
                this.updateSummaryDisplay();
                break;
        }
    }
    
    populateCropSelectors() {
        const selector = document.getElementById('crop-select');
        if (!selector) return;
        
        selector.innerHTML = '<option value="">Select a crop...</option>';
        
        this.cropData.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.name;
            option.textContent = crop.name;
            selector.appendChild(option);
        });
    }
    
    showAddCropForm() {
        const form = document.getElementById('add-crop-form');
        if (form) form.classList.remove('hidden');
    }
    
    hideAddCropForm() {
        const form = document.getElementById('add-crop-form');
        if (form) {
            form.classList.add('hidden');
            document.getElementById('crop-entry-form').reset();
        }
    }
    
    addCropEntry() {
        const cropName = document.getElementById('crop-select').value;
        const plantingDate = document.getElementById('planting-date').value;
        const acresUsed = parseFloat(document.getElementById('acres-used').value);
        
        if (!cropName) {
            alert('Please select a crop');
            return;
        }
        
        if (!plantingDate) {
            alert('Please enter a planting date');
            return;
        }
        
        if (!acresUsed || acresUsed <= 0) {
            alert('Please enter a valid number of acres');
            return;
        }
        
        const cropInfo = this.cropData.find(crop => crop.name === cropName);
        if (!cropInfo) {
            alert('Selected crop not found');
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
    
    updateCropEntriesTable() {
        const tbody = document.getElementById('crop-entries-tbody');
        const noEntriesMsg = document.getElementById('no-entries-message');
        
        if (!tbody) return;
        
        if (this.cropEntries.length === 0) {
            tbody.innerHTML = '';
            if (noEntriesMsg) noEntriesMsg.style.display = 'block';
            return;
        }
        
        if (noEntriesMsg) noEntriesMsg.style.display = 'none';
        
        tbody.innerHTML = this.cropEntries.map(entry => `
            <tr>
                <td>${entry.crop}</td>
                <td>${new Date(entry.plantingDate).toLocaleDateString()}</td>
                <td>${new Date(entry.harvestDate).toLocaleDateString()}</td>
                <td>${entry.acresUsed} acres</td>
                <td>
                    <div>Planned: ${entry.plannedYield.toFixed(1)} ${entry.cropInfo.yieldUnit}</div>
                    <div>
                        Actual: <input type="number" value="${entry.actualYield || ''}" 
                              onchange="window.revenuePlanner.updateActualValues(${entry.id}, this.value, null)" 
                              style="width: 80px; padding: 2px;" placeholder="Enter actual">
                        ${entry.actualYield ? this.calculateVariance(entry.actualYield, entry.plannedYield) : ''}
                    </div>
                </td>
                <td>
                    <div>Planned: ₵${entry.plannedRevenue.toFixed(2)}</div>
                    <div>
                        Actual: <input type="number" value="${entry.actualRevenue || ''}" 
                              onchange="window.revenuePlanner.updateActualValues(${entry.id}, null, this.value)" 
                              style="width: 80px; padding: 2px;" placeholder="Enter actual">
                        ${entry.actualRevenue ? this.calculateVariance(entry.actualRevenue, entry.plannedRevenue) : ''}
                    </div>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="window.revenuePlanner.deleteCropEntry(${entry.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    calculateVariance(actual, planned) {
        if (!actual || !planned || planned === 0) return '';
        
        const variance = ((actual - planned) / planned) * 100;
        const color = variance >= 0 ? '#28a745' : '#dc3545';
        const sign = variance >= 0 ? '+' : '';
        
        return `<span style="color: ${color}; font-weight: bold; font-size: 0.85em; margin-left: 5px;">(${sign}${variance.toFixed(1)}%)</span>`;
    }
    
    updateActualValues(id, actualYield, actualRevenue) {
        const entry = this.cropEntries.find(e => e.id === id);
        if (entry) {
            if (actualYield !== null && actualYield !== '') {
                entry.actualYield = parseFloat(actualYield) || 0;
            }
            if (actualRevenue !== null && actualRevenue !== '') {
                entry.actualRevenue = parseFloat(actualRevenue) || 0;
            }
            
            this.saveToStorage();
            this.updateCropEntriesTable();
            this.updateAllDisplays();
        }
    }
    
    deleteCropEntry(id) {
        if (confirm('Are you sure you want to delete this crop entry?')) {
            this.cropEntries = this.cropEntries.filter(entry => entry.id !== id);
            this.saveToStorage();
            this.updateCropEntriesTable();
        }
    }
    
    showCropDataForm() {
        const form = document.getElementById('crop-data-form');
        if (form) form.classList.remove('hidden');
    }
    
    hideCropDataForm() {
        const form = document.getElementById('crop-data-form');
        if (form) {
            form.classList.add('hidden');
            document.getElementById('crop-data-entry-form').reset();
        }
    }
    
    saveCropData() {
        const name = document.getElementById('crop-name').value.trim();
        const pricePerUnit = parseFloat(document.getElementById('price-per-unit').value) || 0;
        const yieldPerAcre = parseFloat(document.getElementById('yield-per-acre').value) || 0;
        const yieldUnit = document.getElementById('yield-unit').value;
        const daysToTransplant = parseInt(document.getElementById('days-to-transplant').value) || 0;
        const daysToMaturity = parseInt(document.getElementById('days-to-maturity').value) || 0;
        const expensePerAcre = parseFloat(document.getElementById('expense-per-acre').value) || 0;
        const rotationGroup = document.getElementById('rotation-group').value;
        
        if (!name) {
            alert('Please enter a crop name');
            return;
        }
        
        if (pricePerUnit <= 0) {
            alert('Please enter a valid price per unit');
            return;
        }
        
        if (yieldPerAcre <= 0) {
            alert('Please enter a valid yield per acre');
            return;
        }
        
        if (!yieldUnit) {
            alert('Please select a yield unit');
            return;
        }
        
        if (daysToMaturity <= 0) {
            alert('Please enter valid days to maturity');
            return;
        }
        
        if (!rotationGroup) {
            alert('Please select a rotation group');
            return;
        }
        
        const cropData = {
            name: name,
            pricePerUnit: pricePerUnit,
            yieldPerAcre: yieldPerAcre,
            yieldUnit: yieldUnit,
            daysToTransplant: daysToTransplant,
            daysToMaturity: daysToMaturity,
            expensePerAcre: expensePerAcre,
            rotationGroup: rotationGroup
        };
        
        this.cropData.push(cropData);
        this.saveToStorage();
        this.hideCropDataForm();
        this.updateCropDataTable();
        this.populateCropSelectors();
    }
    
    updateCropDataTable() {
        const tbody = document.getElementById('crop-data-tbody');
        if (!tbody) return;
        
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
                    <button class="btn btn-danger" onclick="window.revenuePlanner.deleteCropData(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    deleteCropData(index) {
        if (confirm('Are you sure you want to delete this crop?')) {
            this.cropData.splice(index, 1);
            this.saveToStorage();
            this.updateCropDataTable();
            this.populateCropSelectors();
        }
    }
    
    populateYearSelectors() {
        if (this.cropEntries.length === 0) return;
        
        const years = [...new Set(this.cropEntries.map(entry => 
            new Date(entry.plantingDate).getFullYear()
        ))].sort().reverse();
        
        ['financial', 'success', 'summary', 'charts'].forEach(tab => {
            const selector = document.getElementById(`${tab}-year-select`);
            if (selector) {
                selector.innerHTML = years.map(year => 
                    `<option value="${year}">${year}</option>`
                ).join('');
            }
        });
    }
    
    updateFinancialDisplay() {
        const tbody = document.getElementById('financial-tbody');
        if (!tbody) return;
        
        if (this.cropEntries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No crop entries found. Add some crops in the Crop Planner tab first.</td></tr>';
            return;
        }
        
        let totalProfit = 0;
        let totalExpenses = 0;
        let totalRevenue = 0;
        
        tbody.innerHTML = this.cropEntries.map(entry => {
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
        
        // Update summary cards
        const profitElement = document.getElementById('total-profit');
        const expensesElement = document.getElementById('total-expenses');
        const marginElement = document.getElementById('average-margin');
        const roiElement = document.getElementById('roi');
        
        if (profitElement) profitElement.textContent = `₵${totalProfit.toFixed(2)}`;
        if (expensesElement) expensesElement.textContent = `₵${totalExpenses.toFixed(2)}`;
        if (marginElement) marginElement.textContent = `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`;
        if (roiElement) roiElement.textContent = `${totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100).toFixed(1) : 0}%`;
    }
    
    updateSummaryDisplay() {
        const totalCropsElement = document.getElementById('total-crops-planted');
        const totalAcresElement = document.getElementById('total-acres-used');
        const activePlantingsElement = document.getElementById('active-plantings');
        
        if (totalCropsElement) {
            totalCropsElement.textContent = this.cropEntries.length.toString();
        }
        
        if (totalAcresElement) {
            const totalAcres = this.cropEntries.reduce((sum, entry) => sum + entry.acresUsed, 0);
            totalAcresElement.textContent = totalAcres.toFixed(1);
        }
        
        if (activePlantingsElement) {
            const today = new Date();
            const activePlantings = this.cropEntries.filter(entry => {
                const harvestDate = new Date(entry.harvestDate);
                return harvestDate > today;
            }).length;
            activePlantingsElement.textContent = activePlantings.toString();
        }
    }
    
    updateAllDisplays() {
        this.updateTabDisplay(this.currentTab);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.revenuePlanner = new RevenuePlanner();
    }, 100);
});