import json
import os
from typing import Any, List, Dict

def get_data_file_path(data_type: str) -> str:
    """Get the file path for a specific data type"""
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    return os.path.join(data_dir, f"{data_type}.json")

def save_data(data_type: str, data: List[Dict[str, Any]]) -> bool:
    """Save data to JSON file"""
    try:
        file_path = get_data_file_path(data_type)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"Error saving data for {data_type}: {str(e)}")
        return False

def load_data(data_type: str, default_value: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Load data from JSON file"""
    if default_value is None:
        default_value = []
    
    try:
        file_path = get_data_file_path(data_type)
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        return default_value
    except Exception as e:
        print(f"Error loading data for {data_type}: {str(e)}")
        return default_value

def delete_data(data_type: str) -> bool:
    """Delete data file"""
    try:
        file_path = get_data_file_path(data_type)
        if os.path.exists(file_path):
            os.remove(file_path)
        return True
    except Exception as e:
        print(f"Error deleting data for {data_type}: {str(e)}")
        return False

def backup_data() -> bool:
    """Create backup of all data files"""
    try:
        import shutil
        from datetime import datetime
        
        data_dir = "data"
        if not os.path.exists(data_dir):
            return True
        
        backup_dir = f"data_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copytree(data_dir, backup_dir)
        return True
    except Exception as e:
        print(f"Error creating backup: {str(e)}")
        return False

def get_data_summary() -> Dict[str, int]:
    """Get summary of all stored data"""
    summary = {}
    data_types = [
        'farm_plans', 'fields', 'expenses', 'equipment', 'tasks', 'operations',
        'revenue_plans', 'crop_prices', 'profit_analysis'
    ]
    
    for data_type in data_types:
        data = load_data(data_type, [])
        summary[data_type] = len(data)
    
    return summary
