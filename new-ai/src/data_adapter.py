import sqlite3
import pandas as pd
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = PROJECT_ROOT.parent

DB_PATH = WORKSPACE_ROOT / "new-backend" / "data" / "db" / "execution-history.db"
CSV_PATH = PROJECT_ROOT / "data" / "raw" / "execution_history.csv"

def load_execution_history():
    """Loads execution history from SQLite or fallback CSV."""
    if DB_PATH.exists():
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM execution_history ORDER BY id ASC")
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            if rows:
                return rows
        except Exception as e:
            print(f"Warning reading SQLite DB ({e}), trying CSV fallback...")

    if CSV_PATH.exists():
        df = pd.read_csv(CSV_PATH)
        return df.to_dict(orient="records")

    return []
