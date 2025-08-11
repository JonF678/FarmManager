import streamlit as st
import pandas as pd
from datetime import datetime, date
from utils.database import save_data, load_data
from utils.common import validate_input

def show():
    """Farm Management Tracker Application"""
    st.title("📊 Farm Management Tracker")
    st.markdown("Track farm operations, expenses, equipment, and daily tasks")
    
    # Initialize session state for management tracker
    if 'expenses' not in st.session_state:
        st.session_state.expenses = load_data('expenses', [])
    
    if 'equipment' not in st.session_state:
        st.session_state.equipment = load_data('equipment', [])
    
    if 'tasks' not in st.session_state:
        st.session_state.tasks = load_data('tasks', [])
    
    if 'operations' not in st.session_state:
        st.session_state.operations = load_data('operations', [])
    
    # Tab navigation within the app
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["Daily Operations", "Task Management", "Expense Tracking", "Equipment", "Analytics"])
    
    with tab1:
        show_daily_operations()
    
    with tab2:
        show_task_management()
    
    with tab3:
        show_expense_tracking()
    
    with tab4:
        show_equipment_management()
    
    with tab5:
        show_analytics()

def show_daily_operations():
    """Daily Operations Interface"""
    st.header("Daily Farm Operations")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Record New Operation")
        with st.form("add_operation"):
            operation_date = st.date_input("Date", value=date.today())
            operation_type = st.selectbox("Operation Type", [
                "Planting", "Harvesting", "Irrigation", "Fertilizing", 
                "Pest Control", "Soil Preparation", "Equipment Maintenance", "Other"
            ])
            field_name = st.text_input("Field/Area")
            description = st.text_area("Description")
            hours_spent = st.number_input("Hours Spent", min_value=0.0, step=0.5)
            workers = st.number_input("Number of Workers", min_value=1, step=1)
            cost = st.number_input("Direct Cost ($)", min_value=0.0, step=1.0)
            
            submitted = st.form_submit_button("Record Operation")
            
            if submitted and validate_input([field_name, description]):
                new_operation = {
                    'id': len(st.session_state.operations) + 1,
                    'date': operation_date.isoformat(),
                    'type': operation_type,
                    'field': field_name,
                    'description': description,
                    'hours': hours_spent,
                    'workers': workers,
                    'cost': cost,
                    'recorded_date': datetime.now().isoformat()
                }
                st.session_state.operations.append(new_operation)
                save_data('operations', st.session_state.operations)
                st.success("Operation recorded successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Recent Operations")
        if st.session_state.operations:
            # Sort by date (most recent first)
            sorted_ops = sorted(st.session_state.operations, 
                              key=lambda x: x['date'], reverse=True)
            
            for op in sorted_ops[:5]:  # Show last 5 operations
                with st.expander(f"{op['date']} - {op['type']} ({op['field']})"):
                    st.write(f"**Description:** {op['description']}")
                    st.write(f"**Hours:** {op['hours']}")
                    st.write(f"**Workers:** {op['workers']}")
                    st.write(f"**Cost:** ${op['cost']:.2f}")
        else:
            st.info("No operations recorded yet.")
    
    # Today's summary
    st.subheader("Today's Summary")
    today = date.today().isoformat()
    today_ops = [op for op in st.session_state.operations if op['date'] == today]
    
    if today_ops:
        total_hours = sum([op['hours'] for op in today_ops])
        total_cost = sum([op['cost'] for op in today_ops])
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Operations Today", len(today_ops))
        with col2:
            st.metric("Total Hours", f"{total_hours:.1f}")
        with col3:
            st.metric("Total Cost", f"${total_cost:.2f}")
    else:
        st.info("No operations recorded for today.")

