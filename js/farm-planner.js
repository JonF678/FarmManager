// Farm Planner JavaScript - Based on your original functionality
class FarmPlanner {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGanttChart();
        this.renderUpcomingActivities();
        this.setupDarkModeToggle();
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
        const task = {
            id: Date.now(), // Simple ID generation
            cropName: formData.get('cropName'),
            fieldName: formData.get('fieldName'),
            season: formData.get('season'),
            activityType: formData.get('activityType'),
            startDate: formData.get('startDate'),
            duration: parseInt(formData.get('duration')),
            endDate: this.calculateEndDate(formData.get('startDate'), parseInt(formData.get('duration')))
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderGanttChart();
        this.renderUpcomingActivities();
        this.hideTaskForm();

        // Update parent app stats if available
        if (parent && parent.farmAppUtils) {
            parent.farmAppUtils.updateStats();
        }
    }

    calculateEndDate(startDate, duration) {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + (duration * 24 * 60 * 60 * 1000));
        return end.toISOString().split('T')[0];
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('farmPlannerTasks');
            return stored ? JSON.parse(stored) : [];
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

    renderGanttChart() {
        const container = document.getElementById('gantt-chart');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <h3>No tasks scheduled</h3>
                    <p>Click "Add Task" to create your first farming activity</p>
                </div>
            `;
            return;
        }

        // Simple Gantt chart representation
        let html = '<div class="gantt-timeline">';
        
        // Group tasks by field
        const tasksByField = this.groupTasksByField();
        
        Object.entries(tasksByField).forEach(([field, fieldTasks]) => {
            html += `<div class="gantt-row">`;
            html += `<div class="gantt-row-label">${field}</div>`;
            html += `<div class="gantt-row-tasks">`;
            
            fieldTasks.forEach(task => {
                const activityClass = task.activityType.toLowerCase().replace(' ', '-');
                const duration = Math.max(task.duration, 1);
                const width = Math.min(duration * 20, 200); // Scale width
                
                html += `
                    <div class="gantt-task ${activityClass}" 
                         style="width: ${width}px;" 
                         title="${task.cropName} - ${task.activityType} (${task.duration} days)"
                         data-task-id="${task.id}">
                        <span class="task-label">${task.cropName}</span>
                        <span class="task-dates">${this.formatDate(task.startDate)} - ${this.formatDate(task.endDate)}</span>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        html += '</div>';
        container.innerHTML = html;

        // Add CSS for Gantt chart
        this.addGanttStyles();
    }

    addGanttStyles() {
        const existingStyle = document.getElementById('gantt-dynamic-styles');
        if (existingStyle) return;

        const style = document.createElement('style');
        style.id = 'gantt-dynamic-styles';
        style.textContent = `
            .gantt-timeline {
                min-height: 300px;
            }
            .gantt-row {
                display: flex;
                margin-bottom: 1rem;
                align-items: center;
            }
            .gantt-row-label {
                width: 150px;
                font-weight: bold;
                padding-right: 1rem;
                color: var(--primary-color);
            }
            .gantt-row-tasks {
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .gantt-task {
                background: var(--primary-color);
                color: white;
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: transform 0.2s ease;
                min-width: 80px;
            }
            .gantt-task:hover {
                transform: scale(1.05);
            }
            .gantt-task.nursery { background: var(--nursery-color); }
            .gantt-task.transplanting { background: var(--transplanting-color); }
            .gantt-task.weeding { background: var(--weeding-color); }
            .gantt-task.harvest { background: var(--harvest-color); }
            .gantt-task.pesticides { background: var(--pesticides-color); }
            .gantt-task.fertilizer { background: var(--fertilizer-color); }
            .gantt-task.land-preparation { background: var(--land-preparation-color); }
            .task-label {
                display: block;
                font-weight: bold;
            }
            .task-dates {
                display: block;
                font-size: 0.7rem;
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
    }

    groupTasksByField() {
        const grouped = {};
        this.tasks.forEach(task => {
            const field = task.fieldName || 'Unassigned';
            if (!grouped[field]) {
                grouped[field] = [];
            }
            grouped[field].push(task);
        });
        return grouped;
    }

    renderUpcomingActivities() {
        const container = document.getElementById('activities-summary');
        const emptyState = document.getElementById('empty-state');
        
        const upcomingTasks = this.getUpcomingTasks();
        
        if (upcomingTasks.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        emptyState.style.display = 'none';
        
        let html = '';
        upcomingTasks.forEach(task => {
            const daysUntil = this.getDaysUntilTask(task.startDate);
            const urgencyClass = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'soon' : 'normal';
            
            html += `
                <div class="activity-card ${urgencyClass}">
                    <div class="activity-header">
                        <span class="activity-title">${task.cropName} - ${task.activityType}</span>
                        <span class="activity-date">${this.formatDate(task.startDate)}</span>
                    </div>
                    <div class="activity-details">
                        <strong>Field:</strong> ${task.fieldName} | 
                        <strong>Duration:</strong> ${task.duration} days | 
                        <strong>Season:</strong> ${task.season}
                        ${daysUntil === 0 ? '<span class="today-badge">TODAY</span>' : 
                          daysUntil === 1 ? '<span class="tomorrow-badge">TOMORROW</span>' : 
                          `<span class="days-badge">${daysUntil} days</span>`}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    getUpcomingTasks() {
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
        
        return this.tasks
            .filter(task => {
                const taskDate = new Date(task.startDate);
                return taskDate >= now && taskDate <= twoWeeksFromNow;
            })
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    getDaysUntilTask(dateString) {
        const taskDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        
        const diffTime = taskDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    exportToCSV() {
        if (this.tasks.length === 0) {
            alert('No tasks to export');
            return;
        }

        const headers = ['Crop Name', 'Field', 'Season', 'Activity Type', 'Start Date', 'Duration (days)', 'End Date'];
        const csvContent = [
            headers.join(','),
            ...this.tasks.map(task => [
                task.cropName,
                task.fieldName,
                task.season,
                task.activityType,
                task.startDate,
                task.duration,
                task.endDate
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-planner-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    setupDarkModeToggle() {
        const toggle = document.getElementById('dark-mode-toggle');
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggle.textContent = '☀️';
        }

        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isNowDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isNowDark);
            toggle.textContent = isNowDark ? '☀️' : '🌙';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FarmPlanner();
});