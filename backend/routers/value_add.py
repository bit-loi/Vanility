from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ValueAddRequest(BaseModel):
    quantity_kg_dry: float
    predicted_grade: str

class ValueAddResponse(BaseModel):
    raw_bean_income_usd: float
    extract_income_usd: float
    value_add_gap_usd: float
    value_add_gap_percentage: float

@router.post("/value-add-calculator", response_model=ValueAddResponse)
def calculate_value_add(req: ValueAddRequest):
    raw_price = 60.0
    if req.predicted_grade == "Grade A":
        raw_price = 175.0
    elif req.predicted_grade == "Grade B":
        raw_price = 130.0
        
    raw_bean_income = float(round(req.quantity_kg_dry * raw_price, 2))
    extract_income = float(round(req.quantity_kg_dry * 270.0, 2))
    gap = float(round(extract_income - raw_bean_income, 2))
    
    pct = 0.0
    if raw_bean_income > 0:
        pct = float(round((gap / raw_bean_income) * 100, 2))
        
    return ValueAddResponse(
        raw_bean_income_usd=raw_bean_income,
        extract_income_usd=extract_income,
        value_add_gap_usd=gap,
        value_add_gap_percentage=pct
    )