def show_task_management():
    """Task Management Interface"""
    st.header("Task Management")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Add New Task")
        with st.form("add_task"):
            task_name = st.text_input("Task Name")
            task_priority = st.selectbox("Priority", ["High", "Medium", "Low"])
            task_status = st.selectbox("Status", ["Pending", "In Progress", "Completed"])
            due_date = st.date_input("Due Date")
            assigned_to = st.text_input("Assigned To")
            task_description = st.text_area("Description")
            
            submitted = st.form_submit_button("Add Task")
            
            if submitted and validate_input([task_name]):
                new_task = {
                    'id': len(st.session_state.tasks) + 1,
                    'name': task_name,
                    'priority': task_priority,
                    'status': task_status,
                    'due_date': due_date.isoformat(),
                    'assigned_to': assigned_to,
                    'description': task_description,
                    'created_date': datetime.now().isoformat()
                }
                st.session_state.tasks.append(new_task)
                save_data('tasks', st.session_state.tasks)
                st.success(f"Task '{task_name}' added successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Task Overview")
        if st.session_state.tasks:
            # Task status summary
            pending_tasks = len([t for t in st.session_state.tasks if t['status'] == 'Pending'])
            in_progress_tasks = len([t for t in st.session_state.tasks if t['status'] == 'In Progress'])
            completed_tasks = len([t for t in st.session_state.tasks if t['status'] == 'Completed'])
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Pending", pending_tasks, delta=None, delta_color="normal")
            with col2:
                st.metric("In Progress", in_progress_tasks, delta=None, delta_color="normal")
            with col3:
                st.metric("Completed", completed_tasks, delta=None, delta_color="normal")
        else:
            st.info("No tasks created yet.")
    
    # Task list
    st.subheader("All Tasks")
    if st.session_state.tasks:
        for task in st.session_state.tasks:
            # Color coding based on priority
            if task['priority'] == 'High':
                container = st.container()
                with container:
                    st.error(f"🔴 **{task['name']}** - {task['status']}")
            elif task['priority'] == 'Medium':
                st.warning(f"🟡 **{task['name']}** - {task['status']}")
            else:
                st.info(f"🟢 **{task['name']}** - {task['status']}")
            
            with st.expander(f"Task Details: {task['name']}"):
                st.write(f"**Priority:** {task['priority']}")
                st.write(f"**Status:** {task['status']}")
                st.write(f"**Due Date:** {task['due_date']}")
                st.write(f"**Assigned To:** {task['assigned_to']}")
                st.write(f"**Description:** {task['description']}")
                
                # Update status
                new_status = st.selectbox(
                    "Update Status",
                    ["Pending", "In Progress", "Completed"],
                    index=["Pending", "In Progress", "Completed"].index(task['status']),
                    key=f"task_status_{task['id']}"
                )
                
                if st.button(f"Update", key=f"update_task_{task['id']}"):
                    task['status'] = new_status
                    save_data('tasks', st.session_state.tasks)
                    st.success("Task status updated!")
                    st.rerun()

