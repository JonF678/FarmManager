// Farm Activity Planner - Gantt Chart Implementation
class FarmActivityPlanner {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentDate = new Date();
        this.dateRange = this.generateDateRange();
        this.crops = new Set();
        this.init();
    }

    init() {
        // Clear all localStorage data
        localStorage.removeItem('farmPlannerTasks');
        
        this.setupEventListeners();
        this.loadSampleData();
        this.renderGanttChart();
        this.renderUpcomingActivities();
    }

    loadSampleData() {
        // No sample data - start with empty tasks
        return;
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.showTaskForm();
        });

        // Export CSV button
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Print button
        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });

        // Date navigation
        document.getElementById('prev-dates').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.dateRange = this.generateDateRange();
            this.renderGanttChart();
        });

        document.getElementById('next-dates').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.dateRange = this.generateDateRange();
            this.renderGanttChart();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideTaskForm();
        });

        document.getElementById('cancel-form').addEventListener('click', () => {
            this.hideTaskForm();
        });

        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Close modal on outside click
        document.getElementById('task-form-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-form-modal') {
                this.hideTaskForm();
            }
        });
    }

    generateDateRange() {
        const start = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const end = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    }

    renderGanttChart() {
        this.updateCurrentMonthYear();
        this.renderTimelineHeader();
        this.renderGanttBody();
        this.setupScrollSynchronization();
    }

    updateCurrentMonthYear() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthYear = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        document.getElementById('current-month-year').textContent = monthYear;
    }

    renderTimelineHeader() {
        const datesHeader = document.getElementById('dates-header');
        datesHeader.innerHTML = '';

        this.dateRange.forEach((date, index) => {
            const dateColumn = document.createElement('div');
            dateColumn.className = 'date-column';
            dateColumn.dataset.index = index;
            dateColumn.dataset.date = this.formatDate(date);
            
            const dayNum = date.getDate().toString().padStart(2, '0');
            const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
            
            dateColumn.innerHTML = `
                <div>${dayNum}/${monthNum}</div>
            `;
            datesHeader.appendChild(dateColumn);
        });
    }

    renderGanttBody() {
        // Get unique crops
        this.crops = new Set(this.tasks.map(task => task.cropName));
        
        const cropsColumn = document.getElementById('crops-column');
        const timelineGrid = document.getElementById('timeline-grid');
        
        cropsColumn.innerHTML = '';
        timelineGrid.innerHTML = '';

        if (this.crops.size === 0) {
            // Show empty state
            cropsColumn.innerHTML = '<div class="crop-row">No crops planned yet</div>';
            timelineGrid.innerHTML = '<div class="timeline-row"></div>';
            return;
        }

        // Render each crop row
        this.crops.forEach((crop, index) => {
            // Crop name column
            const cropRow = document.createElement('div');
            cropRow.className = 'crop-row';
            cropRow.textContent = crop;
            cropsColumn.appendChild(cropRow);

            // Timeline row
            const timelineRow = document.createElement('div');
            timelineRow.className = 'timeline-row';
            timelineRow.dataset.crop = crop;

            // Create cells for each date
            this.dateRange.forEach((date, index) => {
                const cell = document.createElement('div');
                cell.className = 'timeline-cell';
                cell.dataset.date = this.formatDate(date);
                cell.dataset.index = index;
                timelineRow.appendChild(cell);
            });

            // Add activities for this crop
            const cropTasks = this.tasks.filter(task => task.cropName === crop);
            cropTasks.forEach(task => {
                const activityBar = this.createActivityBar(task);
                if (activityBar) {
                    timelineRow.appendChild(activityBar);
                }
            });

            timelineGrid.appendChild(timelineRow);
        });
    }

    createActivityBar(task) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        
        // Check if task overlaps with current date range
        const rangeStart = this.dateRange[0];
        const rangeEnd = this.dateRange[this.dateRange.length - 1];
        
        if (endDate < rangeStart || startDate > rangeEnd) {
            return null; // Task not in current view
        }

        const activityBar = document.createElement('div');
        activityBar.className = `activity-bar activity-${task.activityType.toLowerCase().replace(/\s+/g, '-')}`;
        activityBar.dataset.taskId = task.id;
        activityBar.draggable = true;

        // Calculate position and width more accurately
        let startIndex = -1;
        let endIndex = -1;
        
        // Find exact date positions in the date range
        for (let i = 0; i < this.dateRange.length; i++) {
            const currentDate = this.dateRange[i];
            const currentDateStr = this.formatDate(currentDate);
            
            if (currentDateStr === task.startDate) {
                startIndex = i;
            }
            if (currentDateStr === task.endDate) {
                endIndex = i;
            }
        }
        
        // If start date not found in range, skip this task
        if (startIndex === -1) {
            return null;
        }
        
        // If end date not found, calculate it based on start + duration
        if (endIndex === -1) {
            endIndex = Math.min(startIndex + task.duration - 1, this.dateRange.length - 1);
        }
        
        // Ensure we have valid indices
        startIndex = Math.max(0, Math.min(startIndex, this.dateRange.length - 1));
        endIndex = Math.max(startIndex, Math.min(endIndex, this.dateRange.length - 1));
        
        const columnWidth = 60; // Must match CSS .date-column width
        const width = (endIndex - startIndex + 1) * columnWidth;
        const left = startIndex * columnWidth;

        activityBar.style.left = `${left}px`;
        activityBar.style.width = `${width}px`;
        activityBar.style.position = 'absolute';
        activityBar.style.top = '8px';
        activityBar.style.height = '44px';
        activityBar.style.zIndex = '10';
        
        // Activity label
        const activityType = task.activityType;
        const duration = task.duration;
        activityBar.innerHTML = `
            <span class="activity-label">${activityType}</span>
            <span class="activity-duration">(${duration}d)</span>
        `;

        // Add drag and drop functionality
        this.addDragAndDrop(activityBar, task);
        
        // Add click functionality for edit/delete
        this.addClickHandler(activityBar, task);

        return activityBar;
    }

    addDragAndDrop(element, task) {
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startLeft = parseInt(element.style.left);
            element.classList.add('dragging');
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const newLeft = startLeft + deltaX;
            const columnWidth = 60;
            const snappedLeft = Math.round(newLeft / columnWidth) * columnWidth; // Snap to day columns
            const maxLeft = (this.dateRange.length - 1) * columnWidth;
            
            element.style.left = `${Math.max(0, Math.min(snappedLeft, maxLeft))}px`;
        };

        const onMouseUp = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('dragging');
            
            // Calculate new date
            const newLeft = parseInt(element.style.left);
            const columnWidth = 60;
            const dayOffset = Math.round(newLeft / columnWidth);
            
            // Ensure dayOffset is within valid range
            if (dayOffset >= 0 && dayOffset < this.dateRange.length) {
                const newStartDate = new Date(this.dateRange[dayOffset]);
                
                // Update task
                task.startDate = this.formatDate(newStartDate);
                task.endDate = this.calculateEndDate(task.startDate, task.duration);
            } else {
                // Revert position if out of bounds
                element.style.left = `${startLeft}px`;
                return;
            }
            
            this.saveTasks();
            this.renderUpcomingActivities();
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    addClickHandler(element, task) {
        element.addEventListener('click', (e) => {
            // Don't trigger during drag operations
            if (element.classList.contains('dragging')) return;
            
            e.stopPropagation();
            this.showActivityMenu(e, task);
        });
    }

    showActivityMenu(event, task) {
        // Remove any existing menu
        this.removeActivityMenu();
        
        const menu = document.createElement('div');
        menu.className = 'activity-menu';
        menu.innerHTML = `
            <button class="menu-item edit-btn">✏️ Edit</button>
            <button class="menu-item delete-btn">🗑️ Delete</button>
            <button class="menu-item close-btn">✖️ Close</button>
        `;
        
        // Position menu near the click
        menu.style.position = 'absolute';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        menu.style.zIndex = '1001';
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelector('.edit-btn').addEventListener('click', () => {
            this.editTask(task);
            this.removeActivityMenu();
        });
        
        menu.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteTask(task);
            this.removeActivityMenu();
        });
        
        menu.querySelector('.close-btn').addEventListener('click', () => {
            this.removeActivityMenu();
        });
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.removeActivityMenu.bind(this), { once: true });
        }, 100);
    }

    removeActivityMenu() {
        const existingMenu = document.querySelector('.activity-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    editTask(task) {
        this.currentEditingTask = task;
        this.showTaskForm(task);
    }

    deleteTask(task) {
        if (confirm(`Delete ${task.activityType} activity for ${task.cropName}?`)) {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            this.saveTasks();
            this.renderGanttChart();
            this.renderUpcomingActivities();
        }
    }

    showTaskForm(task = null) {
        const modal = document.getElementById('task-form-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('form-title');

        if (task) {
            title.textContent = 'Edit Task';
            this.populateForm(task);
        } else {
            title.textContent = 'Add New Task';
            form.reset();
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    hideTaskForm() {
        const modal = document.getElementById('task-form-modal');
        modal.classList.remove('active');
        modal.style.display = 'none';
        this.currentEditingTask = null; // Reset editing state
    }

    populateForm(task) {
        document.getElementById('crop-name').value = task.cropName || '';
        document.getElementById('field-name').value = task.fieldName || '';
        document.getElementById('season').value = task.season || '';
        document.getElementById('activity-type').value = task.activityType || '';
        document.getElementById('start-date').value = task.startDate || '';
        document.getElementById('duration').value = task.duration || '';
    }

    saveTask() {
        const formData = new FormData(document.getElementById('task-form'));
        const startDateInput = formData.get('startDate');
        const duration = parseInt(formData.get('duration'));
        
        const taskData = {
            cropName: formData.get('cropName'),
            fieldName: formData.get('fieldName'),
            season: formData.get('season'),
            activityType: formData.get('activityType'),
            startDate: startDateInput,
            duration: duration,
            endDate: this.calculateEndDate(startDateInput, duration)
        };

        if (this.currentEditingTask) {
            // Update existing task
            Object.assign(this.currentEditingTask, taskData);
            this.currentEditingTask = null;
        } else {
            // Create new task
            const task = {
                id: Date.now(),
                ...taskData
            };
            this.tasks.push(task);
        }

        this.saveTasks();
        
        // Navigate to the month containing the task if not visible
        const taskDate = new Date(startDateInput);
        if (taskDate.getMonth() !== this.currentDate.getMonth() || 
            taskDate.getFullYear() !== this.currentDate.getFullYear()) {
            this.currentDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), 1);
            this.dateRange = this.generateDateRange();
        }
        
        this.renderGanttChart();
        this.renderUpcomingActivities();
        this.hideTaskForm();
    }

    calculateEndDate(startDate, duration) {
        const start = new Date(startDate);
        // Duration is inclusive, so subtract 1 day to get the actual end date
        const end = new Date(start.getTime() + ((duration - 1) * 24 * 60 * 60 * 1000));
        return this.formatDate(end);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    renderUpcomingActivities() {
        const container = document.getElementById('activities-summary');
        const emptyState = document.getElementById('empty-state');
        
        // Get activities for next 2 weeks from today
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today
        const twoWeeksLater = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
        
        const upcomingTasks = this.tasks.filter(task => {
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);
            // Include tasks that start, end, or are ongoing within the next 2 weeks
            return (taskStart >= now && taskStart <= twoWeeksLater) || 
                   (taskEnd >= now && taskEnd <= twoWeeksLater) ||
                   (taskStart <= now && taskEnd >= now);
        });

        if (upcomingTasks.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '<div class="empty-state"><p>No activities scheduled for the next 2 weeks.</p></div>';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = upcomingTasks.map(task => {
            const startDate = new Date(task.startDate);
            const formattedDate = startDate.toLocaleDateString();
            
            return `
                <div class="activity-summary-item" data-task-id="${task.id}">
                    <div class="activity-date">${formattedDate}</div>
                    <div class="activity-info">
                        <strong>${task.cropName} - ${task.fieldName}</strong><br>
                        <span class="activity-type activity-${task.activityType.toLowerCase().replace(' ', '-')}">${task.activityType}</span>
                        <span class="activity-duration">${task.duration} days</span>
                    </div>
                    <div class="activity-actions">
                        <button class="btn-small edit-activity" data-task-id="${task.id}">✏️</button>
                        <button class="btn-small delete-activity" data-task-id="${task.id}">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners for summary actions
        container.querySelectorAll('.edit-activity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const task = this.tasks.find(t => t.id === taskId);
                if (task) this.editTask(task);
            });
        });
        
        container.querySelectorAll('.delete-activity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const task = this.tasks.find(t => t.id === taskId);
                if (task) this.deleteTask(task);
            });
        });
    }

    exportToCSV() {
        const headers = ['Crop', 'Field', 'Season', 'Activity', 'Start Date', 'Duration', 'End Date'];
        const rows = this.tasks.map(task => [
            task.cropName,
            task.fieldName,
            task.season,
            task.activityType,
            task.startDate,
            task.duration,
            task.endDate
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'farm-activities.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('farmPlannerTasks');
            if (stored) {
                const parsedTasks = JSON.parse(stored);
                // Only use stored tasks if they exist and have data
                if (parsedTasks.length > 0) {
                    return parsedTasks;
                }
            }
            return []; // Return empty array to allow sample data loading
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('farmPlannerTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    setupScrollSynchronization() {
        const ganttBody = document.getElementById('gantt-body');
        const datesHeader = document.getElementById('dates-header');
        
        // Remove existing scroll listeners to prevent duplicates
        ganttBody.removeEventListener('scroll', this.syncScroll);
        
        // Store reference to bound function
        this.syncScroll = (e) => {
            // Synchronize horizontal scroll between header and body
            if (datesHeader && ganttBody) {
                datesHeader.scrollLeft = ganttBody.scrollLeft;
            }
        };
        
        ganttBody.addEventListener('scroll', this.syncScroll);
    }

    setupDarkModeToggle() {
        const toggleBtn = document.getElementById('dark-mode-toggle');
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            toggleBtn.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDark);
        });

        // Load saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            toggleBtn.textContent = '☀️';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FarmActivityPlanner();
});