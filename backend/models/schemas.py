from pydantic import BaseModel, Field
from typing import Optional

class EstimateRequest(BaseModel):
    farmer_name: str
    location_region: str
    pollination_date: str
    curing_method: str
    sweating_duration_days: int = Field(..., ge=1, le=15)
    sun_drying_duration_days: int = Field(..., ge=1, le=60)
    conditioning_duration_days: int = Field(..., ge=1, le=150)
    quantity_kg_wet: float = Field(..., ge=0.1, le=5000.0)

class EstimateResponse(BaseModel):
    harvest_status: str
    predicted_grade: str
    confidence_score: float
    recommendations: list[str]
    quantity_kg_dry_estimate: float
    estimated_price_usd_per_kg_min: float
    estimated_price_usd_per_kg_max: float
    feature_importances: dict[str, float] = None
    warning_message: Optional[str] = None

class ValueAddRequest(BaseModel):
    quantity_kg_dry: float
    predicted_grade: str

class ValueAddResponse(BaseModel):
    raw_bean_income_usd: float
    extract_income_usd: float
    value_add_gap_usd: float
    value_add_gap_percentage: float

class PriceReferenceItem(BaseModel):
    grade: str
    price_usd_per_kg_min: float
    price_usd_per_kg_max: float




class BuyerCriteria(BaseModel):
    required_grade: str
    min_quantity_kg: float
    max_quantity_kg: float
    preferred_origin: str
    industry: str

class ToggleBuyerModeRequest(BaseModel):
    is_active: bool
    criteria: Optional[BuyerCriteria] = None

class BatchCreateRequest(BaseModel):
    grade: str
    quantity_kg: float
    origin: str
    harvest_days: int
    conditioning_days: int
    export_readiness_score: int
    status: str = "pending"

class ContactRequestRequest(BaseModel):
    batch_id: str
