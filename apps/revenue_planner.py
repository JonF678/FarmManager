import streamlit as st
import pandas as pd
from datetime import datetime, date
from utils.database import save_data, load_data
from utils.common import validate_input

def show():
    """Crop Revenue Planner Application"""
    st.title("💰 Crop Revenue Planner")
    st.markdown("Plan crop revenue, analyze profitability, and make data-driven financial decisions")
    
    # Initialize session state for revenue planner
    if 'revenue_plans' not in st.session_state:
        st.session_state.revenue_plans = load_data('revenue_plans', [])
    
    if 'crop_prices' not in st.session_state:
        st.session_state.crop_prices = load_data('crop_prices', [])
    
    if 'profit_analysis' not in st.session_state:
        st.session_state.profit_analysis = load_data('profit_analysis', [])
    
    # Tab navigation within the app
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["Revenue Planning", "Crop Prices", "Cost Analysis", "Profitability", "Financial Reports"])
    
    with tab1:
        show_revenue_planning()
    
    with tab2:
        show_crop_prices()
    
    with tab3:
        show_cost_analysis()
    
    with tab4:
        show_profitability_analysis()
    
    with tab5:
        show_financial_reports()

def show_revenue_planning():
    """Revenue Planning Interface"""
    st.header("Revenue Planning")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Create Revenue Plan")
        with st.form("add_revenue_plan"):
            plan_name = st.text_input("Plan Name")
            crop_type = st.selectbox("Crop Type", [
                "Corn", "Wheat", "Soybeans", "Rice", "Barley", "Oats", "Cotton", 
                "Potatoes", "Tomatoes", "Carrots", "Onions", "Lettuce", "Apples", "Strawberries"
            ])
            planned_area = st.number_input("Planned Area (acres)", min_value=0.1, step=0.1)
            expected_yield = st.number_input("Expected Yield (per acre)", min_value=0.0, step=0.1)
            yield_unit = st.selectbox("Yield Unit", ["bushels", "tons", "pounds", "boxes", "bags"])
            expected_price = st.number_input(f"Expected Price ($ per {yield_unit})", min_value=0.0, step=0.01)
            planning_year = st.number_input("Planning Year", min_value=2020, max_value=2030, value=datetime.now().year)
            notes = st.text_area("Notes")
            
            submitted = st.form_submit_button("Create Plan")
            
            if submitted and validate_input([plan_name]):
                total_yield = planned_area * expected_yield
                total_revenue = total_yield * expected_price
                
                new_plan = {
                    'id': len(st.session_state.revenue_plans) + 1,
                    'name': plan_name,
                    'crop_type': crop_type,
                    'planned_area': planned_area,
                    'expected_yield_per_acre': expected_yield,
                    'yield_unit': yield_unit,
                    'expected_price': expected_price,
                    'total_expected_yield': total_yield,
                    'total_expected_revenue': total_revenue,
                    'planning_year': planning_year,
                    'notes': notes,
                    'status': 'Planned',
                    'created_date': datetime.now().isoformat()
                }
                st.session_state.revenue_plans.append(new_plan)
                save_data('revenue_plans', st.session_state.revenue_plans)
                st.success(f"Revenue plan '{plan_name}' created successfully!")
                st.success(f"Expected total revenue: ${total_revenue:.2f}")
                st.rerun()
    
    with col2:
        st.subheader("Revenue Plan Summary")
        if st.session_state.revenue_plans:
            total_planned_revenue = sum([plan['total_expected_revenue'] for plan in st.session_state.revenue_plans])
            total_planned_area = sum([plan['planned_area'] for plan in st.session_state.revenue_plans])
            
            st.metric("Total Planned Revenue", f"${total_planned_revenue:,.2f}")
            st.metric("Total Planned Area", f"{total_planned_area:.1f} acres")
            st.metric("Active Plans", len(st.session_state.revenue_plans))
            
            # Revenue by crop type
            crop_revenue = {}
            for plan in st.session_state.revenue_plans:
                if plan['crop_type'] not in crop_revenue:
                    crop_revenue[plan['crop_type']] = 0
                crop_revenue[plan['crop_type']] += plan['total_expected_revenue']
            
            st.subheader("Revenue by Crop Type")
            for crop, revenue in sorted(crop_revenue.items(), key=lambda x: x[1], reverse=True):
                st.write(f"**{crop}:** ${revenue:,.2f}")
        else:
            st.info("No revenue plans created yet.")
    
    # Existing plans
    st.subheader("Current Revenue Plans")
    if st.session_state.revenue_plans:
        for plan in st.session_state.revenue_plans:
            with st.expander(f"{plan['name']} - {plan['crop_type']} (${plan['total_expected_revenue']:,.2f})"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Crop:** {plan['crop_type']}")
                    st.write(f"**Area:** {plan['planned_area']} acres")
                    st.write(f"**Expected Yield:** {plan['expected_yield_per_acre']} {plan['yield_unit']}/acre")
                    st.write(f"**Price:** ${plan['expected_price']:.2f} per {plan['yield_unit']}")
                
                with col2:
                    st.write(f"**Total Yield:** {plan['total_expected_yield']} {plan['yield_unit']}")
                    st.write(f"**Total Revenue:** ${plan['total_expected_revenue']:,.2f}")
                    st.write(f"**Planning Year:** {plan['planning_year']}")
                    st.write(f"**Status:** {plan['status']}")
                
                if plan['notes']:
                    st.write(f"**Notes:** {plan['notes']}")
                
                # Update status
                new_status = st.selectbox(
                    "Update Status",
                    ["Planned", "In Progress", "Completed", "Cancelled"],
                    index=["Planned", "In Progress", "Completed", "Cancelled"].index(plan['status']),
                    key=f"revenue_status_{plan['id']}"
                )
                
                if st.button(f"Update Status", key=f"update_revenue_{plan['id']}"):
                    plan['status'] = new_status
                    save_data('revenue_plans', st.session_state.revenue_plans)
                    st.success("Status updated!")
                    st.rerun()

def show_crop_prices():
    """Crop Prices Interface"""
    st.header("Crop Price Management")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Add/Update Crop Price")
        with st.form("add_crop_price"):
            crop_name = st.selectbox("Crop", [
                "Corn", "Wheat", "Soybeans", "Rice", "Barley", "Oats", "Cotton", 
                "Potatoes", "Tomatoes", "Carrots", "Onions", "Lettuce", "Apples", "Strawberries"
            ])
            price_date = st.date_input("Price Date", value=date.today())
            current_price = st.number_input("Current Price ($)", min_value=0.0, step=0.01)
            price_unit = st.selectbox("Unit", ["bushels", "tons", "pounds", "boxes", "bags"])
            market_source = st.text_input("Market/Source", placeholder="e.g., Local Market, USDA")
            notes = st.text_area("Price Notes")
            
            submitted = st.form_submit_button("Add/Update Price")
            
            if submitted and current_price > 0:
                new_price = {
                    'id': len(st.session_state.crop_prices) + 1,
                    'crop': crop_name,
                    'price_date': price_date.isoformat(),
                    'price': current_price,
                    'unit': price_unit,
                    'market_source': market_source,
                    'notes': notes,
                    'recorded_date': datetime.now().isoformat()
                }
                st.session_state.crop_prices.append(new_price)
                save_data('crop_prices', st.session_state.crop_prices)
                st.success(f"Price for {crop_name} added: ${current_price:.2f} per {price_unit}")
                st.rerun()
    
    with col2:
        st.subheader("Current Market Prices")
        if st.session_state.crop_prices:
            # Get latest price for each crop
            latest_prices = {}
            for price in st.session_state.crop_prices:
                crop = price['crop']
                if crop not in latest_prices or price['price_date'] > latest_prices[crop]['price_date']:
                    latest_prices[crop] = price
            
            for crop, price_info in latest_prices.items():
                st.write(f"**{crop}:** ${price_info['price']:.2f} per {price_info['unit']}")
                st.caption(f"Updated: {price_info['price_date']}")
        else:
            st.info("No crop prices recorded yet.")
    
    # Price history
    st.subheader("Price History")
    if st.session_state.crop_prices:
        selected_crop = st.selectbox("Select Crop for History", 
                                   list(set([p['crop'] for p in st.session_state.crop_prices])))
        
        if selected_crop:
            crop_prices = [p for p in st.session_state.crop_prices if p['crop'] == selected_crop]
            crop_prices.sort(key=lambda x: x['price_date'], reverse=True)
            
            if crop_prices:
                df = pd.DataFrame(crop_prices)
                st.dataframe(df[['price_date', 'price', 'unit', 'market_source']], use_container_width=True)
                
                # Price trend chart
                if len(crop_prices) > 1:
                    chart_df = df[['price_date', 'price']].copy()
                    chart_df['price_date'] = pd.to_datetime(chart_df['price_date'])
                    chart_df = chart_df.sort_values('price_date')
                    st.line_chart(chart_df.set_index('price_date'))

def show_cost_analysis():
    """Cost Analysis Interface"""
    st.header("Cost Analysis")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Add Production Costs")
        with st.form("add_costs"):
            crop_for_costs = st.selectbox("Crop", [
                "Corn", "Wheat", "Soybeans", "Rice", "Barley", "Oats", "Cotton", 
                "Potatoes", "Tomatoes", "Carrots", "Onions", "Lettuce", "Apples", "Strawberries"
            ])
            area_for_costs = st.number_input("Area (acres)", min_value=0.1, step=0.1)
            
            # Cost categories
            seed_cost = st.number_input("Seed Costs ($)", min_value=0.0, step=1.0)
            fertilizer_cost = st.number_input("Fertilizer Costs ($)", min_value=0.0, step=1.0)
            pesticide_cost = st.number_input("Pesticide Costs ($)", min_value=0.0, step=1.0)
            fuel_cost = st.number_input("Fuel Costs ($)", min_value=0.0, step=1.0)
            labor_cost = st.number_input("Labor Costs ($)", min_value=0.0, step=1.0)
            equipment_cost = st.number_input("Equipment/Rental Costs ($)", min_value=0.0, step=1.0)
            other_cost = st.number_input("Other Costs ($)", min_value=0.0, step=1.0)
            
            cost_year = st.number_input("Cost Year", min_value=2020, max_value=2030, value=datetime.now().year)
            
            submitted = st.form_submit_button("Add Cost Analysis")
            
            if submitted and area_for_costs > 0:
                total_cost = seed_cost + fertilizer_cost + pesticide_cost + fuel_cost + labor_cost + equipment_cost + other_cost
                cost_per_acre = total_cost / area_for_costs
                
                new_cost_analysis = {
                    'id': len(st.session_state.profit_analysis) + 1,
                    'crop': crop_for_costs,
                    'area': area_for_costs,
                    'seed_cost': seed_cost,
                    'fertilizer_cost': fertilizer_cost,
                    'pesticide_cost': pesticide_cost,
                    'fuel_cost': fuel_cost,
                    'labor_cost': labor_cost,
                    'equipment_cost': equipment_cost,
                    'other_cost': other_cost,
                    'total_cost': total_cost,
                    'cost_per_acre': cost_per_acre,
                    'year': cost_year,
                    'created_date': datetime.now().isoformat()
                }
                st.session_state.profit_analysis.append(new_cost_analysis)
                save_data('profit_analysis', st.session_state.profit_analysis)
                st.success(f"Cost analysis added: ${total_cost:.2f} total (${cost_per_acre:.2f}/acre)")
                st.rerun()
    
    with col2:
        st.subheader("Cost Summary")
        if st.session_state.profit_analysis:
            total_costs = sum([analysis['total_cost'] for analysis in st.session_state.profit_analysis])
            total_area_analyzed = sum([analysis['area'] for analysis in st.session_state.profit_analysis])
            avg_cost_per_acre = total_costs / total_area_analyzed if total_area_analyzed > 0 else 0
            
            st.metric("Total Costs Analyzed", f"${total_costs:,.2f}")
            st.metric("Average Cost/Acre", f"${avg_cost_per_acre:.2f}")
            
            # Cost breakdown by category
            st.subheader("Cost Breakdown")
            total_by_category = {
                'Seeds': sum([a['seed_cost'] for a in st.session_state.profit_analysis]),
                'Fertilizers': sum([a['fertilizer_cost'] for a in st.session_state.profit_analysis]),
                'Pesticides': sum([a['pesticide_cost'] for a in st.session_state.profit_analysis]),
                'Fuel': sum([a['fuel_cost'] for a in st.session_state.profit_analysis]),
                'Labor': sum([a['labor_cost'] for a in st.session_state.profit_analysis]),
                'Equipment': sum([a['equipment_cost'] for a in st.session_state.profit_analysis]),
                'Other': sum([a['other_cost'] for a in st.session_state.profit_analysis])
            }
            
            for category, cost in total_by_category.items():
                percentage = (cost / total_costs * 100) if total_costs > 0 else 0
                st.write(f"**{category}:** ${cost:,.2f} ({percentage:.1f}%)")
        else:
            st.info("No cost analysis data available.")

def show_profitability_analysis():
    """Profitability Analysis Interface"""
    st.header("Profitability Analysis")
    
    if not st.session_state.revenue_plans or not st.session_state.profit_analysis:
        st.warning("Please create revenue plans and cost analyses to view profitability.")
        return
    
    # Profitability calculation
    st.subheader("Crop Profitability Comparison")
    
    profitability_data = []
    
    for revenue_plan in st.session_state.revenue_plans:
        # Find matching cost analysis
        matching_costs = [
            cost for cost in st.session_state.profit_analysis
            if cost['crop'] == revenue_plan['crop_type']
        ]
        
        if matching_costs:
            # Use the most recent cost analysis
            cost_analysis = max(matching_costs, key=lambda x: x['created_date'])
            
            # Calculate profitability
            revenue_per_acre = revenue_plan['total_expected_revenue'] / revenue_plan['planned_area']
            cost_per_acre = cost_analysis['cost_per_acre']
            profit_per_acre = revenue_per_acre - cost_per_acre
            profit_margin = (profit_per_acre / revenue_per_acre * 100) if revenue_per_acre > 0 else 0
            total_profit = profit_per_acre * revenue_plan['planned_area']
            
            profitability_data.append({
                'crop': revenue_plan['crop_type'],
                'area': revenue_plan['planned_area'],
                'revenue_per_acre': revenue_per_acre,
                'cost_per_acre': cost_per_acre,
                'profit_per_acre': profit_per_acre,
                'profit_margin': profit_margin,
                'total_profit': total_profit,
                'plan_name': revenue_plan['name']
            })
    
    if profitability_data:
        # Sort by profit per acre
        profitability_data.sort(key=lambda x: x['profit_per_acre'], reverse=True)
        
        # Display profitability table
        df = pd.DataFrame(profitability_data)
        st.dataframe(df[[
            'crop', 'area', 'revenue_per_acre', 'cost_per_acre', 
            'profit_per_acre', 'profit_margin', 'total_profit'
        ]].round(2), use_container_width=True)
        
        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_revenue = sum([p['revenue_per_acre'] * p['area'] for p in profitability_data])
            st.metric("Total Expected Revenue", f"${total_revenue:,.2f}")
        
        with col2:
            total_costs = sum([p['cost_per_acre'] * p['area'] for p in profitability_data])
            st.metric("Total Costs", f"${total_costs:,.2f}")
        
        with col3:
            total_profit = sum([p['total_profit'] for p in profitability_data])
            st.metric("Total Expected Profit", f"${total_profit:,.2f}")
        
        with col4:
            overall_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
            st.metric("Overall Profit Margin", f"{overall_margin:.1f}%")
        
        # Profit visualization
        st.subheader("Profit by Crop")
        chart_df = df[['crop', 'profit_per_acre']].copy()
        st.bar_chart(chart_df.set_index('crop'))
        
        # Most and least profitable crops
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Most Profitable")
            most_profitable = profitability_data[0]
            st.success(f"**{most_profitable['crop']}**")
            st.write(f"Profit per acre: ${most_profitable['profit_per_acre']:.2f}")
            st.write(f"Profit margin: {most_profitable['profit_margin']:.1f}%")
        
        with col2:
            st.subheader("Needs Attention")
            least_profitable = profitability_data[-1]
            if least_profitable['profit_per_acre'] < 0:
                st.error(f"**{least_profitable['crop']}** (Loss)")
            else:
                st.warning(f"**{least_profitable['crop']}** (Low Profit)")
            st.write(f"Profit per acre: ${least_profitable['profit_per_acre']:.2f}")
            st.write(f"Profit margin: {least_profitable['profit_margin']:.1f}%")
        
    else:
        st.info("No matching revenue plans and cost analyses found. Make sure you have both for the same crops.")

def show_financial_reports():
    """Financial Reports Interface"""
    st.header("Financial Reports")
    
    if not any([st.session_state.revenue_plans, st.session_state.profit_analysis, st.session_state.crop_prices]):
        st.warning("No financial data available for reports.")
        return
    
    # Report selector
    report_type = st.selectbox("Select Report Type", [
        "Revenue Summary", "Cost Analysis Report", "Profitability Report", "Price Trend Report"
    ])
    
    if report_type == "Revenue Summary":
        st.subheader("Revenue Summary Report")
        
        if st.session_state.revenue_plans:
            # Filter by year
            available_years = list(set([plan['planning_year'] for plan in st.session_state.revenue_plans]))
            selected_year = st.selectbox("Select Year", sorted(available_years))
            
            year_plans = [plan for plan in st.session_state.revenue_plans if plan['planning_year'] == selected_year]
            
            if year_plans:
                st.write(f"### Revenue Plans for {selected_year}")
                
                total_revenue = sum([plan['total_expected_revenue'] for plan in year_plans])
                total_area = sum([plan['planned_area'] for plan in year_plans])
                
                st.metric("Total Expected Revenue", f"${total_revenue:,.2f}")
                st.metric("Total Planned Area", f"{total_area:.1f} acres")
                
                # Detailed breakdown
                revenue_df = pd.DataFrame(year_plans)
                st.dataframe(revenue_df[[
                    'name', 'crop_type', 'planned_area', 'expected_yield_per_acre', 
                    'expected_price', 'total_expected_revenue'
                ]], use_container_width=True)
        else:
            st.info("No revenue plans available.")
    
    elif report_type == "Cost Analysis Report":
        st.subheader("Cost Analysis Report")
        
        if st.session_state.profit_analysis:
            # Filter by year
            available_years = list(set([analysis['year'] for analysis in st.session_state.profit_analysis]))
            selected_year = st.selectbox("Select Year", sorted(available_years))
            
            year_costs = [analysis for analysis in st.session_state.profit_analysis if analysis['year'] == selected_year]
            
            if year_costs:
                st.write(f"### Cost Analysis for {selected_year}")
                
                total_cost = sum([analysis['total_cost'] for analysis in year_costs])
                total_area = sum([analysis['area'] for analysis in year_costs])
                avg_cost_per_acre = total_cost / total_area if total_area > 0 else 0
                
                st.metric("Total Costs", f"${total_cost:,.2f}")
                st.metric("Average Cost per Acre", f"${avg_cost_per_acre:.2f}")
                
                # Cost breakdown chart
                cost_categories = ['seed_cost', 'fertilizer_cost', 'pesticide_cost', 
                                 'fuel_cost', 'labor_cost', 'equipment_cost', 'other_cost']
                
                category_totals = {}
                for category in cost_categories:
                    total = sum([analysis[category] for analysis in year_costs])
                    category_name = category.replace('_cost', '').title()
                    category_totals[category_name] = total
                
                chart_df = pd.DataFrame(list(category_totals.items()), columns=['Category', 'Cost'])
                st.bar_chart(chart_df.set_index('Category'))
                
                # Detailed breakdown
                costs_df = pd.DataFrame(year_costs)
                st.dataframe(costs_df[[
                    'crop', 'area', 'total_cost', 'cost_per_acre'
                ]], use_container_width=True)
        else:
            st.info("No cost analysis data available.")
    
    elif report_type == "Profitability Report":
        show_profitability_analysis()  # Reuse the profitability analysis
    
    elif report_type == "Price Trend Report":
        st.subheader("Price Trend Report")
        
        if st.session_state.crop_prices:
            # Select crop for trend analysis
            available_crops = list(set([price['crop'] for price in st.session_state.crop_prices]))
            selected_crop = st.selectbox("Select Crop", available_crops)
            
            crop_prices = [p for p in st.session_state.crop_prices if p['crop'] == selected_crop]
            crop_prices.sort(key=lambda x: x['price_date'])
            
            if len(crop_prices) > 1:
                st.write(f"### Price Trend for {selected_crop}")
                
                # Create trend chart
                df = pd.DataFrame(crop_prices)
                df['price_date'] = pd.to_datetime(df['price_date'])
                
                st.line_chart(df.set_index('price_date')['price'])
                
                # Price statistics
                prices = [p['price'] for p in crop_prices]
                st.write(f"**Current Price:** ${prices[-1]:.2f}")
                st.write(f"**Highest Price:** ${max(prices):.2f}")
                st.write(f"**Lowest Price:** ${min(prices):.2f}")
                st.write(f"**Average Price:** ${sum(prices)/len(prices):.2f}")
                
                # Price change
                if len(prices) > 1:
                    price_change = prices[-1] - prices[-2]
                    change_percent = (price_change / prices[-2] * 100) if prices[-2] > 0 else 0
                    
                    if price_change > 0:
                        st.success(f"**Recent Change:** +${price_change:.2f} ({change_percent:+.1f}%)")
                    elif price_change < 0:
                        st.error(f"**Recent Change:** ${price_change:.2f} ({change_percent:+.1f}%)")
                    else:
                        st.info("**Recent Change:** No change")
            else:
                st.info(f"Not enough price data for {selected_crop} to show trends.")
        else:
            st.info("No price data available for trend analysis.")
