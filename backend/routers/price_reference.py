from fastapi import APIRouter, Header
from typing import Optional
from models.schemas import PriceReferenceItem

router = APIRouter()

@router.get("/price-reference", response_model=list[PriceReferenceItem])
def get_price_references():
    return [
        PriceReferenceItem(grade="Grade A", price_usd_per_kg_min=180.0, price_usd_per_kg_max=220.0),
        PriceReferenceItem(grade="Grade B", price_usd_per_kg_min=110.0, price_usd_per_kg_max=150.0),
        PriceReferenceItem(grade="Grade C", price_usd_per_kg_min=40.0, price_usd_per_kg_max=80.0)
    ]


from fastapi import APIRouter, Header
from typing import Optional
from models.schemas import PriceReferenceItem

router = APIRouter()

@router.get("/price-reference", response_model=list[PriceReferenceItem])
def get_price_references():
    return [
        PriceReferenceItem(grade="Grade A", price_usd_per_kg_min=180.0, price_usd_per_kg_max=220.0),
        PriceReferenceItem(grade="Grade B", price_usd_per_kg_min=110.0, price_usd_per_kg_max=150.0),
        PriceReferenceItem(grade="Grade C", price_usd_per_kg_min=40.0, price_usd_per_kg_max=80.0)
    ]


