from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import EstimateRequest, EstimateResponse
from logic.grading import get_harvest_metrics, generate_recommendations, predict_grade_and_confidence, get_feature_importances
from repository import save_vanilla_batch

router = APIRouter()

@router.post("/estimate", response_model=EstimateResponse)
def estimate_batch(req: EstimateRequest):
    try:
        poll_date = datetime.strptime(req.pollination_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    today = datetime.now().date()
    days_since_pollination = abs((today - poll_date).days)
    
    harvest_status, _ = get_harvest_metrics(days_since_pollination)
    
    predicted_grade, confidence_score = predict_grade_and_confidence(
        days_since_pollination=days_since_pollination,
        curing_method=req.curing_method,
        sweating_duration_days=req.sweating_duration_days,
        sun_drying_duration_days=req.sun_drying_duration_days,
        conditioning_duration_days=req.conditioning_duration_days
    )
    
    price_min = 40.0
    price_max = 80.0
    if predicted_grade == "Grade A":
        price_min = 180.0
        price_max = 220.0
    elif predicted_grade == "Grade B":
        price_min = 110.0
        price_max = 150.0
        
    dry_qty = float(round(req.quantity_kg_wet * 0.25, 1))
    
    recs = generate_recommendations(
        days_since_pollination=days_since_pollination,
        curing_method=req.curing_method,
        sweating_duration_days=req.sweating_duration_days,
        sun_drying_duration_days=req.sun_drying_duration_days,
        conditioning_duration_days=req.conditioning_duration_days
    )
    
    batch_data = {
        "farmer_name": req.farmer_name,
        "location_region": req.location_region,
        "pollination_date": req.pollination_date,
        "curing_method": req.curing_method,
        "sweating_duration_days": req.sweating_duration_days,
        "sun_drying_duration_days": req.sun_drying_duration_days,
        "conditioning_duration_days": req.conditioning_duration_days,
        "predicted_grade": predicted_grade,
        "confidence_score": confidence_score,
        "quantity_kg_wet": req.quantity_kg_wet,
        "quantity_kg_dry_estimate": dry_qty,
    }
    try:
        save_vanilla_batch(batch_data)
    except Exception as e:
        print(f"Backend save to Supabase skipped (no service_role key): {e}")
    
    return EstimateResponse(
        harvest_status=harvest_status,
        predicted_grade=predicted_grade,
        confidence_score=confidence_score,
        recommendations=recs,
        quantity_kg_dry_estimate=dry_qty,
        estimated_price_usd_per_kg_min=price_min,
        estimated_price_usd_per_kg_max=price_max,
        feature_importances=get_feature_importances()
    )
