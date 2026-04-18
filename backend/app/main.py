import random
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import Category, Order, OrderItem, OrderStatus, Product, User, UserRole
from app.routers import analytics, auth, orders, products


def seed_data(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    admin = User(
        full_name="Demo Admin",
        email="admin@shopflow.dev",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.admin,
    )
    staff_users = [
        User(
            full_name="Maya Chen",
            email="maya@shopflow.dev",
            hashed_password=get_password_hash("staff123"),
            role=UserRole.staff,
        ),
        User(
            full_name="Noah Patel",
            email="noah@shopflow.dev",
            hashed_password=get_password_hash("staff123"),
            role=UserRole.staff,
        ),
        User(
            full_name="Ava Rivera",
            email="ava@shopflow.dev",
            hashed_password=get_password_hash("staff123"),
            role=UserRole.staff,
        ),
    ]
    db.add(admin)
    db.add_all(staff_users)
    db.flush()
    all_users = [admin, *staff_users]

    category_names = ["Apparel", "Accessories", "Footwear", "Home", "Electronics"]
    categories = [Category(name=name) for name in category_names]
    db.add_all(categories)
    db.flush()

    product_seed = [
        ("Aero Jacket", "Lightweight weather-ready jacket", 129.0, 44, "Apparel"),
        ("Lumen Backpack", "Minimal carry for everyday essentials", 89.0, 76, "Accessories"),
        ("Pulse Sneakers", "Responsive comfort running shoe", 149.0, 32, "Footwear"),
        ("Nook Lamp", "Soft ambient desk lighting", 64.0, 55, "Home"),
        ("Orbit Earbuds", "Noise-reduction wireless earbuds", 199.0, 24, "Electronics"),
        ("Drift Tee", "Premium cotton t-shirt", 39.0, 120, "Apparel"),
        ("Arc Bottle", "Insulated steel bottle", 29.0, 83, "Accessories"),
        ("Nova Hoodie", "Heavyweight brushed fleece hoodie", 79.0, 62, "Apparel"),
        ("Slate Wallet", "RFID-safe compact leather wallet", 49.0, 94, "Accessories"),
        ("Echo Speaker", "Smart room speaker with deep bass", 159.0, 27, "Electronics"),
        ("Flow Desk Mat", "Large anti-slip workspace desk mat", 45.0, 110, "Home"),
        ("Core Runners", "Daily trainer with adaptive mesh", 119.0, 38, "Footwear"),
    ]
    category_map = {c.name: c.id for c in categories}
    products_created: list[Product] = []
    for name, description, price, stock, category in product_seed:
        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category_id=category_map[category],
            is_active=True,
        )
        db.add(product)
        products_created.append(product)
    db.flush()

    statuses = [
        OrderStatus.pending,
        OrderStatus.processing,
        OrderStatus.shipped,
        OrderStatus.delivered,
        OrderStatus.cancelled,
    ]
    for i in range(1, 38):
        status = random.choices(statuses, weights=[2, 3, 3, 6, 1], k=1)[0]
        order = Order(
            order_number=f"SF-{100000 + i}",
            user_id=random.choice(all_users).id,
            status=status,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14)),
        )
        db.add(order)
        db.flush()

        picks = random.sample(products_created, k=random.randint(1, 3))
        total = 0.0
        for picked in picks:
            qty = random.randint(1, 3)
            total += picked.price * qty
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=picked.id,
                    quantity=qty,
                    unit_price=picked.price,
                )
            )
        order.total_amount = round(total, 2)

    db.commit()


app = FastAPI(title="ShopFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"name": "ShopFlow API", "docs": "/docs"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)
