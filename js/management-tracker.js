// Revenue Planner (Farm Management System) JavaScript

// Data storage
let farmData = {
    productionRecords: [],
    incomeRecords: [],
    expenseRecords: [],
    salaryRecords: [],
    soilTestRecords: []
};

// Charts instances
let charts = {};

// Current editing record
let currentEditingRecord = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Clear all localStorage data
    localStorage.removeItem('farmManagementData');
    
    loadData();
    initializeNavigation();
    initializeForms();
    initializeFilters();
    initializeChartFilters();
    updateDashboard();
    renderAllTables();
    populateYearFilters();
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Initialize charts if dashboard is active
            if (targetSection === 'dashboard') {
                setTimeout(initializeCharts, 100);
            }
        });
    });
}

// Form initialization
function initializeForms() {
    // Production form
    const productionForm = document.getElementById('production-form');
    if (productionForm) {
        productionForm.addEventListener('submit', handleProductionSubmit);
    }

    // Income form with auto-calculation
    const incomeForm = document.getElementById('income-form');
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
        
        // Auto-calculate total
        const quantityInput = document.getElementById('income-quantity');
        const priceInput = document.getElementById('income-price');
        const totalInput = document.getElementById('income-total');
        
        function calculateIncomeTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            totalInput.value = (quantity * price).toFixed(2);
        }
        
        quantityInput.addEventListener('input', calculateIncomeTotal);
        priceInput.addEventListener('input', calculateIncomeTotal);
    }

    // Expense form with auto-calculation
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        
        // Auto-calculate total
        const quantityInput = document.getElementById('expense-quantity');
        const unitCostInput = document.getElementById('expense-unit-cost');
        const totalInput = document.getElementById('expense-total');
        
        function calculateExpenseTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitCost = parseFloat(unitCostInput.value) || 0;
            totalInput.value = (quantity * unitCost).toFixed(2);
        }
        
        quantityInput.addEventListener('input', calculateExpenseTotal);
        unitCostInput.addEventListener('input', calculateExpenseTotal);
    }

    // Salary form with auto-calculation
    const salaryForm = document.getElementById('salary-form');
    if (salaryForm) {
        salaryForm.addEventListener('submit', handleSalarySubmit);
        
        // Auto-calculate total salary
        const hoursInput = document.getElementById('salary-hours');
        const rateInput = document.getElementById('salary-rate');
        const overtimeInput = document.getElementById('salary-overtime');
        const totalInput = document.getElementById('salary-total');
        
        function calculateSalaryTotal() {
            const hours = parseFloat(hoursInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            const overtime = parseFloat(overtimeInput.value) || 0;
            const regularPay = hours * rate;
            const overtimePay = overtime * rate * 1.5; // 1.5x rate for overtime
            totalInput.value = (regularPay + overtimePay).toFixed(2);
        }
        
        hoursInput.addEventListener('input', calculateSalaryTotal);
        rateInput.addEventListener('input', calculateSalaryTotal);
        overtimeInput.addEventListener('input', calculateSalaryTotal);
    }

    // Soil form
    const soilForm = document.getElementById('soil-form');
    if (soilForm) {
        soilForm.addEventListener('submit', handleSoilSubmit);
    }

    // Cancel buttons
    document.querySelectorAll('[id$="-edit"]').forEach(button => {
        button.addEventListener('click', cancelEdit);
    });
}

// Filter initialization
function initializeFilters() {
    // Add filter event listeners
    const filterElements = document.querySelectorAll('[id$="-filter"]');
    filterElements.forEach(filter => {
        filter.addEventListener('change', function() {
            const section = this.id.split('-')[0];
            if (section === 'dashboard') {
                updateDashboard();
            } else {
                renderTable(section);
            }
        });
    });

    // Export buttons
    document.getElementById('export-csv-btn')?.addEventListener('click', () => exportToCSV('production'));
    document.getElementById('export-income-csv-btn')?.addEventListener('click', () => exportToCSV('income'));
    document.getElementById('export-expense-csv-btn')?.addEventListener('click', () => exportToCSV('expense'));
    document.getElementById('export-salary-csv-btn')?.addEventListener('click', () => exportToCSV('salary'));
    document.getElementById('export-soil-csv-btn')?.addEventListener('click', () => exportToCSV('soil'));
}