def show_expense_tracking():
    """Expense Tracking Interface"""
    st.header("Expense Tracking")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Record New Expense")
        with st.form("add_expense"):
            expense_date = st.date_input("Date", value=date.today())
            expense_category = st.selectbox("Category", [
                "Seeds", "Fertilizers", "Pesticides", "Equipment", "Fuel", 
                "Labor", "Utilities", "Maintenance", "Insurance", "Other"
            ])
            expense_description = st.text_input("Description")
            amount = st.number_input("Amount ($)", min_value=0.0, step=0.01)
            vendor = st.text_input("Vendor/Supplier")
            payment_method = st.selectbox("Payment Method", ["Cash", "Check", "Credit Card", "Bank Transfer"])
            
            submitted = st.form_submit_button("Record Expense")
            
            if submitted and validate_input([expense_description]) and amount > 0:
                new_expense = {
                    'id': len(st.session_state.expenses) + 1,
                    'date': expense_date.isoformat(),
                    'category': expense_category,
                    'description': expense_description,
                    'amount': amount,
                    'vendor': vendor,
                    'payment_method': payment_method,
                    'recorded_date': datetime.now().isoformat()
                }
                st.session_state.expenses.append(new_expense)
                save_data('expenses', st.session_state.expenses)
                st.success("Expense recorded successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Expense Summary")
        if st.session_state.expenses:
            # This month's expenses
            current_month = datetime.now().month
            current_year = datetime.now().year
            
            monthly_expenses = [
                exp for exp in st.session_state.expenses 
                if datetime.fromisoformat(exp['date']).month == current_month 
                and datetime.fromisoformat(exp['date']).year == current_year
            ]
            
            monthly_total = sum([exp['amount'] for exp in monthly_expenses])
            total_expenses = sum([exp['amount'] for exp in st.session_state.expenses])
            
            st.metric("This Month", f"${monthly_total:.2f}")
            st.metric("Total Expenses", f"${total_expenses:.2f}")
            
            # Category breakdown for this month
            if monthly_expenses:
                st.subheader("This Month by Category")
                category_totals = {}
                for exp in monthly_expenses:
                    if exp['category'] not in category_totals:
                        category_totals[exp['category']] = 0
                    category_totals[exp['category']] += exp['amount']
                
                for category, total in category_totals.items():
                    st.write(f"**{category}:** ${total:.2f}")
        else:
            st.info("No expenses recorded yet.")
    
    # Recent expenses
    st.subheader("Recent Expenses")
    if st.session_state.expenses:
        sorted_expenses = sorted(st.session_state.expenses, 
                               key=lambda x: x['date'], reverse=True)
        
        expenses_df = pd.DataFrame(sorted_expenses[:10])
        st.dataframe(expenses_df[['date', 'category', 'description', 'amount', 'vendor']], 
                    use_container_width=True)

