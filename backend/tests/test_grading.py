from logic.grading import get_harvest_metrics, predict_grade_and_confidence, generate_recommendations

def test_grading_cases():
    grade, conf = predict_grade_and_confidence(
        days_since_pollination=240,
        curing_method="terkontrol",
        sweating_duration_days=6,
        sun_drying_duration_days=10,
        conditioning_duration_days=65
    )
    print("Case 1 Grade:", grade, "Confidence:", conf)
    assert grade in ["Grade A", "Grade B", "Low Grade"]

    grade, conf = predict_grade_and_confidence(
        days_since_pollination=100,
        curing_method="tradisional",
        sweating_duration_days=12,
        sun_drying_duration_days=10,
        conditioning_duration_days=60
    )
    print("Case 2 Grade (Early):", grade, "Confidence:", conf)
    assert grade == "Low Grade"

    grade, conf = predict_grade_and_confidence(
        days_since_pollination=240,
        curing_method="tradisional",
        sweating_duration_days=2,
        sun_drying_duration_days=2,
        conditioning_duration_days=10
    )
    print("Case 3 Grade (Poor Curing):", grade, "Confidence:", conf)
    assert grade in ["Grade B", "Low Grade"]

    status, score = get_harvest_metrics(240)
    assert status == "Ideal Maturity"
    assert score == 2

    recs = generate_recommendations(
        days_since_pollination=240,
        curing_method="tradisional",
        sweating_duration_days=2,
        sun_drying_duration_days=2,
        conditioning_duration_days=10
    )
    print("Case 5 Recs:", recs)
    assert len(recs) > 0

    print("All unit tests passed successfully!")

if __name__ == "__main__":
    test_grading_cases()