// Form handlers
function handleProductionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingRecord ? currentEditingRecord.id : Date.now(),
        date: document.getElementById('prod-date').value,
        activity: document.getElementById('prod-activity').value,
        season: document.getElementById('prod-season').value,
        field: document.getElementById('prod-field').value,
        notes: document.getElementById('prod-notes').value,
        tag: document.getElementById('prod-tag1').value,
        comments: document.getElementById('prod-comments').value,
        contact: document.getElementById('prod-contact').value
    };

    if (currentEditingRecord) {
        const index = farmData.productionRecords.findIndex(r => r.id === currentEditingRecord.id);
        farmData.productionRecords[index] = formData;
    } else {
        farmData.productionRecords.push(formData);
    }

    saveData();
    renderTable('production');
    updateDashboard();
    e.target.reset();
    cancelEdit();
}

function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingRecord ? currentEditingRecord.id : Date.now(),
        date: document.getElementById('income-date').value,
        item: document.getElementById('income-item').value,
        season: document.getElementById('income-season').value,
        field: document.getElementById('income-field').value,
        quantity: parseFloat(document.getElementById('income-quantity').value),
        unit: document.getElementById('income-unit').value,
        price: parseFloat(document.getElementById('income-price').value),
        total: parseFloat(document.getElementById('income-total').value),
        buyer: document.getElementById('income-buyer').value
    };

    if (currentEditingRecord) {
        const index = farmData.incomeRecords.findIndex(r => r.id === currentEditingRecord.id);
        farmData.incomeRecords[index] = formData;
    } else {
        farmData.incomeRecords.push(formData);
    }

    saveData();
    renderTable('income');
    updateDashboard();
    e.target.reset();
    cancelEdit();
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingRecord ? currentEditingRecord.id : Date.now(),
        date: document.getElementById('expense-date').value,
        category: document.getElementById('expense-category').value,
        season: document.getElementById('expense-season').value,
        field: document.getElementById('expense-field').value,
        description: document.getElementById('expense-description').value,
        quantity: parseFloat(document.getElementById('expense-quantity').value),
        unitCost: parseFloat(document.getElementById('expense-unit-cost').value),
        total: parseFloat(document.getElementById('expense-total').value),
        supplier: document.getElementById('expense-supplier').value
    };

    if (currentEditingRecord) {
        const index = farmData.expenseRecords.findIndex(r => r.id === currentEditingRecord.id);
        farmData.expenseRecords[index] = formData;
    } else {
        farmData.expenseRecords.push(formData);
    }

    saveData();
    renderTable('expense');
    updateDashboard();
    e.target.reset();
    cancelEdit();
}

function handleSalarySubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingRecord ? currentEditingRecord.id : Date.now(),
        date: document.getElementById('salary-date').value,
        employee: document.getElementById('salary-employee').value,
        position: document.getElementById('salary-position').value,
        hours: parseFloat(document.getElementById('salary-hours').value),
        rate: parseFloat(document.getElementById('salary-rate').value),
        overtime: parseFloat(document.getElementById('salary-overtime').value),
        total: parseFloat(document.getElementById('salary-total').value)
    };

    if (currentEditingRecord) {
        const index = farmData.salaryRecords.findIndex(r => r.id === currentEditingRecord.id);
        farmData.salaryRecords[index] = formData;
    } else {
        farmData.salaryRecords.push(formData);
    }

    saveData();
    renderTable('salary');
    updateDashboard();
    e.target.reset();
    cancelEdit();
}

function handleSoilSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditingRecord ? currentEditingRecord.id : Date.now(),
        date: document.getElementById('soil-date').value,
        time: document.getElementById('soil-time').value,
        crop: document.getElementById('soil-crop').value,
        field: document.getElementById('soil-field').value,
        moisture: parseFloat(document.getElementById('soil-moisture').value),
        ph: parseFloat(document.getElementById('soil-ph').value),
        ec: parseFloat(document.getElementById('soil-ec').value),
        humidity: parseFloat(document.getElementById('soil-humidity').value),
        notes: document.getElementById('soil-notes').value,
        status: getSoilStatus(
            parseFloat(document.getElementById('soil-moisture').value),
            parseFloat(document.getElementById('soil-ph').value),
            parseFloat(document.getElementById('soil-ec').value),
            parseFloat(document.getElementById('soil-humidity').value)
        )
    };

    if (currentEditingRecord) {
        const index = farmData.soilTestRecords.findIndex(r => r.id === currentEditingRecord.id);
        farmData.soilTestRecords[index] = formData;
    } else {
        farmData.soilTestRecords.push(formData);
    }

    saveData();
    renderTable('soil');
    updateDashboard();
    initializeMoistureChart(); // Update the moisture chart
    populateYearFilters(); // Update all filter dropdowns
    e.target.reset();
    cancelEdit();
}

