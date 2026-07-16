import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import estimate, price_reference, value_add

load_dotenv()

app = FastAPI(title="Vanility API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estimate.router, prefix="/api", tags=["Estimate"])
app.include_router(price_reference.router, prefix="/api", tags=["Price Reference"])
app.include_router(value_add.router, prefix="/api", tags=["Value Add"])

@app.get("/")
def read_root():
    return {"status": "running"}
