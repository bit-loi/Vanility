import os
import httpx

# Task 1: Seed Data for 8-10 realistic export buyers
BUYERS = [
    {
        "id": 1,
        "company_name": "Antarctica Premium Ice Cream",
        "country": "United States",
        "industry": "Premium Ice Cream",
        "required_grade": "Grade A",
        "min_quantity_kg": 10.0,
        "max_quantity_kg": 150.0,
        "preferred_origin": "NTT",
        "description": "Artisanal gourmet ice cream brand seeking high-vanillin content Grade A pods from East Nusa Tenggara.",
        "contact_email": "sourcing@antarctica-creams.com"
    },
    {
        "id": 2,
        "company_name": "EuroFlavours GmbH",
        "country": "Germany",
        "industry": "Food Flavoring",
        "required_grade": "Grade B",
        "min_quantity_kg": 50.0,
        "max_quantity_kg": 500.0,
        "preferred_origin": "Minahasa",
        "description": "Large-scale European food ingredient supplier sourcing Grade B curing batches for industrial extraction.",
        "contact_email": "import@euroflavours.de"
    },
    {
        "id": 3,
        "company_name": "Nippon Extract Co.",
        "country": "Japan",
        "industry": "Extract Producer",
        "required_grade": "Grade A",
        "min_quantity_kg": 30.0,
        "max_quantity_kg": 200.0,
        "preferred_origin": "Flores",
        "description": "Premium Japanese botanical extraction house focused on organic single-origin Indonesian vanilla.",
        "contact_email": "vanilla-team@nippon-extract.co.jp"
    },
    {
        "id": 4,
        "company_name": "Le Boulangerie Artisan",
        "country": "France",
        "industry": "Bakery",
        "required_grade": "Grade B",
        "min_quantity_kg": 5.0,
        "max_quantity_kg": 30.0,
        "preferred_origin": "NTT",
        "description": "French pastry chain looking for organic, high-moisture gourmet vanilla pods for their signature baking.",
        "contact_email": "chef.dubois@leboulangerie.fr"
    },
    {
        "id": 5,
        "company_name": "Sunda Extractives",
        "country": "Indonesia",
        "industry": "Extract Producer",
        "required_grade": "Grade B",
        "min_quantity_kg": 100.0,
        "max_quantity_kg": 1000.0,
        "preferred_origin": "NTB",
        "description": "Domestic flavor manufacturer processing vanilla pods into alcohol-free extracts for export markets.",
        "contact_email": "supply@sunda-extracts.co.id"
    },
    {
        "id": 6,
        "company_name": "Sweet Treats Ltd",
        "country": "United Kingdom",
        "industry": "Bakery",
        "required_grade": "Grade A",
        "min_quantity_kg": 10.0,
        "max_quantity_kg": 50.0,
        "preferred_origin": "Bali",
        "description": "High-end confectionery producer in London specializing in vanilla-infused organic chocolates.",
        "contact_email": "sourcing@sweettreats.co.uk"
    },
    {
        "id": 7,
        "company_name": "Global Spice Trade",
        "country": "Singapore",
        "industry": "Food Flavoring",
        "required_grade": "Low Grade",
        "min_quantity_kg": 200.0,
        "max_quantity_kg": 2000.0,
        "preferred_origin": "NTT",
        "description": "Commodity spice trader supplying discount bulk ingredients across Southeast Asia. Flexible on quality.",
        "contact_email": "spice.desk@globalspicetrade.sg"
    },
    {
        "id": 8,
        "company_name": "Aroma Craft Co.",
        "country": "Australia",
        "industry": "Premium Ice Cream",
        "required_grade": "Grade A",
        "min_quantity_kg": 25.0,
        "max_quantity_kg": 100.0,
        "preferred_origin": "Ende",
        "description": "Australian organic dairy producer requesting direct-trade premium vanilla pods from Ende, Flores.",
        "contact_email": "directtrade@aromacraft.com.au"
    }
]

# Task 2: Rule-Based Matching Engine
def score_buyer_compatibility(batch: dict, buyer: dict) -> int:
    score = 0
    batch_grade = batch.get("predicted_grade", "Low Grade")
    batch_qty = batch.get("quantity_kg_dry_estimate", 0.0)
    batch_region = batch.get("location_region", "")

    # 1. Grade match (+40 exact, +15 close A<->B)
    buyer_grade = buyer["required_grade"]
    if batch_grade == buyer_grade:
        score += 40
    elif (batch_grade == "Grade A" and buyer_grade == "Grade B") or (batch_grade == "Grade B" and buyer_grade == "Grade A"):
        score += 15

    # 2. Quantity range fit (+30)
    if buyer["min_quantity_kg"] <= batch_qty <= buyer["max_quantity_kg"]:
        score += 30

    # 3. Origin preference match (+20)
    # Check if preferred origin is a substring of batch region (case-insensitive)
    buyer_origin = buyer["preferred_origin"].lower()
    if buyer_origin in batch_region.lower() or batch_region.lower() in buyer_origin:
        score += 20

    # 4. Industry fit check (+10)
    # Map industries to logical grade profiles
    industry_fit = False
    buyer_ind = buyer["industry"]
    if buyer_ind in ["Premium Ice Cream", "Extract Producer"] and batch_grade == "Grade A":
        industry_fit = True
    elif buyer_ind in ["Bakery"] and batch_grade == "Grade B":
        industry_fit = True
    elif buyer_ind in ["Food Flavoring"] and batch_grade == "Low Grade":
        industry_fit = True

    if industry_fit:
        score += 10

    return score

