from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import ActivityItem, AnalyticsSummary, KPIResponse, RevenuePoint, StatusBreakdownPoint, TopProductPoint

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    orders = db.query(Order).all()
    users = db.query(User).count()
    products = db.query(Product).count()
    revenue = round(sum(order.total_amount for order in orders), 2)

    kpis = KPIResponse(revenue=revenue, orders=len(orders), users=users, products=products)

    cutoff = datetime.utcnow() - timedelta(days=13)
    buckets = defaultdict(float)
    for order in orders:
        if order.created_at >= cutoff:
            buckets[order.created_at.date().isoformat()] += order.total_amount
    revenue_series = [
        RevenuePoint(date=(cutoff + timedelta(days=i)).date().isoformat(), revenue=round(buckets[(cutoff + timedelta(days=i)).date().isoformat()], 2))
        for i in range(14)
    ]

    status_counts = defaultdict(int)
    for order in orders:
        status_counts[order.status.value] += 1
    status_breakdown = [
        StatusBreakdownPoint(status=status, count=count)
        for status, count in sorted(status_counts.items(), key=lambda item: item[0])
    ]

    product_totals = defaultdict(lambda: {"units": 0, "revenue": 0.0})
    items = db.query(OrderItem).join(Product).all()
    for item in items:
        product_totals[item.product.name]["units"] += item.quantity
        product_totals[item.product.name]["revenue"] += item.quantity * item.unit_price
    top_products = sorted(
        [
            TopProductPoint(product_name=name, sold_units=stats["units"], revenue=round(stats["revenue"], 2))
            for name, stats in product_totals.items()
        ],
        key=lambda row: row.sold_units,
        reverse=True,
    )[:5]

    recent = sorted(orders, key=lambda o: o.created_at, reverse=True)[:6]
    recent_activity = [
        ActivityItem(
            id=f"order-{order.id}",
            type="order",
            message=f"Order {order.order_number} moved to {order.status.value}",
            created_at=order.created_at.isoformat(),
        )
        for order in recent
    ]

    return AnalyticsSummary(
        kpis=kpis,
        revenue_series=revenue_series,
        status_breakdown=status_breakdown,
        top_products=top_products,
        recent_activity=recent_activity,
    )