def show_equipment_management():
    """Equipment Management Interface"""
    st.header("Equipment Management")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Add New Equipment")
        with st.form("add_equipment"):
            equipment_name = st.text_input("Equipment Name")
            equipment_type = st.selectbox("Type", [
                "Tractor", "Harvester", "Planter", "Cultivator", 
                "Sprayer", "Irrigation System", "Hand Tools", "Other"
            ])
            purchase_date = st.date_input("Purchase Date")
            purchase_cost = st.number_input("Purchase Cost ($)", min_value=0.0, step=1.0)
            serial_number = st.text_input("Serial Number")
            manufacturer = st.text_input("Manufacturer")
            condition = st.selectbox("Condition", ["Excellent", "Good", "Fair", "Poor"])
            
            submitted = st.form_submit_button("Add Equipment")
            
            if submitted and validate_input([equipment_name]):
                new_equipment = {
                    'id': len(st.session_state.equipment) + 1,
                    'name': equipment_name,
                    'type': equipment_type,
                    'purchase_date': purchase_date.isoformat(),
                    'purchase_cost': purchase_cost,
                    'serial_number': serial_number,
                    'manufacturer': manufacturer,
                    'condition': condition,
                    'last_maintenance': None,
                    'total_hours': 0,
                    'added_date': datetime.now().isoformat()
                }
                st.session_state.equipment.append(new_equipment)
                save_data('equipment', st.session_state.equipment)
                st.success(f"Equipment '{equipment_name}' added successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Equipment Overview")
        if st.session_state.equipment:
            total_value = sum([eq['purchase_cost'] for eq in st.session_state.equipment])
            st.metric("Total Equipment", len(st.session_state.equipment))
            st.metric("Total Value", f"${total_value:.2f}")
            
            # Condition breakdown
            conditions = {}
            for eq in st.session_state.equipment:
                if eq['condition'] not in conditions:
                    conditions[eq['condition']] = 0
                conditions[eq['condition']] += 1
            
            st.subheader("Equipment Condition")
            for condition, count in conditions.items():
                st.write(f"**{condition}:** {count} items")
        else:
            st.info("No equipment registered yet.")
    
    # Equipment list
    st.subheader("Equipment Inventory")
    if st.session_state.equipment:
        for equipment in st.session_state.equipment:
            with st.expander(f"{equipment['name']} ({equipment['type']})"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Manufacturer:** {equipment['manufacturer']}")
                    st.write(f"**Serial Number:** {equipment['serial_number']}")
                    st.write(f"**Purchase Date:** {equipment['purchase_date']}")
                    st.write(f"**Purchase Cost:** ${equipment['purchase_cost']:.2f}")
                
                with col2:
                    st.write(f"**Condition:** {equipment['condition']}")
                    st.write(f"**Total Hours:** {equipment['total_hours']}")
                    
                    # Update condition and hours
                    new_condition = st.selectbox(
                        "Update Condition",
                        ["Excellent", "Good", "Fair", "Poor"],
                        index=["Excellent", "Good", "Fair", "Poor"].index(equipment['condition']),
                        key=f"eq_condition_{equipment['id']}"
                    )
                    
                    new_hours = st.number_input(
                        "Total Hours",
                        value=float(equipment['total_hours']),
                        step=0.1,
                        key=f"eq_hours_{equipment['id']}"
                    )
                    
                    if st.button(f"Update", key=f"update_eq_{equipment['id']}"):
                        equipment['condition'] = new_condition
                        equipment['total_hours'] = new_hours
                        save_data('equipment', st.session_state.equipment)
                        st.success("Equipment updated!")
                        st.rerun()

def show_analytics():
    """Analytics Dashboard"""
    st.header("Farm Analytics Dashboard")
    
    if not any([st.session_state.expenses, st.session_state.operations, st.session_state.tasks]):
        st.warning("No data available for analytics. Please record some operations, expenses, or tasks.")
        return
    
    # Key Performance Indicators
    st.subheader("Key Performance Indicators")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_operations = len(st.session_state.operations)
        st.metric("Total Operations", total_operations)
    
    with col2:
        total_expenses = sum([exp['amount'] for exp in st.session_state.expenses])
        st.metric("Total Expenses", f"${total_expenses:.2f}")
    
    with col3:
        completed_tasks = len([t for t in st.session_state.tasks if t['status'] == 'Completed'])
        st.metric("Completed Tasks", completed_tasks)
    
    with col4:
        total_equipment = len(st.session_state.equipment)
        st.metric("Equipment Items", total_equipment)
    
    # Charts and visualizations
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Monthly Expenses")
        if st.session_state.expenses:
            # Group expenses by month
            monthly_data = {}
            for exp in st.session_state.expenses:
                exp_date = datetime.fromisoformat(exp['date'])
                month_key = f"{exp_date.year}-{exp_date.month:02d}"
                if month_key not in monthly_data:
                    monthly_data[month_key] = 0
                monthly_data[month_key] += exp['amount']
            
            if monthly_data:
                df = pd.DataFrame(list(monthly_data.items()), columns=['Month', 'Amount'])
                st.bar_chart(df.set_index('Month'))
        else:
            st.info("No expense data available")
    
    with col2:
        st.subheader("Operations by Type")
        if st.session_state.operations:
            op_types = {}
            for op in st.session_state.operations:
                if op['type'] not in op_types:
                    op_types[op['type']] = 0
                op_types[op['type']] += 1
            
            if op_types:
                df = pd.DataFrame(list(op_types.items()), columns=['Operation Type', 'Count'])
                st.bar_chart(df.set_index('Operation Type'))
        else:
            st.info("No operations data available")
    
    # Recent activity summary
    st.subheader("Recent Activity Summary")
    
    # Combine recent activities from all modules
    recent_activities = []
    
    # Recent operations
    for op in sorted(st.session_state.operations, key=lambda x: x['date'], reverse=True)[:3]:
        recent_activities.append({
            'date': op['date'],
            'type': 'Operation',
            'description': f"{op['type']} - {op['description']}"
        })
    
    # Recent expenses
    for exp in sorted(st.session_state.expenses, key=lambda x: x['date'], reverse=True)[:3]:
        recent_activities.append({
            'date': exp['date'],
            'type': 'Expense',
            'description': f"{exp['category']} - ${exp['amount']:.2f}"
        })
    
    # Sort all activities by date
    recent_activities.sort(key=lambda x: x['date'], reverse=True)
    
    for activity in recent_activities[:10]:  # Show top 10 recent activities
        st.write(f"**{activity['date']}** - {activity['type']}: {activity['description']}")