function getSoilStatus(moisture, ph, ec, humidity) {
    // Simple status determination based on optimal ranges
    const optimalMoisture = moisture >= 20 && moisture <= 60;
    const optimalPH = ph >= 6.0 && ph <= 7.5;
    const optimalEC = ec >= 0.5 && ec <= 2.0;
    const optimalHumidity = humidity >= 40 && humidity <= 80;
    
    const optimalCount = [optimalMoisture, optimalPH, optimalEC, optimalHumidity].filter(Boolean).length;
    
    if (optimalCount >= 3) return 'Good';
    if (optimalCount >= 2) return 'Fair';
    return 'Poor';
}

// Table rendering
function renderAllTables() {
    renderTable('production');
    renderTable('income');
    renderTable('expense');
    renderTable('salary');
    renderTable('soil');
}

function renderTable(type) {
    const tableBody = document.getElementById(`${type}-tbody`);
    if (!tableBody) return;

    let data = [];
    let filters = {};

    switch (type) {
        case 'production':
            data = farmData.productionRecords;
            filters = {
                year: document.getElementById('year-filter')?.value,
                season: document.getElementById('season-filter')?.value,
                field: document.getElementById('field-filter')?.value
            };
            break;
        case 'income':
            data = farmData.incomeRecords;
            filters = {
                year: document.getElementById('income-year-filter')?.value,
                season: document.getElementById('income-season-filter')?.value,
                field: document.getElementById('income-field-filter')?.value
            };
            break;
        case 'expense':
            data = farmData.expenseRecords;
            filters = {
                year: document.getElementById('expense-year-filter')?.value,
                season: document.getElementById('expense-season-filter')?.value,
                field: document.getElementById('expense-field-filter')?.value
            };
            break;
        case 'salary':
            data = farmData.salaryRecords;
            filters = {
                year: document.getElementById('salary-year-filter')?.value
            };
            break;
        case 'soil':
            data = farmData.soilTestRecords;
            filters = {
                year: document.getElementById('soil-year-filter')?.value
            };
            break;
    }

    // Apply filters
    const filteredData = data.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString();
        
        if (filters.year && recordYear !== filters.year) return false;
        if (filters.season && record.season !== filters.season) return false;
        if (filters.field && !record.field.toLowerCase().includes(filters.field.toLowerCase())) return false;
        
        return true;
    });

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr class="no-data-row"><td colspan="${getColumnCount(type)}">No ${type} records found</td></tr>`;
        updateTableSummary(type, []);
        return;
    }

    // Render rows
    tableBody.innerHTML = filteredData.map(record => createTableRow(type, record)).join('');
    
    // Update summary
    updateTableSummary(type, filteredData);
}

function createTableRow(type, record) {
    const actions = `
        <button class="action-btn edit-btn" onclick="editRecord('${type}', ${record.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteRecord('${type}', ${record.id})">Delete</button>
    `;

    switch (type) {
        case 'production':
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.activity}</td>
                    <td>${record.season}</td>
                    <td>${record.field}</td>
                    <td>${record.notes || '-'}</td>
                    <td>${record.tag || '-'}</td>
                    <td>${record.comments || '-'}</td>
                    <td>${record.contact || '-'}</td>
                    <td>${actions}</td>
                </tr>
            `;
        case 'income':
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.item}</td>
                    <td>${record.season}</td>
                    <td>${record.field}</td>
                    <td>${record.quantity}</td>
                    <td>${record.unit}</td>
                    <td>₵${record.price.toFixed(2)}</td>
                    <td>₵${record.total.toFixed(2)}</td>
                    <td>${record.buyer || '-'}</td>
                    <td>${actions}</td>
                </tr>
            `;
        case 'expense':
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.category}</td>
                    <td>${record.season}</td>
                    <td>${record.field}</td>
                    <td>${record.description}</td>
                    <td>${record.quantity}</td>
                    <td>₵${record.unitCost.toFixed(2)}</td>
                    <td>₵${record.total.toFixed(2)}</td>
                    <td>${record.supplier || '-'}</td>
                    <td>${actions}</td>
                </tr>
            `;
        case 'salary':
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.employee}</td>
                    <td>${record.position}</td>
                    <td>${record.hours}</td>
                    <td>₵${record.rate.toFixed(2)}</td>
                    <td>${record.overtime}</td>
                    <td>₵${record.total.toFixed(2)}</td>
                    <td>${actions}</td>
                </tr>
            `;
        case 'soil':
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${record.time || '-'}</td>
                    <td>${record.crop || '-'}</td>
                    <td>${record.field}</td>
                    <td>${record.moisture}%</td>
                    <td>${record.ph}</td>
                    <td>${record.ec}</td>
                    <td>${record.humidity}%</td>
                    <td><span class="status-badge ${record.status?.toLowerCase()}">${record.status}</span></td>
                    <td>${record.notes || '-'}</td>
                    <td>${actions}</td>
                </tr>
            `;
    }
}

