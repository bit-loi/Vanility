from fastapi import APIRouter
from models.schemas import PriceReferenceItem

router = APIRouter()

@router.get("/price-reference", response_model=list[PriceReferenceItem])
def get_price_references():
    return [
        PriceReferenceItem(grade="Grade A", price_usd_per_kg_min=180.0, price_usd_per_kg_max=220.0),
        PriceReferenceItem(grade="Grade B", price_usd_per_kg_min=110.0, price_usd_per_kg_max=150.0),
        PriceReferenceItem(grade="Low Grade", price_usd_per_kg_min=40.0, price_usd_per_kg_max=80.0)
    ]
