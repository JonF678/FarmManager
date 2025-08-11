import streamlit as st
from apps import farm_planner, management_tracker, revenue_planner

# Page configuration
st.set_page_config(
    page_title="Unified Farm Management Platform",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'current_app' not in st.session_state:
    st.session_state.current_app = 'dashboard'

def show_dashboard():
    """Main dashboard with app selection"""
    st.title("🌾 Unified Farm Management Platform")
    st.markdown("---")
    
    st.markdown("""
    Welcome to your comprehensive farm management solution. Choose an application below to get started:
    """)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("### 📋 Farm Planner")
        st.markdown("""
        Plan your crops, field layouts, and seasonal activities. 
        Design optimal farm layouts and manage planting schedules.
        """)
        if st.button("Open Farm Planner", key="farm_planner", use_container_width=True):
            st.session_state.current_app = 'farm_planner'
            st.rerun()
    
    with col2:
        st.markdown("### 📊 Management Tracker")
        st.markdown("""
        Track farm operations, expenses, equipment maintenance, 
        and daily tasks. Monitor your farm's operational efficiency.
        """)
        if st.button("Open Management Tracker", key="management_tracker", use_container_width=True):
            st.session_state.current_app = 'management_tracker'
            st.rerun()
    
    with col3:
        st.markdown("### 💰 Revenue Planner")
        st.markdown("""
        Plan crop revenue, analyze profitability, and make 
        data-driven financial decisions for your farm.
        """)
        if st.button("Open Revenue Planner", key="revenue_planner", use_container_width=True):
            st.session_state.current_app = 'revenue_planner'
            st.rerun()
    
    st.markdown("---")
    st.markdown("### Quick Stats")
    
    # Display some quick overview stats
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Active Plans", "3", "1")
    
    with col2:
        st.metric("Tracked Activities", "25", "5")
    
    with col3:
        st.metric("Revenue Projects", "2", "0")
    
    with col4:
        st.metric("Total Farm Area", "150 acres", "0")

def main():
    """Main application controller"""
    
    # Sidebar navigation
    with st.sidebar:
        st.title("Navigation")
        
        if st.button("🏠 Dashboard", use_container_width=True):
            st.session_state.current_app = 'dashboard'
            st.rerun()
        
        st.markdown("---")
        st.markdown("### Applications")
        
        if st.button("📋 Farm Planner", use_container_width=True):
            st.session_state.current_app = 'farm_planner'
            st.rerun()
        
        if st.button("📊 Management Tracker", use_container_width=True):
            st.session_state.current_app = 'management_tracker'
            st.rerun()
        
        if st.button("💰 Revenue Planner", use_container_width=True):
            st.session_state.current_app = 'revenue_planner'
            st.rerun()
        
        st.markdown("---")
        st.markdown("### Current App")
        st.info(f"**{st.session_state.current_app.replace('_', ' ').title()}**")
    
    # Route to appropriate app
    if st.session_state.current_app == 'dashboard':
        show_dashboard()
    elif st.session_state.current_app == 'farm_planner':
        farm_planner.show()
    elif st.session_state.current_app == 'management_tracker':
        management_tracker.show()
    elif st.session_state.current_app == 'revenue_planner':
        revenue_planner.show()

if __name__ == "__main__":
    main()
