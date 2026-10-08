import pandas as pd
from model import load_or_train_model

def prepare_input(execution_count, failure_count, avg_duration, recent_failures, healed_count, last_status):
    features = pd.DataFrame([{
        "execution_count": execution_count,
        "failure_count": failure_count,
        "avg_duration": avg_duration,
        "recent_failures": recent_failures,
        "healed_count": healed_count,
        "last_status": 1 if last_status == "failed" or last_status == 1 else 0
    }])
    return features

def predict_failure(model, features):
    prediction = int(model.predict(features)[0])
    probability = float(model.predict_proba(features)[0][1])
    return prediction, probability

def classify_risk(probability):
    if probability >= 0.70:
        return "HIGH"
    if probability >= 0.40:
        return "MEDIUM"
    return "LOW"
