import sys
from pathlib import Path

# Add src/ directory to sys.path for clean imports
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from model import train_and_save_model
from prioritizer import run_prioritization

def main():
    print("\n==============================================")
    print("      Starting AI Test Prioritization Pipeline")
    print("==============================================")

    print("\nStep 1: Training failure prediction model...")
    train_and_save_model()

    print("\nStep 2: Extracting execution features & computing test risk levels...")
    results = run_prioritization()

    print("\n==============================================")
    print("        AI Test Prioritization Results")
    print("==============================================")
    for res in results:
        print(f"Priority {res['priority']}: {res['test_id']} | Risk: {res['risk_level']} | Fail Prob: {res['failure_probability'] * 100:.2f}%")

    print("\nPipeline execution complete.")

if __name__ == "__main__":
    main()
