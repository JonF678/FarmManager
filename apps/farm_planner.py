import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from utils.database import save_data, load_data
from utils.common import validate_input

def show():
    """Farm Planner Application"""
    st.title("📋 Offline Farm Planner")
    st.markdown("Plan your crops, field layouts, and seasonal activities")
    
    # Initialize session state for farm planner
    if 'farm_plans' not in st.session_state:
        st.session_state.farm_plans = load_data('farm_plans', [])
    
    if 'fields' not in st.session_state:
        st.session_state.fields = load_data('fields', [])
    
    # Tab navigation within the app
    tab1, tab2, tab3, tab4 = st.tabs(["Field Management", "Crop Planning", "Seasonal Calendar", "Reports"])
    
    with tab1:
        show_field_management()
    
    with tab2:
        show_crop_planning()
    
    with tab3:
        show_seasonal_calendar()
    
    with tab4:
        show_planning_reports()

def show_field_management():
    """Field Management Interface"""
    st.header("Field Management")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Add New Field")
        with st.form("add_field"):
            field_name = st.text_input("Field Name")
            field_size = st.number_input("Size (acres)", min_value=0.1, step=0.1)
            soil_type = st.selectbox("Soil Type", ["Clay", "Sandy", "Loam", "Silty", "Rocky"])
            irrigation = st.selectbox("Irrigation Available", ["Yes", "No"])
            notes = st.text_area("Notes")
            
            submitted = st.form_submit_button("Add Field")
            
            if submitted and validate_input([field_name]):
                new_field = {
                    'id': len(st.session_state.fields) + 1,
                    'name': field_name,
                    'size': field_size,
                    'soil_type': soil_type,
                    'irrigation': irrigation,
                    'notes': notes,
                    'created_date': datetime.now().isoformat()
                }
                st.session_state.fields.append(new_field)
                save_data('fields', st.session_state.fields)
                st.success(f"Field '{field_name}' added successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Existing Fields")
        if st.session_state.fields:
            df = pd.DataFrame(st.session_state.fields)
            st.dataframe(df[['name', 'size', 'soil_type', 'irrigation']], use_container_width=True)
            
            # Field actions
            field_to_remove = st.selectbox("Remove Field", ["Select..."] + [f['name'] for f in st.session_state.fields])
            if st.button("Remove Selected Field") and field_to_remove != "Select...":
                st.session_state.fields = [f for f in st.session_state.fields if f['name'] != field_to_remove]
                save_data('fields', st.session_state.fields)
                st.success(f"Field '{field_to_remove}' removed!")
                st.rerun()
        else:
            st.info("No fields added yet. Add your first field to get started!")

def show_crop_planning():
    """Crop Planning Interface"""
    st.header("Crop Planning")
    
    if not st.session_state.fields:
        st.warning("Please add fields first in the Field Management tab.")
        return
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Create Crop Plan")
        with st.form("add_crop_plan"):
            plan_name = st.text_input("Plan Name")
            field_id = st.selectbox("Select Field", [f['name'] for f in st.session_state.fields])
            crop_type = st.selectbox("Crop Type", [
                "Corn", "Wheat", "Soybeans", "Rice", "Barley", "Oats", "Cotton", 
                "Potatoes", "Tomatoes", "Carrots", "Onions", "Lettuce"
            ])
            plant_date = st.date_input("Planned Planting Date")
            harvest_date = st.date_input("Expected Harvest Date")
            area_planned = st.number_input("Area to Plant (acres)", min_value=0.1, step=0.1)
            
            submitted = st.form_submit_button("Create Plan")
            
            if submitted and validate_input([plan_name]):
                new_plan = {
                    'id': len(st.session_state.farm_plans) + 1,
                    'name': plan_name,
                    'field': field_id,
                    'crop_type': crop_type,
                    'plant_date': plant_date.isoformat(),
                    'harvest_date': harvest_date.isoformat(),
                    'area_planned': area_planned,
                    'status': 'Planned',
                    'created_date': datetime.now().isoformat()
                }
                st.session_state.farm_plans.append(new_plan)
                save_data('farm_plans', st.session_state.farm_plans)
                st.success(f"Crop plan '{plan_name}' created successfully!")
                st.rerun()
    
    with col2:
        st.subheader("Current Crop Plans")
        if st.session_state.farm_plans:
            for plan in st.session_state.farm_plans:
                with st.expander(f"{plan['name']} - {plan['crop_type']}"):
                    st.write(f"**Field:** {plan['field']}")
                    st.write(f"**Plant Date:** {plan['plant_date']}")
                    st.write(f"**Harvest Date:** {plan['harvest_date']}")
                    st.write(f"**Area:** {plan['area_planned']} acres")
                    st.write(f"**Status:** {plan['status']}")
                    
                    # Update status
                    new_status = st.selectbox(
                        "Update Status", 
                        ["Planned", "Planted", "Growing", "Harvested"],
                        index=["Planned", "Planted", "Growing", "Harvested"].index(plan['status']),
                        key=f"status_{plan['id']}"
                    )
                    
                    if st.button(f"Update Status", key=f"update_{plan['id']}"):
                        plan['status'] = new_status
                        save_data('farm_plans', st.session_state.farm_plans)
                        st.success("Status updated!")
                        st.rerun()
        else:
            st.info("No crop plans created yet.")

