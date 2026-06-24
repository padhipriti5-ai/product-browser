from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ProductResponse(BaseModel):
    id: UUID
    name: str
    category: str
    price: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True