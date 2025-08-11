import streamlit as st
from typing import List, Any, Dict
from datetime import datetime, date

def validate_input(inputs: List[str], min_length: int = 1) -> bool:
    """Validate that all inputs are not empty and meet minimum length"""
    for input_value in inputs:
        if not input_value or len(str(input_value).strip()) < min_length:
            return False
    return True

def format_currency(amount: float) -> str:
    """Format number as currency"""
    return f"${amount:,.2f}"

def format_date(date_str: str) -> str:
    """Format ISO date string for display"""
    try:
        date_obj = datetime.fromisoformat(date_str)
        return date_obj.strftime("%m/%d/%Y")
    except:
        return date_str

def calculate_days_between(start_date: str, end_date: str) -> int:
    """Calculate days between two ISO date strings"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        return (end - start).days
    except:
        return 0

def show_success_message(message: str):
    """Show success message with consistent styling"""
    st.success(f"✅ {message}")

def show_error_message(message: str):
    """Show error message with consistent styling"""
    st.error(f"❌ {message}")

def show_info_message(message: str):
    """Show info message with consistent styling"""
    st.info(f"ℹ️ {message}")

def show_warning_message(message: str):
    """Show warning message with consistent styling"""
    st.warning(f"⚠️ {message}")

def create_download_button(data: Any, filename: str, label: str = "Download Data"):
    """Create a download button for data"""
    import json
    
    if isinstance(data, (list, dict)):
        json_data = json.dumps(data, indent=2, default=str)
        st.download_button(
            label=label,
            data=json_data,
            file_name=filename,
            mime="application/json"
        )
    else:
        st.download_button(
            label=label,
            data=str(data),
            file_name=filename,
            mime="text/plain"
        )

def filter_data_by_date_range(data: List[Dict], date_field: str, start_date: date, end_date: date) -> List[Dict]:
    """Filter data by date range"""
    filtered_data = []
    
    for item in data:
        try:
            item_date = datetime.fromisoformat(item[date_field]).date()
            if start_date <= item_date <= end_date:
                filtered_data.append(item)
        except (KeyError, ValueError):
            continue
    
    return filtered_data

def calculate_percentage(part: float, total: float) -> float:
    """Calculate percentage safely"""
    if total == 0:
        return 0
    return (part / total) * 100

def safe_divide(numerator: float, denominator: float, default: float = 0) -> float:
    """Safely divide two numbers"""
    if denominator == 0:
        return default
    return numerator / denominator

def get_season_from_date(date_str: str) -> str:
    """Get season from date string"""
    try:
        date_obj = datetime.fromisoformat(date_str)
        month = date_obj.month
        
        if month in [12, 1, 2]:
            return "Winter"
        elif month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        else:
            return "Fall"
    except:
        return "Unknown"

def calculate_growth_rate(old_value: float, new_value: float) -> float:
    """Calculate growth rate percentage"""
    if old_value == 0:
        return 0 if new_value == 0 else 100
    return ((new_value - old_value) / old_value) * 100

def generate_unique_id(existing_data: List[Dict], id_field: str = 'id') -> int:
    """Generate unique ID for new records"""
    if not existing_data:
        return 1
    
    existing_ids = [item.get(id_field, 0) for item in existing_data if isinstance(item.get(id_field), int)]
    return max(existing_ids) + 1 if existing_ids else 1

def validate_numeric_input(value: Any, min_value: float = None, max_value: float = None) -> bool:
    """Validate numeric input within range"""
    try:
        num_value = float(value)
        if min_value is not None and num_value < min_value:
            return False
        if max_value is not None and num_value > max_value:
            return False
        return True
    except (ValueError, TypeError):
        return False

def create_data_summary_card(title: str, value: Any, delta: Any = None, delta_color: str = "normal"):
    """Create a metric card with consistent styling"""
    if isinstance(value, (int, float)):
        if isinstance(value, float):
            display_value = f"{value:,.2f}"
        else:
            display_value = f"{value:,}"
    else:
        display_value = str(value)
    
    st.metric(title, display_value, delta=delta, delta_color=delta_color)
