from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Product
from app.database import Base
from app.routes import router
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://product-browser-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message": "Database Connected Successfully"
    }

@app.get("/count")
def count_products():

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM products")
        )

        count = result.scalar()

    return {
        "count": count
    }
    
app.include_router(router)