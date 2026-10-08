import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LogisticRegression

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_PATH = MODEL_DIR / "failure_prediction_model.joblib"

def train_and_save_model():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Synthetic seed training dataset spanning diverse test behaviors
    X_train = pd.DataFrame([
        {"execution_count": 10, "failure_count": 0, "avg_duration": 1.2, "recent_failures": 0, "healed_count": 0.0, "last_status": 0},
        {"execution_count": 12, "failure_count": 1, "avg_duration": 1.5, "recent_failures": 0, "healed_count": 0.0, "last_status": 0},
        {"execution_count": 15, "failure_count": 8, "avg_duration": 4.5, "recent_failures": 3, "healed_count": 0.2, "last_status": 1},
        {"execution_count": 20, "failure_count": 15, "avg_duration": 5.2, "recent_failures": 4, "healed_count": 0.5, "last_status": 1},
        {"execution_count": 8,  "failure_count": 0, "avg_duration": 0.9, "recent_failures": 0, "healed_count": 0.0, "last_status": 0},
        {"execution_count": 25, "failure_count": 18, "avg_duration": 6.0, "recent_failures": 5, "healed_count": 0.8, "last_status": 1},
        {"execution_count": 14, "failure_count": 2, "avg_duration": 2.1, "recent_failures": 1, "healed_count": 0.1, "last_status": 0},
        {"execution_count": 18, "failure_count": 12, "avg_duration": 4.8, "recent_failures": 3, "healed_count": 0.4, "last_status": 1},
    ])
    y_train = np.array([0, 0, 1, 1, 0, 1, 0, 1])

    model = LogisticRegression(random_state=42)
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")
    return model

def load_or_train_model():
    if MODEL_PATH.exists():
        try:
            return joblib.load(MODEL_PATH)
        except Exception:
            pass
    return train_and_save_model()

if __name__ == "__main__":
    train_and_save_model()
