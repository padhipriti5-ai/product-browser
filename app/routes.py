from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import Product

router = APIRouter()


@router.get("/products")
def get_products(
    limit: int = 20,
    category: str | None = None,
    search: str | None = None,
    cursor_updated_at: str | None = None,
    cursor_id: str | None = None
):
    db: Session = SessionLocal()

    try:
        query = db.query(Product)

        # Category filter
        if category:
            query = query.filter(
                Product.category == category
            )

        # Search filter
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.category.ilike(f"%{search}%")
                )
            )

        # Total count
        total_count = query.count()

        # Products updated in last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=1)

        recent_count = db.query(Product).filter(
            Product.updated_at >= seven_days_ago
        ).count()

        # Average price
        average_price = db.query(
            func.avg(Product.price)
        ).scalar() or 0

        # Cursor pagination
        if cursor_updated_at and cursor_id:

            cursor_time = datetime.fromisoformat(
                cursor_updated_at
            )

            query = query.filter(
                or_(
                    Product.updated_at < cursor_time,
                    and_(
                        Product.updated_at == cursor_time,
                        Product.id < cursor_id
                    )
                )
            )

        products = (
            query.order_by(
                desc(Product.updated_at),
                desc(Product.id)
            )
            .limit(limit + 1)
            .all()
        )

        next_cursor = None

        if len(products) > limit:

            last_item = products[limit - 1]

            next_cursor = {
                "cursor_updated_at": last_item.updated_at.isoformat(),
                "cursor_id": str(last_item.id)
            }

            products = products[:limit]

        return {
            "count": total_count,
            "recent_count": recent_count,
            "average_price": float(average_price),
            "next_cursor": next_cursor,
            "products": products
        }

    finally:
        db.close()