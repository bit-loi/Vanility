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


@router.get("/market-insight")
def get_market_insight(lang: str = "en"):
    from logic.matching import generate_llm_explanation
    import os
    
    static_fallbacks = {
        "en": "Global demand for premium Grade A vanilla beans continues to grow. Proper curing processes multiply the export market value for local farmers.",
        "id": "Permintaan global untuk biji vanili Grade A premium terus meningkat. Proses curing yang tepat melipatgandakan nilai jual ekspor petani lokal."
    }
    fallback_text = static_fallbacks.get(lang, static_fallbacks["en"])
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return {"insight": fallback_text}
        
    system_prompt = (
        "You are a global spice market analyst. Write 1 or 2 sentences highlighting a current trend in the Indonesian vanilla market, "
        "focusing on how grading or curing vanilla beans increases export profits to international markets. "
        "Keep it concise, engaging, and professional."
    )
    if lang == "id":
        system_prompt += " Write the response in professional Indonesian."
    else:
        system_prompt += " Write the response in professional English."
        
    user_prompt = "Highlight the benefits of proper curing and grading for smallholder farmers in NTT, Indonesia, and how it links to premium global demand."
    
    try:
        insight = generate_llm_explanation(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        return {"insight": insight}
    except Exception as e:
        print(f"Failed to generate market insight: {e}")
        return {"insight": fallback_text}
