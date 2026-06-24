from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True)

    name = Column(String, nullable=False)

    category = Column(String, nullable=False)

    price = Column(Numeric(10, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)