@router.get("/market-insight")
def get_market_insight(
    lang: str = "en",
    authorization: Optional[str] = Header(None)
):
    from logic.matching import generate_llm_explanation
    import os
    
    # 1. Resolve user and token optionally
    user_id = None
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        from auth import SUPABASE_URL, SUPABASE_KEY
        import httpx
        try:
            with httpx.Client() as client:
                resp = client.get(
                    f"{SUPABASE_URL}/auth/v1/user",
                    headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}
                )
                if resp.status_code == 200:
                    user_id = resp.json().get("id")
        except Exception:
            pass

    # 2. Query batches from DB to build RAG context
    db_context = ""
    batches_context = ""
    
    if user_id and token:
        from repository import get_batches
        try:
            batches = get_batches(seller_id=user_id, jwt_token=token)
            if batches:
                # Compile general RAG context for market insight
                total_batches = len(batches)
                grades = [b.get("grade", "Grade C") for b in batches]
                grade_a = grades.count("Grade A")
                grade_b = grades.count("Grade B")
                grade_c = grades.count("Grade C")
                origins = list(set([b.get("origin", "NTT") for b in batches if b.get("origin")]))
                
                db_context = (
                    f"Context of this farmer's inventory:\n"
                    f"- Total active batches tracked: {total_batches}\n"
                    f"- Grade Distribution: {grade_a} Grade A, {grade_b} Grade B, {grade_c} Grade C\n"
                    f"- Production Regions: {', '.join(origins) if origins else 'NTT'}\n"
                )
                
                # Compile specific batch details for agronomist RAG analysis
                for idx, b in enumerate(reversed(batches)):
                    b_name = b.get("name") or f"Batch B{idx+1:03d}"
                    batches_context += (
                        f"- {b_name}: Grade: {b.get('grade')}, Quantity: {b.get('quantity_kg')} kg, "
                        f"Region: {b.get('origin')}, Harvest & Curing Days: {b.get('harvest_days')} days, "
                        f"Conditioning Days: {b.get('conditioning_days')} days, Status: {b.get('status')}\n"
                    )
        except Exception as e:
            print(f"Error compiling RAG context: {e}")

    # Fallback/Default Agronomist text
    default_alert_title = "Curing Analysis" if lang == "en" else "Analisis Curing"
    default_alert_text = (
        "Maintain sweating duration between 3 to 8 days, and sun drying strictly between 15 and 35 days "
        "under standard conditions to control microbial growth risk and optimize final grade."
        if lang == "en" else
        "Jaga durasi sweating antara 3 hingga 8 hari, dan pengeringan matahari ketat antara 15 hingga 35 hari "
        "di bawah kondisi standar untuk mengendalikan risiko pertumbuhan mikroba."
    )

    # Fallback Market text
    static_fallbacks = {
        "en": "Global demand for premium Grade A vanilla beans continues to grow. Proper curing processes multiply the export market value for local farmers.",
        "id": "Permintaan global untuk biji vanili Grade A premium terus meningkat. Proses curing yang tepat melipatgandakan nilai jual ekspor petani lokal."
    }
    fallback_market_text = static_fallbacks.get(lang, static_fallbacks["en"])
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return {
            "insight": fallback_market_text,
            "alert_title": default_alert_title,
            "alert_text": default_alert_text
        }
        
    # --- Generate Market Insight via LLM ---
    system_prompt_market = (
        "You are a global spice market analyst. Write 1 or 2 sentences highlighting a current trend in the Indonesian vanilla market, "
        "focusing on how grading or curing vanilla beans increases export profits to international markets. "
        "Strict rules:\n"
        "1. Write the response as a single, smooth, cohesive paragraph.\n"
        "2. DO NOT use dashes, bullet points, lists, headers, or numbering.\n"
        "3. DO NOT mention specific batch numbers like 'Batch B003' or 'B003'.\n"
        "Keep it concise, engaging, and professional."
    )
    if lang == "id":
        system_prompt_market += " Write the response in professional Indonesian."
    else:
        system_prompt_market += " Write the response in professional English."
        
    user_prompt_market = "Highlight the benefits of proper curing and grading for smallholder farmers in NTT, Indonesia, and how it links to premium global demand."
    if db_context:
        user_prompt_market += f"\n\nUse the following user database context to personalize the insight (mention their region or quality progress if relevant, but do not use list formats or lists of batches):\n{db_context}"
    
    # --- Generate Agronomist Analysis via LLM (RAG) ---
    if batches_context:
        system_prompt_agro = (
            "You are an expert vanilla agronomist and curing consultant. Write a short, personalized data analysis of the farmer's vanilla batches. "
            "Identify if there are any quality, harvest maturity, or curing duration issues (e.g., short curing times, lower grades) based strictly on the provided batch data. "
            "Offer actionable guidance on how they can improve their next curing cycles (like maintaining sweating and drying parameters). "
            "Strict rules:\n"
            "1. Write the response as a single, smooth, cohesive paragraph of 2 to 3 sentences.\n"
            "2. DO NOT use dashes, bullet points, lists, headers, or numbering.\n"
            "3. DO NOT mention 'Batch B003' unless it is actually in the user's data.\n"
            "Keep it concise, supportive, and professional."
        )
        if lang == "id":
            system_prompt_agro += " Write the response in professional Indonesian."
            user_prompt_agro = f"Analisis data batch vanili berikut dan berikan saran kualitas agronomis singkat:\n{batches_context}"
        else:
            system_prompt_agro += " Write the response in professional English."
            user_prompt_agro = f"Analyze the following vanilla batches for the farmer and give them a quality advice summary:\n{batches_context}"
    else:
        # Default RAG message when user has no batches
        system_prompt_agro = ""
        user_prompt_agro = ""
        
    try:
        # 1. Get Market Insight
        insight = generate_llm_explanation(
            system_prompt=system_prompt_market,
            user_prompt=user_prompt_market
        )
        insight = insight.replace("- ", "").replace("\n-", "").strip()
        
        # 2. Get Agronomist Insight (RAG)
        if batches_context:
            agro_text = generate_llm_explanation(
                system_prompt=system_prompt_agro,
                user_prompt=user_prompt_agro
            )
            agro_text = agro_text.replace("- ", "").replace("\n-", "").strip()
            alert_title = "Inventory Curing Analysis" if lang == "en" else "Analisis Curing Inventaris"
            alert_text = agro_text
        else:
            alert_title = "Compliance Setup" if lang == "en" else "Panduan Kepatuhan"
            alert_text = (
                "You do not have any active batches tracked yet. Add your first batch in the 'Grade Assessment' tab to get personalized agronomist insights. Remember to maintain standard sweating (3-8 days) and sun drying (15-35 days) for best quality."
                if lang == "en" else
                "Anda belum memiliki batch aktif yang dipantau. Tambahkan batch pertama Anda di tab 'Penilaian Mutu' untuk mendapatkan analisis agronomis personal. Jaga durasi sweating (3-8 hari) dan pengeringan (15-35 hari) untuk kualitas terbaik."
            )
            
        return {
            "insight": insight,
            "alert_title": alert_title,
            "alert_text": alert_text
        }
    except Exception as e:
        print(f"Failed to generate dynamic LLM RAG insight/alert: {e}")
        return {
            "insight": fallback_market_text,
            "alert_title": default_alert_title,
            "alert_text": default_alert_text
        }
