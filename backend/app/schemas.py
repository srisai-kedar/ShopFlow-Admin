from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import OrderStatus, UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.staff


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AuthPayload(BaseModel):
    email: EmailStr
    password: str


class CategoryBase(BaseModel):
    name: str


class CategoryRead(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    description: str = ""
    price: float = Field(ge=0)
    stock: int = Field(ge=0)
    is_active: bool = True
    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    category_id: Optional[int] = None


class ProductRead(ProductBase):
    id: int
    created_at: datetime
    category: CategoryRead
    model_config = ConfigDict(from_attributes=True)


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    meta: PaginationMeta


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderItemRead(BaseModel):
    id: int
    quantity: int
    unit_price: float
    product: ProductRead
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    user_id: int
    items: list[OrderItemBase]
    status: OrderStatus = OrderStatus.pending


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderUserRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    order_number: str
    user_id: int
    user: OrderUserRead
    status: OrderStatus
    total_amount: float
    created_at: datetime
    items: list[OrderItemRead]
    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    items: list[OrderRead]
    meta: PaginationMeta


class KPIResponse(BaseModel):
    revenue: float
    orders: int
    users: int
    products: int


class RevenuePoint(BaseModel):
    date: str
    revenue: float


class StatusBreakdownPoint(BaseModel):
    status: str
    count: int


class TopProductPoint(BaseModel):
    product_name: str
    sold_units: int
    revenue: float


class ActivityItem(BaseModel):
    id: str
    type: str
    message: str
    created_at: str


class AnalyticsSummary(BaseModel):
    kpis: KPIResponse
    revenue_series: list[RevenuePoint]
    status_breakdown: list[StatusBreakdownPoint]
    top_products: list[TopProductPoint]
    recent_activity: list[ActivityItem]
