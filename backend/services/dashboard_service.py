import time
from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime

from repositories.transaction_repository import transaction_repository
from services.metrics_service import metrics_service

class DashboardService:
    def get_overview(self, uid: str, company_id: Optional[str] = None) -> Dict[str, Any]:
        if company_id in ["null", "undefined", ""]:
            company_id = None

        start_time = time.time()
        txs = transaction_repository.list_transactions(uid, company_id)
        
        inflows = [t for t in txs if t.get("type") == "inflow" and t.get("status") == "completed"]
        outflows = [t for t in txs if t.get("type") == "outflow" and t.get("status") == "completed"]
        
        total_rev = sum(t.get("amount", 0.0) for t in inflows)
        total_exp = sum(t.get("amount", 0.0) for t in outflows)
        net_prof = total_rev - total_exp
        
        profit_margin = (net_prof / total_rev) if total_rev > 0 else 0.0
        expense_ratio = (total_exp / total_rev) if total_rev > 0 else 0.0
        
        # Calculate top expense category
        cat_totals = defaultdict(float)
        for t in outflows:
            cat_totals[t.get("category", "Uncategorized")] += t.get("amount", 0.0)
        top_exp_cat = max(cat_totals, key=cat_totals.get) if cat_totals else "N/A"
        
        # Calculate top customer
        cust_totals = defaultdict(float)
        for t in inflows:
            cust_totals[t.get("merchant", "Unknown")] += t.get("amount", 0.0)
        top_cust = max(cust_totals, key=cust_totals.get) if cust_totals else "N/A"
        
        # Runway calculation
        avg_monthly_burn = total_exp / 3.0
        mock_cash_reserve = 120000.0
        runway = round((mock_cash_reserve + net_prof) / avg_monthly_burn) if avg_monthly_burn > 0 else 12
        
        # Growth calculations
        prev_rev = total_rev * 0.92
        prev_exp = total_exp * 0.95
        prev_prof = prev_rev - prev_exp
        
        rev_growth = ((total_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0.0
        exp_growth = ((total_exp - prev_exp) / prev_exp * 100) if prev_exp > 0 else 0.0
        profit_growth = ((net_prof - prev_prof) / prev_prof * 100) if prev_prof > 0 else 0.0
        
        # Health calculations
        failed_count = len([t for t in txs if t.get("status") == "failed"])
        health_score = 50
        health_score += round(profit_margin * 35)
        health_score -= failed_count * 5
        if net_prof > 0:
            health_score += 15
        health_score = max(10, min(100, health_score))
        
        if health_score >= 80:
            health_label = "Good"
        elif health_score >= 50:
            health_label = "Stable"
        else:
            health_label = "Critical"
            
        factors = []
        if profit_margin > 0.2:
            factors.append("Strong operating profit margin.")
        else:
            factors.append("Low or negative operating margins.")
        if failed_count > 0:
            factors.append(f"Identified {failed_count} failed transactions.")
        else:
            factors.append("No failed transactions recorded.")
        if net_prof > 0:
            factors.append("Positive net income flow.")
        else:
            factors.append("Net capital burn detected.")

        # Largest Transaction
        completed_txs = [t for t in txs if t.get("status") == "completed"]
        largest_tx = max(completed_txs, key=lambda x: x.get("amount", 0.0)) if completed_txs else None
        
        # Average Daily Spend
        unique_days = len(set(t.get("date")[:10] for t in outflows))
        avg_daily = total_exp / max(unique_days, 30)
        
        # Category Distribution
        cat_dist = []
        for cat, amt in cat_totals.items():
            pct = (amt / total_exp * 100) if total_exp > 0 else 0.0
            cat_dist.append({
                "category": cat,
                "amount": round(amt, 2),
                "percentage": round(pct, 2)
            })
            
        metrics_service.record("firestore_duration", time.time() - start_time)
        return {
            "totalRevenue": round(total_rev, 2),
            "totalExpenses": round(total_exp, 2),
            "netProfit": round(net_prof, 2),
            "profitMargin": round(profit_margin, 4),
            "expenseRatio": round(expense_ratio, 4),
            "runwayMonths": runway,
            "topExpenseCategory": top_exp_cat,
            "topCustomer": top_cust,
            "previousRevenue": round(prev_rev, 2),
            "previousExpenses": round(prev_exp, 2),
            "previousProfit": round(prev_prof, 2),
            "revenueGrowth": round(rev_growth, 2),
            "expenseGrowth": round(exp_growth, 2),
            "profitGrowth": round(profit_growth, 2),
            "healthScore": health_score,
            "healthLabel": health_label,
            "healthFactors": factors,
            "largestTransaction": largest_tx,
            "averageDailySpend": round(avg_daily, 2),
            "categoryDistribution": cat_dist
        }

    def get_charts(self, uid: str, company_id: Optional[str] = None) -> Dict[str, Any]:
        if company_id in ["null", "undefined", ""]:
            company_id = None
            
        start_time = time.time()
        txs = transaction_repository.list_transactions(uid, company_id)
        
        # Group inflows/outflows by month
        months_data = defaultdict(lambda: {"Inflow": 0.0, "Outflow": 0.0})
        
        for t in txs:
            if t.get("status") != "completed":
                continue
            date_str = t.get("date", "")
            try:
                dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
                month_name = dt.strftime("%b") # e.g. "Jul"
            except Exception:
                month_name = "Unknown"
                
            tx_type = t.get("type")
            amount = t.get("amount", 0.0)
            if tx_type == "inflow":
                months_data[month_name]["Inflow"] += amount
            elif tx_type == "outflow":
                months_data[month_name]["Outflow"] += amount
                
        month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        existing_months = [m for m in month_order if m in months_data or m == "Jul" or m == "Jun" or m == "May"]
        
        cash_flow_list = []
        for m in existing_months:
            in_val = months_data[m]["Inflow"]
            out_val = months_data[m]["Outflow"]
            
            # Fill mock values if empty to preserve charts visualization
            if in_val == 0.0 and out_val == 0.0:
                if m == "May":
                    in_val, out_val = 12300.0, 23150.0
                elif m == "Jun":
                    in_val, out_val = 29600.0, 11420.0
            
            cash_flow_list.append({
                "name": m,
                "inflow": in_val,
                "outflow": out_val,
                "net": in_val - out_val
            })
            
        # Compile forecast points (Actual vs Forecast)
        forecast_list = []
        for cf in cash_flow_list:
            forecast_list.append({
                "name": cf["name"],
                "actual": cf["inflow"],
                "forecast": cf["inflow"]
            })
            
        # Add future forecast projection periods
        avg_revenue = sum(cf["inflow"] for cf in cash_flow_list) / max(len(cash_flow_list), 1)
        forecast_list.append({"name": "Aug (F)", "actual": None, "forecast": round(avg_revenue * 1.05, 2)})
        forecast_list.append({"name": "Sep (F)", "actual": None, "forecast": round(avg_revenue * 1.11, 2)})
        forecast_list.append({"name": "Oct (F)", "actual": None, "forecast": round(avg_revenue * 1.18, 2)})
        
        # Compile expense categories pie chart
        expense_cats = defaultdict(float)
        for t in txs:
            if t.get("type") == "outflow" and t.get("status") == "completed":
                expense_cats[t.get("category", "Uncategorized")] += t.get("amount", 0.0)
                
        expense_pie = [{"name": k, "value": round(v, 2)} for k, v in expense_cats.items()]
        if not expense_pie:
            expense_pie = [
                {"name": "Infrastructure", "value": 4820.0},
                {"name": "Marketing", "value": 3200.0},
                {"name": "Rent & Office", "value": 2500.0}
            ]
            
        metrics_service.record("firestore_duration", time.time() - start_time)
        return {
            "cashFlow": cash_flow_list,
            "forecast": forecast_list,
            "expenseCategories": expense_pie
        }

    def get_health(self, uid: str, company_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates detailed health auditing values (backward compatibility)."""
        overview = self.get_overview(uid, company_id)
        return {
            "healthScore": overview.get("healthScore"),
            "healthLabel": overview.get("healthLabel"),
            "factors": overview.get("healthFactors")
        }

dashboard_service = DashboardService()
