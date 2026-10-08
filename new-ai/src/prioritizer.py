from model import load_or_train_model
from predict import prepare_input, predict_failure, classify_risk
from feature_builder import build_features
from prediction_output import save_predictions

def prioritize_test_suite(test_cases):
    model = load_or_train_model()
    results = []

    for tc in test_cases:
        features = prepare_input(
            execution_count=tc["execution_count"],
            failure_count=tc["failure_count"],
            avg_duration=tc["avg_duration"],
            recent_failures=tc["recent_failures"],
            healed_count=tc["healed_count"],
            last_status=tc["last_status"]
        )
        prediction, probability = predict_failure(model, features)
        risk_level = classify_risk(probability)

        results.append({
            "test_id": tc["test_id"],
            "failure_probability": round(probability, 4),
            "risk_level": risk_level,
            "prediction": prediction
        })

    # Sort tests by failure probability descending (highest risk first)
    results.sort(key=lambda x: x["failure_probability"], reverse=True)

    for priority, res in enumerate(results, start=1):
        res["priority"] = priority

    return results

def run_prioritization():
    features_df = build_features()
    test_cases = features_df.to_dict("records")
    results = prioritize_test_suite(test_cases)
    save_predictions(results)
    return results

if __name__ == "__main__":
    run_prioritization()
