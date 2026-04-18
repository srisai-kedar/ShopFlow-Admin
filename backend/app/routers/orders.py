import random
import string
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_current_user, get_db, require_admin
from app.models import Order, OrderItem, OrderStatus, Product, User
from app.schemas import OrderCreate, OrderListResponse, OrderRead, OrderStatusUpdate, PaginationMeta

router = APIRouter(prefix="/orders", tags=["Orders"])


def _order_number() -> str:
    return "SF-" + "".join(random.choices(string.digits, k=6))


@router.get("", response_model=OrderListResponse)
def list_orders(
    search: str | None = Query(default=None),
    status_filter: OrderStatus | None = Query(default=None, alias="status"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user),
    )
    if search:
        query = query.filter(Order.order_number.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if start_date:
        try:
            query = query.filter(Order.created_at >= datetime.fromisoformat(start_date))
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Invalid start_date format, use YYYY-MM-DD") from exc
    if end_date:
        try:
            query = query.filter(Order.created_at <= datetime.fromisoformat(end_date))
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Invalid end_date format, use YYYY-MM-DD") from exc
    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    rows = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return OrderListResponse(
        items=rows,
        meta=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    order = Order(
        user_id=payload.user_id,
        status=payload.status,
        order_number=_order_number(),
        total_amount=0,
    )
    db.add(order)
    db.flush()

    total = 0.0
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        line_total = product.price * item.quantity
        total += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )

    order.total_amount = round(total, 2)
    db.commit()
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.user))
        .filter(Order.id == order.id)
        .first()
    )


@router.put("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.user))
        .filter(Order.id == order.id)
        .first()
    )
