from database import supabase_request
from datetime import datetime, timedelta, timezone


def save_vanilla_batch(batch_data: dict, jwt_token: str = None):
    try:
        return supabase_request("POST", "vanilla_batches", data=batch_data, jwt_token=jwt_token)
    except Exception as e:
        print("Database insertion error:", str(e))
        return None


def get_vanilla_batch(batch_id: str, jwt_token: str = None):
    try:
        res = supabase_request("GET", f"batches?id=eq.{batch_id}", jwt_token=jwt_token)
        if res and len(res) > 0:
            # Map columns to match what logic/matching.py expects
            row = res[0]
            # matching.py expects 'quantity_kg_dry_estimate'
            row["quantity_kg_dry_estimate"] = float(row.get("quantity_kg", 0.0))
            row["location_region"] = row.get("origin", "")
            row["predicted_grade"] = row.get("grade", "Low Grade")
            row["curing_method"] = "terkontrol" if "terkontrol" in row.get("origin", "").lower() else "tradisional"
            return row
        return None
    except Exception as e:
        print(f"Error fetching vanilla batch {batch_id}: {e}")
        return None


def get_buyer_mode_state(user_id: str, jwt_token: str = None):
    try:
        res = supabase_request("GET", f"buyer_mode_state?user_id=eq.{user_id}", jwt_token=jwt_token)
        if res and len(res) > 0:
            return res[0]
        return None
    except Exception as e:
        print(f"Error getting buyer mode state: {e}")
        return None


