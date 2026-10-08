import pandas as pd
from data_adapter import load_execution_history

FEATURE_COLUMNS = [
    "execution_count",
    "failure_count",
    "avg_duration",
    "recent_failures",
    "healed_count",
    "last_status",
]

DEFAULT_TEST_IDS = [
    "TC-WEB-001",
    "TC-WEB-002",
    "TC-WEB-003",
    "TC-WEB-004",
    "TC-WEB-005",
    "TC-WEB-006",
    "TC-WEB-007",
    "TC-WEB-008",
]

def build_features():
    """Builds AI features for each test case from execution history."""
    rows = load_execution_history()

    if not rows:
        # Default baseline feature set for fresh setup
        records = []
        for tid in DEFAULT_TEST_IDS:
            records.append({
                "test_id": tid,
                "execution_count": 1,
                "failure_count": 1 if tid == "TC-WEB-008" else 0,
                "avg_duration": 1.5,
                "recent_failures": 1 if tid == "TC-WEB-008" else 0,
                "healed_count": 1.0 if tid == "TC-WEB-007" else 0.0,
                "last_status": "failed" if tid == "TC-WEB-008" else "passed",
            })
        return pd.DataFrame(records)

    df = pd.DataFrame(rows)
    records = []

    for test_id, group in df.groupby("testId", sort=False):
        exec_count = len(group)
        statuses = group["status"].astype(str).str.lower().tolist()
        fail_count = sum(1 for s in statuses if s == "failed")
        durations = pd.to_numeric(group["duration"], errors="coerce").fillna(1.0)
        avg_dur = round(float(durations.mean()), 3)

        recent_statuses = statuses[-5:]
        recent_fails = sum(1 for s in recent_statuses if s == "failed")

        healed_vals = pd.to_numeric(group["healed"], errors="coerce").fillna(0)
        healed_cnt = round(float(healed_vals.mean()), 3)

        last_st = "passed"
        for s in reversed(statuses):
            if s in ("passed", "failed"):
                last_st = s
                break

        records.append({
            "test_id": test_id,
            "execution_count": exec_count,
            "failure_count": fail_count,
            "avg_duration": avg_dur,
            "recent_failures": recent_fails,
            "healed_count": healed_cnt,
            "last_status": last_st,
        })

    return pd.DataFrame(records)

def prepare_model_features(feature_df):
    model_df = feature_df[FEATURE_COLUMNS].copy()
    model_df["last_status"] = model_df["last_status"].map({"passed": 0, "failed": 1}).fillna(0)
    return model_df
