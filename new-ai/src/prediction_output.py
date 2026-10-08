import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "data" / "adaptive"
OUTPUT_PATH = OUTPUT_DIR / "prioritized_tests.json"

def save_predictions(results):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": str(Path(__file__).stat().st_mtime),
        "tests": results
    }
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"Saved AI prioritization output to: {OUTPUT_PATH}")
