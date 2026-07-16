from fastapi import APIRouter, HTTPException, Query
from repository import get_vanilla_batch
from logic.matching import match_buyers_for_batch, get_advisor_explanation

router = APIRouter()

@router.post("/batches/{batch_id}/match-buyers")
def match_buyers(batch_id: int, lang: str = Query("en", regex="^(en|id)$")):
    # 1. Fetch batch from database
    batch = get_vanilla_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail=f"Vanilla batch with ID {batch_id} not found")
    
    # 2. Run matching engine to get top 3 recommended buyers
    recommended_buyers = match_buyers_for_batch(batch)
    
    if not recommended_buyers:
        return {
            "batch_id": str(batch_id),
            "export_readiness_score": 0,
            "recommended_buyers": []
        }
    
    # 3. Calculate export readiness score based on grade and confidence
    predicted_grade = batch.get("predicted_grade", "Low Grade")
    confidence = batch.get("confidence_score", 0.50)
    
    if predicted_grade == "Grade A":
        readiness = 85 + int(confidence * 12)
    elif predicted_grade == "Grade B":
        readiness = 65 + int(confidence * 15)
    else:
        readiness = 30 + int(confidence * 20)
        
    export_readiness_score = min(100, max(0, readiness))
    
    # 4. Generate LLM explanation only for the top buyer (#0)
    top_match = recommended_buyers[0]
    explanation = get_advisor_explanation(batch, top_match, lang=lang)
    top_match["explanation"] = explanation
    
    # 5. Format results according to specifications
    return {
        "batch_id": str(batch_id),
        "export_readiness_score": export_readiness_score,
        "recommended_buyers": recommended_buyers
    }
