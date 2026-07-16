import os
import joblib
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")
model_path = os.path.join(MODEL_DIR, "grading_model.pkl")
cols_path = os.path.join(MODEL_DIR, "feature_columns.pkl")

model = None
feature_columns = None

if os.path.exists(model_path) and os.path.exists(cols_path):
    try:
        model = joblib.load(model_path)
        feature_columns = joblib.load(cols_path)
    except Exception as e:
        print(f"Error loading ML model: {e}")

def get_harvest_metrics(days_since_pollination: int):
    if days_since_pollination < 210:
        return "Too Early", 0
    elif days_since_pollination < 240:
        return "Approaching Maturity", 1
    elif 240 <= days_since_pollination <= 270:
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
    if sun_drying_duration_days < 10:
        drying_score = 0
    elif sun_drying_duration_days < 15:
        drying_score = 1
    elif 15 <= sun_drying_duration_days <= 35:
        drying_score = 2
    elif 35 < sun_drying_duration_days <= 45:
        drying_score = 1
    else:
        drying_score = 0
        
    conditioning_score = 0
    if conditioning_duration_days >= 45:
        conditioning_score = 2
    elif conditioning_duration_days >= 20:
        conditioning_score = 1
    else:
        conditioning_score = 0
        
    recs = []
    if harvest_score < 2:
        recs.append("Wait for flower pollination age of 8 to 9 months (240 to 270 days) for optimal vanillin content.")
    if sweating_score < 2:
        recs.append("Maintain sweating for 10 to 15 days (traditional) or 4 to 8 days (controlled).")
    if drying_score < 2:
        recs.append("Keep drying duration within 15 to 35 days — too short (<10 days) or too long (>45 days) prevents optimal vanillin development.")
    if conditioning_score < 2:
        recs.append("Condition in sealed container boxes for at least 45 days for optimal aroma maturation.")
        
    return recs

def predict_grade_and_confidence(
    days_since_pollination: int,
    curing_method: str,
    sweating_duration_days: int,
    sun_drying_duration_days: int,
    conditioning_duration_days: int
) -> tuple[str, float]:
    global model, feature_columns
    
    if model is not None and feature_columns is not None:
        try:
            total_curing_duration_days = (
                sweating_duration_days
                + sun_drying_duration_days
                + conditioning_duration_days
            )
            harvest_deviation_days = abs(days_since_pollination - 240)
            curing_method_terkontrol = 1 if curing_method == "terkontrol" else 0
            
            input_data = {
                "days_since_pollination": [days_since_pollination],
                "sweating_duration_days": [sweating_duration_days],
                "sun_drying_duration_days": [sun_drying_duration_days],
                "conditioning_duration_days": [conditioning_duration_days],
                "total_curing_duration_days": [total_curing_duration_days],
                "harvest_deviation_days": [harvest_deviation_days],
                "curing_method_terkontrol": [curing_method_terkontrol]
            }
            X_new = pd.DataFrame(input_data)
            X_new = X_new[feature_columns]
            
            pred = model.predict(X_new)[0]
            if pred == "A":
                predicted_grade = "Grade A"
            elif pred == "B":
                predicted_grade = "Grade B"
            else:
                predicted_grade = "Low Grade"
            
            prob = model.predict_proba(X_new)[0]
            classes = model.classes_
            pred_idx = list(classes).index(pred)
            confidence = float(prob[pred_idx])
            
            return predicted_grade, float(round(confidence, 2))
        except Exception as e:
            print(f"ML prediction error: {e}, falling back to rules")
            
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
    if sun_drying_duration_days < 10:
        drying_score = 0
    elif sun_drying_duration_days < 15:
        drying_score = 1
    elif 15 <= sun_drying_duration_days <= 35:
        drying_score = 2
    elif 35 < sun_drying_duration_days <= 45:
        drying_score = 1
    else:
        drying_score = 0
        
    conditioning_score = 0
    if conditioning_duration_days >= 45:
        conditioning_score = 2
    elif conditioning_duration_days >= 20:
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
