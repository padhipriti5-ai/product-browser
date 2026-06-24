import uuid
import random
from datetime import datetime, UTC

from faker import Faker
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Product

fake = Faker()

categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Sports",
    "Home"
]

db: Session = SessionLocal()

BATCH_SIZE = 5000
TOTAL_RECORDS = 200000

for batch_start in range(0, TOTAL_RECORDS, BATCH_SIZE):

    products = []

    now = datetime.now(UTC)

    for _ in range(BATCH_SIZE):

        products.append(
            Product(
                id=uuid.uuid4(),
                name=fake.word(),
                category=random.choice(categories),
                price=random.randint(100, 10000),
                created_at=now,
                updated_at=now
            )
        )

    db.bulk_save_objects(products)
    db.commit()

    print(
        f"Inserted {batch_start + BATCH_SIZE} records"
    )

db.close()

print("Done!")