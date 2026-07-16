from pydantic import BaseModel

class EstimateRequest(BaseModel):
    farmer_name: str
    location_region: str
    pollination_date: str
    curing_method: str
    sweating_duration_days: int
    sun_drying_duration_days: int
    conditioning_duration_days: int
    quantity_kg_wet: float

class EstimateResponse(BaseModel):
    harvest_status: str
    predicted_grade: str
    confidence_score: float
    recommendations: list[str]
    quantity_kg_dry_estimate: float
    estimated_price_usd_per_kg_min: float
    estimated_price_usd_per_kg_max: float
    feature_importances: dict[str, float] = None

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


from typing import Optional

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

class ContactRequestRequest(BaseModel):
    batch_id: str
