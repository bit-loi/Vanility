def get_harvest_metrics(days_since_pollination: int):
    if days_since_pollination < 120:
        return "Too Early", 0
    elif days_since_pollination < 210:
        return "Approaching Maturity", 1
    elif days_since_pollination <= 270:
        return "Ideal Maturity", 2
    else:
        return "Overmature", 1

def generate_recommendations(
    days_since_pollination: int,
    curing_method: str,
    sweating_duration_days: int,
    sun_drying_duration_days: int,
    conditioning_duration_days: int
):
    _, harvest_score = get_harvest_metrics(days_since_pollination)
    
    sweating_score = 0
    if sweating_duration_days == 0:
        sweating_score = 0
    elif curing_method == "terkontrol" and 4 <= sweating_duration_days <= 8:
        sweating_score = 2
    elif curing_method == "tradisional" and 10 <= sweating_duration_days <= 15:
        sweating_score = 2
    elif sweating_duration_days > 0:
        sweating_score = 1
        
    drying_score = 0
    if sun_drying_duration_days == 0:
        drying_score = 0
    elif 5 <= sun_drying_duration_days <= 14:
        drying_score = 2
    elif 15 <= sun_drying_duration_days <= 25:
        drying_score = 1
    else:
        drying_score = 0
        
    conditioning_score = 0
    if conditioning_duration_days >= 60:
        conditioning_score = 2
    elif conditioning_duration_days >= 30:
        conditioning_score = 1
    else:
        conditioning_score = 0
        
    recs = []
    if harvest_score < 2:
        recs.append("Wait for flower pollination age of 7 to 9 months for optimal vanillin content.")
    if sweating_score < 2:
        recs.append("Maintain sweating for 10 to 15 days (traditional) or 4 to 8 days (controlled).")
    if drying_score < 2:
        recs.append("Keep drying duration within 5 to 14 days under alternating sun and shade.")
    if conditioning_score < 2:
        recs.append("Condition in sealed container boxes for at least 60 days before selling.")
        
    return recs

def predict_grade_and_confidence(
    days_since_pollination: int,
    curing_method: str,
    sweating_duration_days: int,
    sun_drying_duration_days: int,
    conditioning_duration_days: int
):
    _, harvest_score = get_harvest_metrics(days_since_pollination)
    
    sweating_score = 0
    if sweating_duration_days == 0:
        sweating_score = 0
    elif curing_method == "terkontrol" and 4 <= sweating_duration_days <= 8:
        sweating_score = 2
    elif curing_method == "tradisional" and 10 <= sweating_duration_days <= 15:
        sweating_score = 2
    elif sweating_duration_days > 0:
        sweating_score = 1
        
    drying_score = 0
    if sun_drying_duration_days == 0:
        drying_score = 0
    elif 5 <= sun_drying_duration_days <= 14:
        drying_score = 2
    elif 15 <= sun_drying_duration_days <= 25:
        drying_score = 1
    else:
        drying_score = 0
        
    conditioning_score = 0
    if conditioning_duration_days >= 60:
        conditioning_score = 2
    elif conditioning_duration_days >= 30:
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
        
    return predicted_grade, float(round(confidence, 2))