def update_buyer_mode_state(user_id: str, is_active: bool, criteria: dict = None, jwt_token: str = None):
    try:
        # Self-healing: Check if profile exists, if not create it
        try:
            profile_res = supabase_request("GET", f"profiles?id=eq.{user_id}", jwt_token=jwt_token)
            if not profile_res or len(profile_res) == 0:
                supabase_request("POST", "profiles", data={
                    "id": user_id,
                    "full_name": "Vanilla User",
                    "company_name": "Vanilla Co"
                }, jwt_token=jwt_token)
        except Exception as profile_err:
            print(f"Self-healing profile insert failed/skipped: {profile_err}")

        existing = get_buyer_mode_state(user_id, jwt_token=jwt_token)
        
        payload = {
            "user_id": user_id,
            "is_active": is_active,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if is_active:
            payload["activated_at"] = datetime.now(timezone.utc).isoformat()
            payload["last_heartbeat"] = datetime.now(timezone.utc).isoformat()
            
        if criteria:
            payload["required_grade"] = criteria.get("required_grade")
            payload["min_quantity_kg"] = criteria.get("min_quantity_kg")
            payload["max_quantity_kg"] = criteria.get("max_quantity_kg")
            payload["preferred_origin"] = criteria.get("preferred_origin")
            payload["industry"] = criteria.get("industry")
            
        if existing:
            return supabase_request("PATCH", f"buyer_mode_state?user_id=eq.{user_id}", data=payload, jwt_token=jwt_token)
        else:
            return supabase_request("POST", "buyer_mode_state", data=payload, jwt_token=jwt_token)
    except Exception as e:
        print(f"Error updating buyer mode state: {e}")
        return None


def heartbeat_buyer_mode_state(user_id: str, jwt_token: str = None):
    try:
        payload = {
            "last_heartbeat": datetime.now(timezone.utc).isoformat()
        }
        supabase_request("PATCH", f"buyer_mode_state?user_id=eq.{user_id}", data=payload, jwt_token=jwt_token)
        return True
    except Exception as e:
        print(f"Error pulsing heartbeat: {e}")
        return False


def get_active_buyers_data(jwt_token: str = None):
    try:
        threshold = (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat()
        res = supabase_request("GET", f"buyer_mode_state?select=*,profiles(*)&is_active=eq.true&last_heartbeat=gt.{threshold}", jwt_token=jwt_token)
        return res if res else []
    except Exception as e:
        print(f"Error getting active buyers: {e}")
        return []


def count_active_buyers(jwt_token: str = None):
    try:
        buyers = get_active_buyers_data(jwt_token=jwt_token)
        return len(buyers)
    except Exception as e:
        print(f"Error counting active buyers: {e}")
        return 0


def create_batch(seller_id: str, data: dict, jwt_token: str = None):
    try:
        payload = {
            "seller_id": seller_id,
            "grade": data.get("grade"),
            "quantity_kg": data.get("quantity_kg"),
            "origin": data.get("origin"),
            "harvest_days": data.get("harvest_days"),
            "conditioning_days": data.get("conditioning_days"),
            "export_readiness_score": data.get("export_readiness_score"),
            "status": data.get("status", "pending")
        }
        supabase_request("POST", "batches", data=payload, jwt_token=jwt_token)
        latest = supabase_request("GET", f"batches?seller_id=eq.{seller_id}&order=created_at.desc&limit=1", jwt_token=jwt_token)
        if latest and len(latest) > 0:
            return latest[0]
        return None
    except Exception as e:
        print(f"Error creating batch: {e}")
        return None


def get_batches(status: str = None, seller_id: str = None, jwt_token: str = None):
    try:
        query = "batches?select=*,profiles(*)"
        filters = []
        if status:
            filters.append(f"status=eq.{status}")
        if seller_id:
            filters.append(f"seller_id=eq.{seller_id}")
        if filters:
            query += "&" + "&".join(filters)
        query += "&order=created_at.desc"
        res = supabase_request("GET", query, jwt_token=jwt_token)
        return res if res else []
    except Exception as e:
        print(f"Error fetching batches: {e}")
        return []


def get_batch_by_id(batch_id: str, jwt_token: str = None):
    try:
        res = supabase_request("GET", f"batches?id=eq.{batch_id}", jwt_token=jwt_token)
        if res and len(res) > 0:
            return res[0]
        return None
    except Exception as e:
        print(f"Error getting batch {batch_id}: {e}")
        return None


def create_contact_request(buyer_id: str, batch_id: str, jwt_token: str = None):
    try:
        payload = {
            "buyer_id": buyer_id,
            "batch_id": batch_id,
            "status": "requested"
        }
        supabase_request("POST", "contact_requests", data=payload, jwt_token=jwt_token)
        return True
    except Exception as e:
        print(f"Error creating contact request: {e}")
        return False

def get_contact_requests_for_batch(batch_id: str, jwt_token: str = None):
    """Return all buyers who sent a contact/purchase request for a specific batch,
    joined with their profile info and buyer mode criteria."""
    try:
        # Join profiles via buyer_id FK.
        # Also join buyer_mode_state (which uses user_id as its FK to profiles/auth.users)
        # We use a nested select to get buyer criteria.
        query = (
            f"contact_requests"
            f"?select=*,profiles!buyer_id(full_name,company_name,email),buyer_mode_state!inner(industry,required_grade,min_quantity_kg,max_quantity_kg,preferred_origin)"
            f"&batch_id=eq.{batch_id}"
            f"&order=created_at.desc"
        )
        res = supabase_request("GET", query, jwt_token=jwt_token)
        if res is not None:
            return res
        
        # Fallback: simpler query without buyer_mode_state join
        fallback_query = (
            f"contact_requests"
            f"?select=*,profiles!buyer_id(full_name,company_name,email)"
            f"&batch_id=eq.{batch_id}"
            f"&order=created_at.desc"
        )
        res2 = supabase_request("GET", fallback_query, jwt_token=jwt_token)
        return res2 if res2 else []
    except Exception as e:
        print(f"Error fetching contact requests for batch {batch_id}: {e}")
        # Final fallback: bare query
        try:
            simple = supabase_request("GET", f"contact_requests?batch_id=eq.{batch_id}", jwt_token=jwt_token)
            return simple if simple else []
        except Exception:
            return []


def get_contact_requests_by_buyer(buyer_id: str, jwt_token: str = None):
    try:
        query = f"contact_requests?select=*,batches(*,profiles(*))&buyer_id=eq.{buyer_id}&order=created_at.desc"
        res = supabase_request("GET", query, jwt_token=jwt_token)
        return res if res else []
    except Exception as e:
        print(f"Error fetching contact requests for buyer {buyer_id}: {e}")
        return []