def match_buyers_for_batch(batch: dict) -> list[dict]:
    recommendations = []
    for buyer in BUYERS:
        score = score_buyer_compatibility(batch, buyer)
        recommendations.append({
            "buyer": buyer,
            "compatibility_score": score
        })
    # Sort descending by score
    recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return recommendations[:3]  # Return top 3 matches

# Task 3: LLM Export Advisor (OpenRouter Integration)
def generate_llm_explanation(system_prompt: str, user_prompt: str, model: str = "nvidia/nemotron-3-nano-30b-a3b:free") -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("OPENROUTER_API_KEY environment variable is not set. Skipping LLM request.")
        raise ValueError("Missing API Key")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vanility.vercel.app",  # Site URL for OpenRouter ranking
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "reasoning": {"enabled": False}
    }

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        choices = data.get("choices", [])
        if choices and len(choices) > 0:
            return choices[0]["message"]["content"].strip()
    
    raise ValueError("Empty response from LLM")

def get_advisor_explanation(batch: dict, buyer_match: dict, lang: str = "en") -> str:
    buyer = buyer_match["buyer"]
    score = buyer_match["compatibility_score"]

    # Localized static fallbacks
    static_fallbacks = {
        "en": f"This buyer is a strong export match ({score}% compatibility) because your {batch.get('predicted_grade', 'custom')} vanilla batch aligns with their grade requirements. The batch dry quantity ({batch.get('quantity_kg_dry_estimate', 0.0)} kg) also fits their demand range of {buyer['min_quantity_kg']} - {buyer['max_quantity_kg']} kg.",
        "id": f"Pembeli ini sangat cocok ({score}% kompatibilitas) karena batch vanili Anda yang bermutu {batch.get('predicted_grade', 'kustom')} memenuhi standar mereka. Kuantitas kering ({batch.get('quantity_kg_dry_estimate', 0.0)} kg) juga berada dalam batas permintaan mereka ({buyer['min_quantity_kg']} - {buyer['max_quantity_kg']} kg)."
    }
    fallback_text = static_fallbacks.get(lang, static_fallbacks["en"])

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return fallback_text

    # Construct prompt contexts
    system_prompt = (
        "You are an expert Indonesian vanilla export consultant advising local farmers on buyer matching. "
        "Strict rule: ONLY explain the data provided. DO NOT make any outside assumptions or invent numbers not in the input. "
        "Keep your response strictly to 1 or 2 short paragraphs (~60-100 words). "
    )
    if lang == "id":
        system_prompt += "Write your explanation in professional Indonesian."
    else:
        system_prompt += "Write your explanation in professional English."

    user_prompt = (
        f"Vanilla Batch Info:\n"
        f"- Location Origin: {batch.get('location_region', 'Unknown')}\n"
        f"- Predicted Grade: {batch.get('predicted_grade', 'Low Grade')}\n"
        f"- Dry Quantity: {batch.get('quantity_kg_dry_estimate', 0.0)} kg\n"
        f"- Curing Method: {batch.get('curing_method', 'traditional')}\n\n"
        f"Export Buyer Info:\n"
        f"- Company: {buyer['company_name']} ({buyer['country']})\n"
        f"- Required Grade: {buyer['required_grade']}\n"
        f"- Quantity Range: {buyer['min_quantity_kg']} to {buyer['max_quantity_kg']} kg\n"
        f"- Preferred Origin: {buyer['preferred_origin']}\n"
        f"- Industry Profile: {buyer['industry']} ({buyer['description']})\n\n"
        f"Matching Compatibility Score: {score}%\n\n"
        f"Explain in a supportive tone why this buyer is matched and what benefit they get."
    )

    # Attempt primary model
    try:
        return generate_llm_explanation(system_prompt, user_prompt, model="nvidia/nemotron-3-nano-30b-a3b:free")
    except Exception as e:
        print(f"OpenRouter primary model failed: {e}. Trying fallback model...")
        # Attempt fallback model
        try:
            return generate_llm_explanation(system_prompt, user_prompt, model="nvidia/nemotron-nano-9b-v2:free")
        except Exception as e2:
            print(f"OpenRouter fallback model failed: {e2}. Returning static translation.")
            return fallback_text
