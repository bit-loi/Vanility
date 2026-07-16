import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import estimate, price_reference, value_add, buyer_match, buyer_mode

load_dotenv()

app = FastAPI(title="Vanility API", version="1.0.0")

origins_str = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estimate.router, prefix="/api", tags=["Estimate"])
app.include_router(price_reference.router, prefix="/api", tags=["Price Reference"])
app.include_router(value_add.router, prefix="/api", tags=["Value Add"])
app.include_router(buyer_match.router, prefix="/api", tags=["Buyer Match"])
app.include_router(buyer_mode.router, prefix="/api", tags=["Buyer Mode"])

@app.get("/")
def read_root():
    return {"status": "running"}
