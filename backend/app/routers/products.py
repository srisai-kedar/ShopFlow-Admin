from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_current_user, get_db, require_admin
from app.models import Category, Product, User
from app.schemas import (
    CategoryRead,
    PaginationMeta,
    ProductCreate,
    ProductListResponse,
    ProductRead,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/categories", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Category).order_by(Category.name.asc()).all()


@router.get("", response_model=ProductListResponse)
def list_products(
    search: str | None = Query(default=None),
    category_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Product).options(joinedload(Product.category))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    rows = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return ProductListResponse(
        items=rows,
        meta=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages),
    )


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == product.id).first()


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        category = db.query(Category).filter(Category.id == updates["category_id"]).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    for key, value in updates.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == product.id).first()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.order_items:
        product.is_active = False
        db.commit()
        return
    db.delete(product)
    db.commit()