def show_seasonal_calendar():
    """Seasonal Calendar Interface"""
    st.header("Seasonal Calendar")
    
    if not st.session_state.farm_plans:
        st.warning("No crop plans available. Create plans in the Crop Planning tab.")
        return
    
    # Generate calendar view
    current_year = datetime.now().year
    
    st.subheader(f"Farming Calendar - {current_year}")
    
    # Create monthly view
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    
    selected_month = st.selectbox("Select Month", months, index=datetime.now().month - 1)
    month_num = months.index(selected_month) + 1
    
    st.subheader(f"Activities for {selected_month} {current_year}")
    
    # Filter plans for selected month
    month_activities = []
    for plan in st.session_state.farm_plans:
        plant_date = datetime.fromisoformat(plan['plant_date'])
        harvest_date = datetime.fromisoformat(plan['harvest_date'])
        
        if plant_date.month == month_num:
            month_activities.append({
                'date': plant_date.day,
                'activity': f"Plant {plan['crop_type']} in {plan['field']}",
                'type': 'Planting'
            })
        
        if harvest_date.month == month_num:
            month_activities.append({
                'date': harvest_date.day,
                'activity': f"Harvest {plan['crop_type']} from {plan['field']}",
                'type': 'Harvesting'
            })
    
    if month_activities:
        # Sort by date
        month_activities.sort(key=lambda x: x['date'])
        
        for activity in month_activities:
            if activity['type'] == 'Planting':
                st.success(f"📅 {selected_month} {activity['date']}: {activity['activity']}")
            else:
                st.info(f"📅 {selected_month} {activity['date']}: {activity['activity']}")
    else:
        st.info(f"No scheduled activities for {selected_month}")

def show_planning_reports():
    """Planning Reports Interface"""
    st.header("Planning Reports")
    
    if not st.session_state.farm_plans or not st.session_state.fields:
        st.warning("No data available for reports. Please add fields and create crop plans.")
        return
    
    # Summary metrics
    col1, col2, col3, col4 = st.columns(4)
    
    total_fields = len(st.session_state.fields)
    total_plans = len(st.session_state.farm_plans)
    total_area = sum([f['size'] for f in st.session_state.fields])
    planned_area = sum([p['area_planned'] for p in st.session_state.farm_plans])
    
    with col1:
        st.metric("Total Fields", total_fields)
    with col2:
        st.metric("Active Plans", total_plans)
    with col3:
        st.metric("Total Farm Area", f"{total_area:.1f} acres")
    with col4:
        st.metric("Planned Area", f"{planned_area:.1f} acres")
    
    # Detailed reports
    st.subheader("Field Utilization")
    if st.session_state.fields:
        field_df = pd.DataFrame(st.session_state.fields)
        st.dataframe(field_df, use_container_width=True)
    
    st.subheader("Crop Plan Summary")
    if st.session_state.farm_plans:
        plans_df = pd.DataFrame(st.session_state.farm_plans)
        st.dataframe(plans_df, use_container_width=True)
        
        # Crop type distribution
        crop_counts = plans_df['crop_type'].value_counts()
        st.subheader("Crop Distribution")
        st.bar_chart(crop_counts)
