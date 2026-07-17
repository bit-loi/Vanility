from fastapi import APIRouter, HTTPException, Depends, Query
from auth import get_current_user_id, get_current_token
from models.schemas import ToggleBuyerModeRequest, BatchCreateRequest, ContactRequestRequest
from repository import (
    get_buyer_mode_state,
    update_buyer_mode_state,
    heartbeat_buyer_mode_state,
    count_active_buyers,
    get_active_buyers_data,
    create_batch,
    get_batches,
    get_batch_by_id,
    create_contact_request,
    get_contact_requests_for_batch
)
from logic.matching import score_buyer_compatibility, get_advisor_explanation

router = APIRouter()


@router.post("/buyer-mode/toggle")
def toggle_buyer_mode(
    req: ToggleBuyerModeRequest,
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    if req.is_active and not req.criteria:
        raise HTTPException(
            status_code=400,
            detail="Criteria must be specified when turning Buyer Mode ON"
        )
    
    criteria_dict = req.criteria.dict() if req.criteria else None
    res = update_buyer_mode_state(user_id, req.is_active, criteria_dict, jwt_token=token)
    
    # Return updated state
    state = get_buyer_mode_state(user_id, jwt_token=token)
    if not state:
        raise HTTPException(status_code=500, detail="Failed to fetch updated buyer state")
    return state


@router.post("/buyer-mode/heartbeat")
def post_heartbeat(
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    res = heartbeat_buyer_mode_state(user_id, jwt_token=token)
    if not res:
        raise HTTPException(status_code=500, detail="Failed to register heartbeat")
    return {"status": "ok"}


@router.get("/buyer-mode/active-count")
def get_active_count():
    count = count_active_buyers()
    return {"active_buyer_count": count}


@router.get("/matches/{batch_id}")
def get_batch_matches(
    batch_id: str,
    lang: str = Query("en", regex="^(en|id)$"),
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    # 1. Fetch batch
    batch = get_batch_by_id(batch_id, jwt_token=token)
    if not batch:
        raise HTTPException(status_code=404, detail="Vanilla batch not found")
        
    # Map batch format for matching engine
    mapped_batch = {
        "predicted_grade": "Grade C" if batch.get("grade") == "Low Grade" else batch.get("grade", "Grade C"),
        "quantity_kg_dry_estimate": float(batch.get("quantity_kg", 0.0)),
        "location_region": batch.get("origin", ""),
        "curing_method": "terkontrol" if "terkontrol" in batch.get("origin", "").lower() else "tradisional"
    }
    
    # 2. Build a merged pool of buyers:
    #    a) Buyers who are currently live (heartbeat)
    #    b) Buyers who have sent a purchase request for this batch (from DB)
    # Deduplicate by user_id so a buyer appearing in both is counted once.
    
    seen_buyer_ids: set = set()
    raw_buyer_pool: list = []
    
    # a) Live/active buyers from presence heartbeat table
    seller_id = batch.get("seller_id")
    active_buyers_raw = get_active_buyers_data(jwt_token=token)
    for item in active_buyers_raw:
        bid = item.get("user_id")
        if bid and bid != user_id and bid != seller_id and bid not in seen_buyer_ids:
            seen_buyer_ids.add(bid)
            raw_buyer_pool.append(("heartbeat", item))
    
    # b) Buyers from contact_requests for this batch (offline buyers included)
    contact_requests_raw = get_contact_requests_for_batch(batch_id, jwt_token=token)
    for cr in contact_requests_raw:
        bid = cr.get("buyer_id")
        if bid and bid != user_id and bid != seller_id and bid not in seen_buyer_ids:
            seen_buyer_ids.add(bid)
            profiles_data = cr.get("profiles") or {}
            # buyer_mode_state may be a dict (inner join) or list depending on Supabase response
            bms_raw = cr.get("buyer_mode_state")
            if isinstance(bms_raw, list):
                bms_data = bms_raw[0] if bms_raw else {}
            elif isinstance(bms_raw, dict):
                bms_data = bms_raw
            else:
                bms_data = {}
            merged_item = {
                "user_id": bid,
                "profiles": profiles_data,
                "industry": bms_data.get("industry") or "Vanilla Industry",
                "required_grade": bms_data.get("required_grade") or "Grade A",
                "min_quantity_kg": float(bms_data.get("min_quantity_kg") or 0.0),
                "max_quantity_kg": float(bms_data.get("max_quantity_kg") or 1000.0),
                "preferred_origin": bms_data.get("preferred_origin") or "NTT",
            }
            raw_buyer_pool.append(("db", merged_item))

    recommended_buyers = []
    for source, item in raw_buyer_pool:
        buyer_uid = item.get("user_id")
        # Map profiles join safely
        profiles = item.get("profiles") or {}
        
        # Resolve display name: prefer full_name, then company_name, then derive from email
        raw_name = profiles.get("full_name") or profiles.get("company_name")
        email_addr = profiles.get("email") or "buyer@vanility.com"
        if not raw_name:
            # Derive a readable name from the email local part
            local = email_addr.split("@")[0].replace(".", " ").replace("_", " ").title()
            raw_name = local or "Anonymous Buyer"
        
        buyer_data = {
            "id": buyer_uid,
            "company_name": raw_name,
            "country": "Indonesia",
            "industry": item.get("industry") or "Vanilla Industry",
            "required_grade": item.get("required_grade") or "Grade A",
            "min_quantity_kg": float(item.get("min_quantity_kg") or 0.0),
            "max_quantity_kg": float(item.get("max_quantity_kg") or 1000.0),
            "preferred_origin": item.get("preferred_origin") or "NTT",
            "description": "Live buyer matching on Vanility." if source == "heartbeat" else "Has sent a purchase request for this batch.",
            "contact_email": email_addr
        }
        
        # Calculate score
        score = score_buyer_compatibility(mapped_batch, buyer_data)
        recommended_buyers.append({
            "buyer": buyer_data,
            "compatibility_score": score
        })
        
    # Sort descending
    recommended_buyers.sort(key=lambda x: x["compatibility_score"], reverse=True)
    top_matches = recommended_buyers[:3]
    
    # Generate LLM Advisor explanation for the top-matched buyer (#0)
    if top_matches:
        top_match = top_matches[0]
        explanation = get_advisor_explanation(mapped_batch, top_match, lang=lang)
        top_match["explanation"] = explanation
        
    # Calculate readiness score
    predicted_grade = "Grade C" if batch.get("grade") == "Low Grade" else batch.get("grade", "Grade C")
    readiness = 50
    if predicted_grade == "Grade A":
        readiness = 90
    elif predicted_grade == "Grade B":
        readiness = 75
    else:
        readiness = 40
        
    return {
        "batch_id": batch_id,
        "export_readiness_score": readiness,
        "recommended_buyers": top_matches
    }


@router.post("/batches")
def post_batch(
    req: BatchCreateRequest,
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    batch_data = req.dict()
    res = create_batch(user_id, batch_data, jwt_token=token)
    if not res:
        raise HTTPException(status_code=500, detail="Failed to save batch")
    return res


@router.get("/batches")
def list_batches(
    status: str = Query(None),
    seller_id: str = Query(None),
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    batches = get_batches(status=status, seller_id=seller_id, jwt_token=token)
    return batches


@router.post("/contact-requests")
def post_contact_request(
    req: ContactRequestRequest,
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    # BUG FIX: Verify the batch exists before creating a contact request
    from repository import get_batch_by_id as verify_batch
    batch = verify_batch(req.batch_id, jwt_token=token)
    if not batch:
        raise HTTPException(status_code=404, detail="Vanilla batch not found")
    # Verify the current user is not the seller of this batch (can't request your own batch)
    if batch.get("seller_id") == user_id:
        raise HTTPException(status_code=400, detail="Cannot send contact request to your own batch")
    
    success = create_contact_request(user_id, req.batch_id, jwt_token=token)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to record contact request")
    return {"status": "created"}


@router.get("/contact-requests")
def list_contact_requests(
    user_id: str = Depends(get_current_user_id),
    token: str = Depends(get_current_token)
):
    from repository import get_contact_requests_by_buyer
    return get_contact_requests_by_buyer(user_id, jwt_token=token)
