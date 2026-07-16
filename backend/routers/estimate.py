from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from database import supabase

router = APIRouter()

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

@router.post("/estimate", response_model=EstimateResponse)
def estimate_batch(req: EstimateRequest):
    try:
        poll_date = datetime.strptime(req.pollination_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    today = datetime.now().date()
    days_since_pollination = abs((today - poll_date).days)
    
    harvest_score = 2
    harvest_status = "Ideal Maturity"
    
    if days_since_pollination < 120:
      harvest_status = "Too Early"
      harvest_score = 0
    elif days_since_pollination < 210:
      harvest_status = "Approaching Maturity"
      harvest_score = 1
    elif days_since_pollination <= 270:
      harvest_status = "Ideal Maturity"
      harvest_score = 2
    else:
      harvest_status = "Overmature"
      harvest_score = 1
      
    sweating_score = 0
    if req.sweating_duration_days == 0:
      sweating_score = 0
    elif req.curing_method == "terkontrol" and 4 <= req.sweating_duration_days <= 8:
      sweating_score = 2
    elif req.curing_method == "tradisional" and 10 <= req.sweating_duration_days <= 15:
      sweating_score = 2
    elif req.sweating_duration_days > 0:
      sweating_score = 1
      
    drying_score = 0
    if req.sun_drying_duration_days == 0:
      drying_score = 0
    elif 5 <= req.sun_drying_duration_days <= 14:
      drying_score = 2
    elif 15 <= req.sun_drying_duration_days <= 25:
      drying_score = 1
    else:
      drying_score = 0
      
    conditioning_score = 0
    if req.conditioning_duration_days >= 60:
      conditioning_score = 2
    elif req.conditioning_duration_days >= 30:
      conditioning_score = 1
    else:
      conditioning_score = 0
      
    total_score = harvest_score + sweating_score + drying_score + conditioning_score
    predicted_grade = "Low Grade"
    confidence = 0.50
    
    if total_score >= 6:
      predicted_grade = "Grade A"
      confidence = 0.85 + (total_score - 6) * 0.05
    elif total_score >= 3:
      predicted_grade = "Grade B"
      confidence = 0.60 + (total_score - 3) * 0.05
    else:
      predicted_grade = "Low Grade"
      confidence = 0.50 + total_score * 0.03
      
    if harvest_score == 0:
      predicted_grade = "Low Grade"
      confidence = min(confidence, 0.55)
      
    price_min = 40.0
    price_max = 80.0
    if predicted_grade == "Grade A":
      price_min = 180.0
      price_max = 220.0
    elif predicted_grade == "Grade B":
      price_min = 110.0
      price_max = 150.0
      
    dry_qty = float(round(req.quantity_kg_wet * 0.25, 1))
    
    recs = []
    if harvest_score < 2:
      recs.append("Wait for flower pollination age of 7 to 9 months for optimal vanillin content.")
    if sweating_score < 2:
      recs.append("Maintain sweating for 10 to 15 days (traditional) or 4 to 8 days (controlled).")
    if drying_score < 2:
      recs.append("Keep drying duration within 5 to 14 days under alternating sun and shade.")
    if conditioning_score < 2:
      recs.append("Condition in sealed container boxes for at least 60 days before selling.")
      
    try:
      supabase.table("vanilla_batches").insert({
          "farmer_name": req.farmer_name,
          "location_region": req.location_region,
          "pollination_date": req.pollination_date,
          "curing_method": req.curing_method,
          "sweating_duration_days": req.sweating_duration_days,
          "sun_drying_duration_days": req.sun_drying_duration_days,
          "conditioning_duration_days": req.conditioning_duration_days,
          "predicted_grade": predicted_grade,
          "confidence_score": float(round(confidence, 2)),
          "quantity_kg_wet": req.quantity_kg_wet,
          "quantity_kg_dry_estimate": dry_qty
      }).execute()
    except Exception as e:
      print("Supabase insert error:", str(e))
      
    return EstimateResponse(
        harvest_status=harvest_status,
        predicted_grade=predicted_grade,
        confidence_score=float(round(confidence, 2)),
        recommendations=recs,
        quantity_kg_dry_estimate=dry_qty,
        estimated_price_usd_per_kg_min=price_min,
        estimated_price_usd_per_kg_max=price_max
    )
