# Unified Farm Management Platform

## Overview

This is a comprehensive farm management platform built with Streamlit that provides farmers with three integrated applications for managing their agricultural operations. The platform includes a Farm Planner for crop and field planning, a Management Tracker for operational oversight, and a Revenue Planner for financial analysis. The system is designed as an offline-first solution that stores data locally using JSON files, making it accessible even in areas with limited internet connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit web application framework
- **Layout Pattern**: Multi-page application with tabbed navigation within each sub-application
- **State Management**: Streamlit session state for maintaining data across user interactions
- **UI Components**: Responsive column layouts, forms, and interactive widgets

### Application Structure
- **Modular Design**: Three separate applications (farm_planner, management_tracker, revenue_planner) organized as independent modules
- **Unified Entry Point**: Main dashboard (app.py) serves as the application launcher and navigation hub
- **Tab-based Navigation**: Each sub-application uses tabs to organize different functional areas

### Data Storage Architecture
- **Storage Method**: Local JSON file-based persistence in a `data/` directory
- **Data Organization**: Separate JSON files for different data types (farm_plans, expenses, equipment, etc.)
- **Offline-First Design**: No external database dependencies, ensuring functionality without internet connectivity
- **Session State Integration**: Data loaded into Streamlit session state for real-time manipulation

### Backend Architecture
- **Utility Layer**: Common functions for input validation, formatting, and user messaging
- **Database Layer**: JSON file operations abstracted through utility functions
- **No Server Dependencies**: Pure Python application without external server requirements

### Key Design Patterns
- **Separation of Concerns**: Clear separation between UI logic, data persistence, and business logic
- **Reusable Components**: Common utility functions for validation, formatting, and user feedback
- **Error Handling**: Graceful degradation with fallback to default values when data loading fails

## External Dependencies

### Core Framework
- **Streamlit**: Web application framework for the entire user interface
- **Pandas**: Data manipulation and analysis for handling farm data structures

### Standard Library Dependencies
- **json**: Data serialization for local file storage
- **os**: File system operations for data directory management
- **datetime**: Date and time handling for scheduling and tracking features
- **typing**: Type hints for better code maintainability

### File System Requirements
- **Local Storage**: Requires write permissions to create and manage `data/` directory
- **JSON Files**: Individual files for each data type (farm_plans.json, expenses.json, etc.)

### No External Services
- **Offline Operation**: No internet connectivity required for core functionality
- **No Database Server**: No PostgreSQL, MySQL, or other database server dependencies
- **No API Integrations**: Self-contained system without external API calls
- **No Authentication Service**: Simple local application without user management systems