function getColumnCount(type) {
    switch (type) {
        case 'production': return 9;
        case 'income': return 10;
        case 'expense': return 10;
        case 'salary': return 8;
        case 'soil': return 11;
        default: return 5;
    }
}

function updateTableSummary(type, data) {
    const summaryElement = document.getElementById(`${type}-summary`);
    if (!summaryElement) return;

    let total = 0;
    
    switch (type) {
        case 'income':
            total = data.reduce((sum, record) => sum + record.total, 0);
            break;
        case 'expense':
            total = data.reduce((sum, record) => sum + record.total, 0);
            break;
        case 'salary':
            total = data.reduce((sum, record) => sum + record.total, 0);
            break;
    }

    summaryElement.textContent = total.toFixed(2);
}

// Dashboard functions
function updateDashboard() {
    const filters = {
        year: document.getElementById('dashboard-year-filter')?.value,
        season: document.getElementById('dashboard-season-filter')?.value,
        field: document.getElementById('dashboard-field-filter')?.value
    };

    // Filter data based on dashboard filters
    const filteredIncome = farmData.incomeRecords.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString();
        if (filters.year && recordYear !== filters.year) return false;
        if (filters.season && record.season !== filters.season) return false;
        if (filters.field && !record.field.toLowerCase().includes(filters.field.toLowerCase())) return false;
        return true;
    });

    const filteredExpenses = farmData.expenseRecords.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString();
        if (filters.year && recordYear !== filters.year) return false;
        if (filters.season && record.season !== filters.season) return false;
        if (filters.field && !record.field.toLowerCase().includes(filters.field.toLowerCase())) return false;
        return true;
    });

    const filteredSalaries = farmData.salaryRecords.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString();
        if (filters.year && recordYear !== filters.year) return false;
        return true;
    });

    // Calculate totals
    const totalIncome = filteredIncome.reduce((sum, record) => sum + record.total, 0);
    const totalExpenses = filteredExpenses.reduce((sum, record) => sum + record.total, 0);
    const totalSalaries = filteredSalaries.reduce((sum, record) => sum + record.total, 0);
    const netIncome = totalIncome - totalExpenses - totalSalaries;

    // Update dashboard cards
    document.getElementById('total-income').textContent = `₵${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `₵${totalExpenses.toFixed(2)}`;
    document.getElementById('total-salaries').textContent = `₵${totalSalaries.toFixed(2)}`;
    document.getElementById('net-income').textContent = `₵${netIncome.toFixed(2)}`;

    // Update recent activity
    updateRecentActivity();
    
    // Update charts if dashboard is visible
    if (document.getElementById('dashboard').classList.contains('active')) {
        setTimeout(initializeCharts, 100);
    }
}

function updateRecentActivity() {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;

    // Combine all records and sort by date
    const allRecords = [
        ...farmData.productionRecords.map(r => ({...r, type: 'Production'})),
        ...farmData.incomeRecords.map(r => ({...r, type: 'Income'})),
        ...farmData.expenseRecords.map(r => ({...r, type: 'Expense'})),
        ...farmData.salaryRecords.map(r => ({...r, type: 'Salary'})),
        ...farmData.soilTestRecords.map(r => ({...r, type: 'Soil Test'}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (allRecords.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }

    activityList.innerHTML = allRecords.map(record => `
        <div class="activity-item">
            <div class="activity-details">
                <div class="activity-type">${record.type}</div>
                <div class="activity-date">${formatDate(record.date)}</div>
            </div>
        </div>
    `).join('');
}

// Chart initialization
function initializeCharts() {
    initializeIncomeExpenseChart();
    initializeExpenseBreakdownChart();
    initializeProductionChart();
    initializeMoistureChart();
}

function initializeIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.incomeExpense) {
        charts.incomeExpense.destroy();
    }

    // Group data by month
    const monthlyData = {};
    
    farmData.incomeRecords.forEach(record => {
        const month = new Date(record.date).toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
        monthlyData[month].income += record.total;
    });

    farmData.expenseRecords.forEach(record => {
        const month = new Date(record.date).toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
        monthlyData[month].expenses += record.total;
    });

    const months = Object.keys(monthlyData).sort().slice(-6);
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);

    charts.incomeExpense = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(month => new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
            datasets: [{
                label: 'Income',
                data: incomeData,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }, {
                label: 'Expenses',
                data: expenseData,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.4
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
            }
        }
    });
}

function initializeExpenseBreakdownChart() {
    const ctx = document.getElementById('expenseBreakdownChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.expenseBreakdown) {
        charts.expenseBreakdown.destroy();
    }

    // Group expenses by category
    const categoryData = {};
    farmData.expenseRecords.forEach(record => {
        if (!categoryData[record.category]) categoryData[record.category] = 0;
        categoryData[record.category] += record.total;
    });

    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);

    charts.expenseBreakdown = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
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

function initializeProductionChart() {
    const ctx = document.getElementById('productionChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.production) {
        charts.production.destroy();
    }

    // Group production by activity
    const activityData = {};
    farmData.productionRecords.forEach(record => {
        if (!activityData[record.activity]) activityData[record.activity] = 0;
        activityData[record.activity]++;
    });

    const activities = Object.keys(activityData);
    const counts = Object.values(activityData);

    charts.production = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: activities,
            datasets: [{
                label: 'Activity Count',
                data: counts,
                backgroundColor: '#345187'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function initializeMoistureChart() {
    const ctx = document.getElementById('moistureChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.moisture) {
        charts.moisture.destroy();
    }

    // Get filter values
    const cropFilter = document.getElementById('moisture-crop-filter')?.value || '';
    const fieldFilter = document.getElementById('moisture-field-filter')?.value || '';

    // Filter soil data
    let filteredData = farmData.soilTestRecords;
    
    if (cropFilter) {
        filteredData = filteredData.filter(record => record.crop === cropFilter);
    }
    
    if (fieldFilter) {
        filteredData = filteredData.filter(record => record.field === fieldFilter);
    }

    // Sort by date
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare chart data
    const labels = filteredData.map(record => {
        const date = new Date(record.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const moistureData = filteredData.map(record => parseFloat(record.moisture));

    charts.moisture = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Moisture Level (%)',
                data: moistureData,
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
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const record = filteredData[context.dataIndex];
                            return [
                                `Field: ${record.field}`,
                                `Crop: ${record.crop || 'N/A'}`,
                                `pH: ${record.ph}`,
                                `Humidity: ${record.humidity}%`
                            ];
                        }
                    }
                }
            }
        }
    });

    // Update filter dropdowns
    updateMoistureFilters();
}

function updateMoistureFilters() {
    const cropFilter = document.getElementById('moisture-crop-filter');
    const fieldFilter = document.getElementById('moisture-field-filter');
    
    if (cropFilter) {
        const crops = [...new Set(farmData.soilTestRecords.map(r => r.crop).filter(Boolean))];
        const currentCrop = cropFilter.value;
        cropFilter.innerHTML = '<option value="">All Crops</option>';
        crops.forEach(crop => {
            cropFilter.innerHTML += `<option value="${crop}">${crop}</option>`;
        });
        cropFilter.value = currentCrop;
    }
    
    if (fieldFilter) {
        const fields = [...new Set(farmData.soilTestRecords.map(r => r.field).filter(Boolean))];
        const currentField = fieldFilter.value;
        fieldFilter.innerHTML = '<option value="">All Fields</option>';
        fields.forEach(field => {
            fieldFilter.innerHTML += `<option value="${field}">${field}</option>`;
        });
        fieldFilter.value = currentField;
    }
}

function initializeChartFilters() {
    // Add event listeners for moisture chart filters
    const cropFilter = document.getElementById('moisture-crop-filter');
    const fieldFilter = document.getElementById('moisture-field-filter');
    
    if (cropFilter) {
        cropFilter.addEventListener('change', initializeMoistureChart);
    }
    
    if (fieldFilter) {
        fieldFilter.addEventListener('change', initializeMoistureChart);
    }
}

// Utility functions
function populateYearFilters() {
    const allRecords = [
        ...farmData.productionRecords,
        ...farmData.incomeRecords,
        ...farmData.expenseRecords,
        ...farmData.salaryRecords,
        ...farmData.soilTestRecords
    ];

    const years = [...new Set(allRecords.map(record => new Date(record.date).getFullYear()))].sort((a, b) => b - a);
    
    const yearFilters = document.querySelectorAll('[id$="year-filter"]');
    yearFilters.forEach(filter => {
        const currentValue = filter.value;
        filter.innerHTML = '<option value="">All Years</option>';
        years.forEach(year => {
            filter.innerHTML += `<option value="${year}">${year}</option>`;
        });
        filter.value = currentValue;
    });

    // Populate field filters
    const fields = [...new Set(allRecords.map(record => record.field).filter(Boolean))];
    const fieldFilters = document.querySelectorAll('[id$="field-filter"]');
    fieldFilters.forEach(filter => {
        const currentValue = filter.value;
        filter.innerHTML = '<option value="">All Fields</option>';
        fields.forEach(field => {
            filter.innerHTML += `<option value="${field}">${field}</option>`;
        });
        filter.value = currentValue;
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// CRUD operations
function editRecord(type, id) {
    let record;
    let formPrefix;

    switch (type) {
        case 'production':
            record = farmData.productionRecords.find(r => r.id == id);
            formPrefix = 'prod';
            break;
        case 'income':
            record = farmData.incomeRecords.find(r => r.id == id);
            formPrefix = 'income';
            break;
        case 'expense':
            record = farmData.expenseRecords.find(r => r.id == id);
            formPrefix = 'expense';
            break;
        case 'salary':
            record = farmData.salaryRecords.find(r => r.id == id);
            formPrefix = 'salary';
            break;
        case 'soil':
            record = farmData.soilTestRecords.find(r => r.id == id);
            formPrefix = 'soil';
            break;
    }

    if (!record) return;

    currentEditingRecord = record;

    // Populate form fields
    Object.keys(record).forEach(key => {
        if (key === 'id') return;
        
        let fieldId;
        switch (key) {
            case 'activity':
            case 'season':
            case 'field':
            case 'notes':
            case 'tag':
            case 'comments':
            case 'contact':
                fieldId = `${formPrefix}-${key === 'tag' ? 'tag1' : key}`;
                break;
            case 'item':
            case 'quantity':
            case 'unit':
            case 'price':
            case 'total':
            case 'buyer':
                fieldId = `${formPrefix}-${key}`;
                break;
            case 'category':
            case 'description':
            case 'unitCost':
            case 'supplier':
                fieldId = `${formPrefix}-${key === 'unitCost' ? 'unit-cost' : key}`;
                break;
            case 'employee':
            case 'position':
            case 'hours':
            case 'rate':
            case 'overtime':
                fieldId = `${formPrefix}-${key}`;
                break;
            case 'time':
            case 'crop':
            case 'moisture':
            case 'ph':
            case 'ec':
            case 'humidity':
            case 'notes':
                fieldId = `${formPrefix}-${key}`;
                break;
            default:
                fieldId = `${formPrefix}-${key}`;
        }

        const field = document.getElementById(fieldId);
        if (field) {
            field.value = record[key];
        }
    });

    // Show cancel button
    const cancelBtn = document.getElementById(`cancel-${formPrefix}-edit`);
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }

    // Change submit button text
    const form = document.getElementById(`${formPrefix === 'prod' ? 'production' : formPrefix}-form`);
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Update Record';
    }
}

function deleteRecord(type, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    switch (type) {
        case 'production':
            farmData.productionRecords = farmData.productionRecords.filter(r => r.id != id);
            break;
        case 'income':
            farmData.incomeRecords = farmData.incomeRecords.filter(r => r.id != id);
            break;
        case 'expense':
            farmData.expenseRecords = farmData.expenseRecords.filter(r => r.id != id);
            break;
        case 'salary':
            farmData.salaryRecords = farmData.salaryRecords.filter(r => r.id != id);
            break;
        case 'soil':
            farmData.soilTestRecords = farmData.soilTestRecords.filter(r => r.id != id);
            break;
    }

    saveData();
    renderTable(type);
    updateDashboard();
    populateYearFilters();
}

function cancelEdit() {
    currentEditingRecord = null;

    // Hide all cancel buttons
    document.querySelectorAll('[id$="-edit"]').forEach(btn => {
        btn.style.display = 'none';
    });

    // Reset all submit button texts
    document.querySelectorAll('button[type="submit"]').forEach(btn => {
        if (btn.textContent.includes('Update')) {
            btn.textContent = btn.textContent.replace('Update', 'Add');
        }
    });

    // Clear all forms
    document.querySelectorAll('.data-form').forEach(form => {
        form.reset();
    });
}

// Export functionality
function exportToCSV(type) {
    let data, filename, headers;

    switch (type) {
        case 'production':
            data = farmData.productionRecords;
            filename = 'production_records.csv';
            headers = ['Date', 'Activity', 'Season', 'Field', 'Notes', 'Tag', 'Comments', 'Contact'];
            break;
        case 'income':
            data = farmData.incomeRecords;
            filename = 'income_records.csv';
            headers = ['Date', 'Item/Crop', 'Season', 'Field', 'Quantity', 'Unit', 'Unit Price', 'Total Amount', 'Buyer'];
            break;
        case 'expense':
            data = farmData.expenseRecords;
            filename = 'expense_records.csv';
            headers = ['Date', 'Category', 'Season', 'Field', 'Description', 'Quantity', 'Unit Cost', 'Total Cost', 'Supplier'];
            break;
        case 'salary':
            data = farmData.salaryRecords;
            filename = 'salary_records.csv';
            headers = ['Date', 'Employee', 'Position', 'Hours', 'Rate', 'Overtime', 'Total Salary'];
            break;
        case 'soil':
            data = farmData.soilTestRecords;
            filename = 'soil_test_records.csv';
            headers = ['Test Date', 'Field', 'pH Level', 'Nitrogen %', 'Phosphorus %', 'Potassium %', 'Organic Matter %', 'Recommendations'];
            break;
    }

    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(record => {
        const row = [];
        switch (type) {
            case 'production':
                row.push(record.date, record.activity, record.season, record.field, 
                        record.notes || '', record.tag || '', record.comments || '', record.contact || '');
                break;
            case 'income':
                row.push(record.date, record.item, record.season, record.field, 
                        record.quantity, record.unit, record.price, record.total, record.buyer || '');
                break;
            case 'expense':
                row.push(record.date, record.category, record.season, record.field, 
                        record.description, record.quantity, record.unitCost, record.total, record.supplier || '');
                break;
            case 'salary':
                row.push(record.date, record.employee, record.position, 
                        record.hours, record.rate, record.overtime, record.total);
                break;
            case 'soil':
                row.push(record.date, record.field, record.ph, record.nitrogen, 
                        record.phosphorus, record.potassium, record.organicMatter, record.recommendations || '');
                break;
        }
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Data persistence
function saveData() {
    localStorage.setItem('farmManagementData', JSON.stringify(farmData));
}

function loadData() {
    const savedData = localStorage.getItem('farmManagementData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only use saved data if it has actual records, otherwise keep sample data
        if (parsedData.productionRecords?.length > 0 || 
            parsedData.incomeRecords?.length > 0 || 
            parsedData.expenseRecords?.length > 0 || 
            parsedData.salaryRecords?.length > 0 || 
            parsedData.soilTestRecords?.length > 0) {
            farmData = parsedData;
        }
    }
}

// Make functions available globally
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;