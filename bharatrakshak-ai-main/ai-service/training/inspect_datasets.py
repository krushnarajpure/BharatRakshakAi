"""Dataset inspection script for Phase 1 dataset evaluation."""
import csv
import os

BASE = "/home/lenovo/projects/bharatrakshak-ai/ai-service/datasets"

def inspect_csv(path, label, max_rows=3):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"Path: {path}")
    print(f"Size: {os.path.getsize(path) / 1024 / 1024:.2f} MB")

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        header = next(reader)
        print(f"Columns ({len(header)}): {header}")
        print(f"\nSample rows:")
        for i, row in enumerate(reader):
            if i >= max_rows:
                break
            print(f"  {row[:8]}{'...' if len(row) > 8 else ''}")

    total = sum(1 for _ in open(path, "r", encoding="utf-8", errors="replace")) - 1
    print(f"\nTotal rows: {total:,}")
    return total

# 1. India Flood Risk
inspect_csv(
    f"{BASE}/prediction/flood_risk_dataset_india.csv",
    "s3programmer/flood-risk-in-india"
)

# 2. Naiyakhalid Flood (large)
inspect_csv(
    f"{BASE}/prediction/flood.csv",
    "naiyakhalid/flood-prediction-dataset (flood.csv)"
)

# 3. Disaster Emergency Response
path3 = f"{BASE}/prediction/disaster_emergency/global_disaster_response_2018_2024.csv"
inspect_csv(path3, "emirhanakku/disaster-and-emergency-response-dataset")

# Unique disaster types
types = set()
with open(path3, "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        types.add(row["disaster_type"])
print(f"\nUnique disaster types: {sorted(types)}")

# 4. Medical Triage (SOS candidate)
inspect_csv(
    f"{BASE}/sos/medical_triage/synthetic_medical_triage.csv",
    "emirhanakku/synthetic-medical-triage-priority-dataset"
)

print("\n" + "="*60)
print("  DATASET COMPARISON SUMMARY")
print("="*60)
print("""
DISASTER PREDICTION - Top Candidates:
  1. s3programmer/flood-risk-in-india
     ✅ India-specific, weather features (rainfall, temp, humidity, river level, elevation)
     ✅ Binary classification (Flood Occurred: 0/1)
     ✅ 10,000 rows, clean CSV
     ✅ Geo-coordinates (lat/lon)
     ❌ Only flood, no cyclone/heatwave/landslide

  2. naiyakhalid/flood-prediction-dataset
     ✅ Large dataset (50K rows + 1.1M train)
     ❌ Synthetic scores (MonsoonIntensity, Deforestation) - not raw weather
     ❌ Flood probability only, no multi-class disaster

  3. emirhanakku/disaster-and-emergency-response-dataset
     ✅ 50,000 rows
     ✅ Multi-disaster types (flood, earthquake, cyclone, etc.)
     ✅ Severity index, casualties, response time
     ❌ No raw weather features (rainfall, temp, humidity)
     ❌ Global, not India-specific

SOS PRIORITY:
  ❌ emirhanakku/synthetic-medical-triage: Medical vitals only, no disaster text
  ❌ No suitable disaster SOS priority dataset found on Kaggle
  → NEED: Generate synthetic disaster SOS dataset

DAMAGE DETECTION:
  🔄 rupankarmajumdar/disaster-response-object-detection-dataset (downloading...)
     ✅ 977MB, YOLO-format expected
     ✅ Disaster-specific object detection
     ✅ 220 downloads, usability 1.0
""")
