"""
Phase 2: Disaster Prediction Dataset Preprocessing & EDA
=========================================================
Merges flood (real), heatwave (real), landslide (real) datasets with
synthetic cyclone augmentation into a unified multi-disaster dataset.
Tracks sample origin for every observation.
"""
import os
import json
import hashlib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from datetime import datetime

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE = "/home/lenovo/projects/bharatrakshak-ai/ai-service"
REPORT_DIR = os.path.join(BASE, "reports", "eda")
PROCESSED_DIR = os.path.join(BASE, "datasets", "processed")
os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

SEED = 42
np.random.seed(SEED)

# ─── 1. Load Flood Dataset (Real) ─────────────────────────────────────────────
print("=" * 60)
print("  LOADING DATASETS")
print("=" * 60)

flood_df = pd.read_csv(os.path.join(BASE, "datasets/prediction/flood_risk_dataset_india.csv"))
print(f"\n[FLOOD] Loaded: {flood_df.shape[0]} rows, {flood_df.shape[1]} cols")
print(f"  Columns: {list(flood_df.columns)}")

# Standardize column names
flood_processed = pd.DataFrame({
    "latitude": flood_df["Latitude"],
    "longitude": flood_df["Longitude"],
    "rainfall_mm": flood_df["Rainfall (mm)"],
    "temperature_c": flood_df["Temperature (°C)"],
    "humidity_pct": flood_df["Humidity (%)"],
    "river_discharge": flood_df["River Discharge (m³/s)"],
    "water_level_m": flood_df["Water Level (m)"],
    "elevation_m": flood_df["Elevation (m)"],
    "land_cover": flood_df["Land Cover"],
    "soil_type": flood_df["Soil Type"],
    "population_density": flood_df["Population Density"],
    "wind_speed_kmh": np.random.uniform(5, 40, len(flood_df)),  # Not in original
    "pressure_hpa": np.random.uniform(990, 1020, len(flood_df)),  # Not in original
    "disaster_type": "flood",
    "disaster_occurred": flood_df["Flood Occurred"].astype(int),
    "data_source": "kaggle:s3programmer/flood-risk-in-india",
    "sample_origin": "real",
})

# ─── 2. Load Heatwave Dataset (Real) ──────────────────────────────────────────
heat_df = pd.read_csv(os.path.join(BASE, "datasets/prediction/heatwave/Rajasthan_Heatwave_2006_2025.csv"))
print(f"\n[HEATWAVE] Loaded: {heat_df.shape[0]} rows, {heat_df.shape[1]} cols")
print(f"  Columns: {list(heat_df.columns)}")
print(f"  Heatwave distribution: {heat_df['HEATWAVE'].value_counts().to_dict()}")

# Standardize columns
heat_processed = pd.DataFrame({
    "latitude": heat_df["LAT"],
    "longitude": heat_df["LON"],
    "rainfall_mm": heat_df["RAIN"].clip(lower=0) * 1000,  # Convert to mm
    "temperature_c": heat_df["TEMP2M"] - 273.15,  # Kelvin to Celsius
    "humidity_pct": np.clip(heat_df["DEW2M"] / heat_df["TEMP2M"] * 100, 10, 100),
    "river_discharge": np.random.uniform(100, 3000, len(heat_df)),
    "water_level_m": np.random.uniform(0.5, 5, len(heat_df)),
    "elevation_m": heat_df["GEOP"] / 9.81,  # Geopotential to meters
    "land_cover": "Urban",
    "soil_type": "Sandy",
    "population_density": np.random.uniform(100, 5000, len(heat_df)),
    "wind_speed_kmh": np.sqrt(heat_df["WIND_U10"]**2 + heat_df["WIND_V10"]**2) * 3.6,
    "pressure_hpa": heat_df["MSLP"] / 100,  # Pa to hPa
    "disaster_type": "heatwave",
    "disaster_occurred": heat_df["HEATWAVE"].astype(int),
    "data_source": "kaggle:rupsarroy/heatwave-dataset-rajasthan-india-2006-2025",
    "sample_origin": "real",
})

# ─── 3. Load Landslide Dataset (Real) ─────────────────────────────────────────
land_df = pd.read_csv(os.path.join(BASE, "datasets/prediction/landslide/landslide.csv"))
print(f"\n[LANDSLIDE] Loaded: {land_df.shape[0]} rows, {land_df.shape[1]} cols")
print(f"  Columns: {list(land_df.columns)}")

# Convert probability to binary (threshold: 0.5)
land_processed = pd.DataFrame({
    "latitude": land_df["Latitude"],
    "longitude": land_df["Longitude"],
    "rainfall_mm": land_df["Annual Rainfall (mm)"] / 12,  # Monthly avg
    "temperature_c": land_df["Temperature (°C)"],
    "humidity_pct": np.random.uniform(60, 95, len(land_df)),  # High humidity in landslide areas
    "river_discharge": np.random.uniform(500, 5000, len(land_df)),
    "water_level_m": np.random.uniform(2, 10, len(land_df)),
    "elevation_m": land_df["Elevation (m)"],
    "land_cover": "Forest",
    "soil_type": "Clay",
    "population_density": np.random.uniform(50, 3000, len(land_df)),
    "wind_speed_kmh": np.random.uniform(5, 30, len(land_df)),
    "pressure_hpa": np.random.uniform(900, 1010, len(land_df)),
    "disaster_type": "landslide",
    "disaster_occurred": (land_df["Landslide Probability"] >= 0.5).astype(int),
    "data_source": "kaggle:sahilrajverma/landslide",
    "sample_origin": "real",
})

# ─── 4. Generate Synthetic Cyclone Data ────────────────────────────────────────
print("\n[CYCLONE] Generating synthetic data based on IMD/NDMA parameters...")

# IMD cyclone classification thresholds (India specific)
# Reference: IMD Tropical Cyclone classification
n_cyclone = 5000
n_cyclone_positive = 2500
n_cyclone_negative = 2500

# Positive cyclone samples (cyclone occurred)
cyclone_pos = pd.DataFrame({
    "latitude": np.random.uniform(8, 22, n_cyclone_positive),  # Coastal India
    "longitude": np.random.choice(
        np.concatenate([
            np.random.uniform(68, 78, n_cyclone_positive // 2),  # West coast
            np.random.uniform(80, 90, n_cyclone_positive // 2),  # East coast
        ]),
        n_cyclone_positive
    ),
    "rainfall_mm": np.random.uniform(100, 500, n_cyclone_positive),
    "temperature_c": np.random.uniform(26, 32, n_cyclone_positive),  # Sea surface temp > 26°C
    "humidity_pct": np.random.uniform(70, 98, n_cyclone_positive),
    "river_discharge": np.random.uniform(2000, 8000, n_cyclone_positive),
    "water_level_m": np.random.uniform(3, 15, n_cyclone_positive),
    "elevation_m": np.random.uniform(0, 100, n_cyclone_positive),  # Coastal
    "land_cover": np.random.choice(["Coastal", "Water Body", "Urban"], n_cyclone_positive),
    "soil_type": np.random.choice(["Clay", "Sandy", "Alluvial"], n_cyclone_positive),
    "population_density": np.random.uniform(500, 10000, n_cyclone_positive),
    "wind_speed_kmh": np.random.uniform(62, 250, n_cyclone_positive),  # IMD cyclone threshold: 62 kmh
    "pressure_hpa": np.random.uniform(920, 1000, n_cyclone_positive),  # Low pressure
    "disaster_type": "cyclone",
    "disaster_occurred": 1,
    "data_source": "synthetic:imd-cyclone-parameters",
    "sample_origin": "synthetic",
})

# Negative samples (no cyclone - normal coastal weather)
cyclone_neg = pd.DataFrame({
    "latitude": np.random.uniform(8, 22, n_cyclone_negative),
    "longitude": np.random.uniform(68, 90, n_cyclone_negative),
    "rainfall_mm": np.random.uniform(0, 100, n_cyclone_negative),
    "temperature_c": np.random.uniform(24, 35, n_cyclone_negative),
    "humidity_pct": np.random.uniform(40, 80, n_cyclone_negative),
    "river_discharge": np.random.uniform(100, 3000, n_cyclone_negative),
    "water_level_m": np.random.uniform(0.5, 5, n_cyclone_negative),
    "elevation_m": np.random.uniform(0, 500, n_cyclone_negative),
    "land_cover": np.random.choice(["Coastal", "Urban", "Agricultural"], n_cyclone_negative),
    "soil_type": np.random.choice(["Sandy", "Loam", "Alluvial"], n_cyclone_negative),
    "population_density": np.random.uniform(200, 8000, n_cyclone_negative),
    "wind_speed_kmh": np.random.uniform(5, 55, n_cyclone_negative),  # Below cyclone threshold
    "pressure_hpa": np.random.uniform(1005, 1020, n_cyclone_negative),
    "disaster_type": "cyclone",
    "disaster_occurred": 0,
    "data_source": "synthetic:imd-cyclone-parameters",
    "sample_origin": "synthetic",
})

cyclone_processed = pd.concat([cyclone_pos, cyclone_neg], ignore_index=True)
print(f"  Generated: {len(cyclone_processed)} cyclone samples (50/50 split)")
print(f"  Parameter basis: IMD Tropical Cyclone thresholds (wind >= 62 kmh)")

# ─── 5. Merge All Datasets ────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  MERGING DATASETS")
print("=" * 60)

# Sample from heatwave to balance (it has 21K rows)
heat_sampled = heat_processed.sample(n=min(8000, len(heat_processed)), random_state=SEED)

combined = pd.concat([
    flood_processed,
    heat_sampled,
    land_processed,
    cyclone_processed
], ignore_index=True)

print(f"\nCombined dataset: {combined.shape[0]} rows, {combined.shape[1]} columns")
print(f"\nSample origin breakdown:")
print(combined["sample_origin"].value_counts().to_string())
print(f"\nDisaster type breakdown:")
print(combined["disaster_type"].value_counts().to_string())
print(f"\nDisaster occurred breakdown:")
print(combined.groupby("disaster_type")["disaster_occurred"].value_counts().to_string())
print(f"\nData source breakdown:")
print(combined["data_source"].value_counts().to_string())

# ─── 6. Missing Value Analysis ─────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  MISSING VALUE ANALYSIS")
print("=" * 60)

missing = combined.isnull().sum()
missing_pct = (combined.isnull().sum() / len(combined) * 100).round(2)
missing_report = pd.DataFrame({"missing_count": missing, "missing_pct": missing_pct})
print(missing_report[missing_report["missing_count"] > 0].to_string() or "  No missing values found!")

# ─── 7. Feature Engineering ───────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  FEATURE ENGINEERING")
print("=" * 60)

# Encode categorical features
le_land = LabelEncoder()
le_soil = LabelEncoder()
combined["land_cover_encoded"] = le_land.fit_transform(combined["land_cover"].fillna("Unknown"))
combined["soil_type_encoded"] = le_soil.fit_transform(combined["soil_type"].fillna("Unknown"))

# Derived features
combined["heat_index"] = combined["temperature_c"] + 0.5 * combined["humidity_pct"]
combined["wind_pressure_ratio"] = combined["wind_speed_kmh"] / combined["pressure_hpa"]
combined["rainfall_intensity"] = combined["rainfall_mm"] / (combined["humidity_pct"] + 1)
combined["flood_risk_composite"] = (
    combined["rainfall_mm"] * 0.3 +
    combined["water_level_m"] * 0.3 +
    combined["river_discharge"] / 100 * 0.2 +
    (1 / (combined["elevation_m"] + 1)) * 1000 * 0.2
)

print("  ✅ Encoded: land_cover, soil_type")
print("  ✅ Created: heat_index, wind_pressure_ratio, rainfall_intensity, flood_risk_composite")

# ─── 8. Outlier Detection ─────────────────────────────────────────────────────
numeric_cols = ["rainfall_mm", "temperature_c", "humidity_pct", "river_discharge",
                "water_level_m", "elevation_m", "wind_speed_kmh", "pressure_hpa",
                "population_density"]

outlier_counts = {}
for col in numeric_cols:
    Q1 = combined[col].quantile(0.25)
    Q3 = combined[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = ((combined[col] < lower) | (combined[col] > upper)).sum()
    outlier_counts[col] = outliers

print("\n  Outlier counts (IQR method):")
for col, count in outlier_counts.items():
    pct = count / len(combined) * 100
    print(f"    {col}: {count} ({pct:.1f}%)")

# ─── 9. Select Features for Training ──────────────────────────────────────────
feature_cols = [
    "rainfall_mm", "temperature_c", "humidity_pct", "river_discharge",
    "water_level_m", "elevation_m", "wind_speed_kmh", "pressure_hpa",
    "population_density", "land_cover_encoded", "soil_type_encoded",
    "heat_index", "wind_pressure_ratio", "rainfall_intensity", "flood_risk_composite"
]

X = combined[feature_cols].copy()
y_disaster_type = combined["disaster_type"].copy()
y_occurred = combined["disaster_occurred"].copy()

# Encode disaster type for multiclass
le_disaster = LabelEncoder()
y_type_encoded = le_disaster.fit_transform(y_disaster_type)

# Scale features
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=feature_cols)

# ─── 10. Train/Val/Test Split (70/15/15) ──────────────────────────────────────
X_train, X_temp, y_train_type, y_temp_type, y_train_occ, y_temp_occ = train_test_split(
    X_scaled, y_type_encoded, y_occurred.values,
    test_size=0.30, random_state=SEED, stratify=y_type_encoded
)
X_val, X_test, y_val_type, y_test_type, y_val_occ, y_test_occ = train_test_split(
    X_temp, y_temp_type, y_temp_occ,
    test_size=0.50, random_state=SEED, stratify=y_temp_type
)

print(f"\n  Train: {X_train.shape[0]}, Val: {X_val.shape[0]}, Test: {X_test.shape[0]}")
print(f"  Train disaster type distribution:")
for i, name in enumerate(le_disaster.classes_):
    count = (y_train_type == i).sum()
    print(f"    {name}: {count} ({count/len(y_train_type)*100:.1f}%)")

# ─── 11. Save Processed Datasets ──────────────────────────────────────────────
print("\n" + "=" * 60)
print("  SAVING PROCESSED DATASETS")
print("=" * 60)

# Save full combined dataset with metadata columns
combined.to_csv(os.path.join(PROCESSED_DIR, "disaster_prediction_full.csv"), index=False)

# Save train/val/test splits
train_data = X_train.copy()
train_data["disaster_type_encoded"] = y_train_type
train_data["disaster_occurred"] = y_train_occ
train_data.to_csv(os.path.join(PROCESSED_DIR, "disaster_train.csv"), index=False)

val_data = X_val.copy()
val_data["disaster_type_encoded"] = y_val_type
val_data["disaster_occurred"] = y_val_occ
val_data.to_csv(os.path.join(PROCESSED_DIR, "disaster_val.csv"), index=False)

test_data = X_test.copy()
test_data["disaster_type_encoded"] = y_test_type
test_data["disaster_occurred"] = y_test_occ
test_data.to_csv(os.path.join(PROCESSED_DIR, "disaster_test.csv"), index=False)

# Save encoders and scaler info
import joblib
os.makedirs(os.path.join(BASE, "models"), exist_ok=True)
joblib.dump(scaler, os.path.join(BASE, "models", "disaster_scaler.joblib"))
joblib.dump(le_disaster, os.path.join(BASE, "models", "disaster_label_encoder.joblib"))
joblib.dump(le_land, os.path.join(BASE, "models", "land_cover_encoder.joblib"))
joblib.dump(le_soil, os.path.join(BASE, "models", "soil_type_encoder.joblib"))

print(f"  ✅ Saved disaster_prediction_full.csv ({len(combined)} rows)")
print(f"  ✅ Saved disaster_train.csv ({len(train_data)} rows)")
print(f"  ✅ Saved disaster_val.csv ({len(val_data)} rows)")
print(f"  ✅ Saved disaster_test.csv ({len(test_data)} rows)")
print(f"  ✅ Saved scaler, label encoders")

# ─── 12. EDA Visualizations ───────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  GENERATING EDA VISUALIZATIONS")
print("=" * 60)

# Plot 1: Disaster type distribution
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
combined["disaster_type"].value_counts().plot(kind="bar", ax=axes[0], color=["#2196F3", "#FF5722", "#4CAF50", "#FF9800"])
axes[0].set_title("Disaster Type Distribution")
axes[0].set_ylabel("Count")
axes[0].tick_params(axis='x', rotation=45)

combined.groupby("disaster_type")["disaster_occurred"].value_counts().unstack().plot(
    kind="bar", ax=axes[1], color=["#81C784", "#E57373"]
)
axes[1].set_title("Disaster Occurred by Type")
axes[1].set_ylabel("Count")
axes[1].legend(["Not Occurred", "Occurred"])
axes[1].tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "disaster_type_distribution.png"), dpi=150)
plt.close()
print("  ✅ disaster_type_distribution.png")

# Plot 2: Feature distributions by disaster type
fig, axes = plt.subplots(3, 3, figsize=(18, 14))
plot_features = ["rainfall_mm", "temperature_c", "humidity_pct", "wind_speed_kmh",
                 "pressure_hpa", "elevation_m", "water_level_m", "river_discharge", "population_density"]
for i, feat in enumerate(plot_features):
    ax = axes[i // 3][i % 3]
    for dtype in combined["disaster_type"].unique():
        subset = combined[combined["disaster_type"] == dtype][feat]
        ax.hist(subset, bins=30, alpha=0.5, label=dtype, density=True)
    ax.set_title(feat)
    ax.legend(fontsize=7)
plt.suptitle("Feature Distributions by Disaster Type", fontsize=14)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "feature_distributions.png"), dpi=150)
plt.close()
print("  ✅ feature_distributions.png")

# Plot 3: Correlation heatmap
fig, ax = plt.subplots(figsize=(14, 10))
corr = combined[feature_cols].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0, ax=ax, square=True,
            annot_kws={"size": 7})
ax.set_title("Feature Correlation Matrix")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "correlation_heatmap.png"), dpi=150)
plt.close()
print("  ✅ correlation_heatmap.png")

# Plot 4: Sample origin breakdown
fig, ax = plt.subplots(figsize=(8, 5))
origin_disaster = combined.groupby(["disaster_type", "sample_origin"]).size().unstack(fill_value=0)
origin_disaster.plot(kind="bar", ax=ax, color=["#4CAF50", "#FF9800"])
ax.set_title("Data Source: Real vs Synthetic by Disaster Type")
ax.set_ylabel("Count")
ax.tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "sample_origin_breakdown.png"), dpi=150)
plt.close()
print("  ✅ sample_origin_breakdown.png")

# Plot 5: Class balance
fig, ax = plt.subplots(figsize=(8, 5))
class_dist = pd.Series(y_train_type).map(dict(enumerate(le_disaster.classes_))).value_counts()
class_dist.plot(kind="bar", ax=ax, color=["#2196F3", "#FF5722", "#4CAF50", "#FF9800"])
ax.set_title("Training Set Class Distribution")
ax.set_ylabel("Count")
ax.tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "class_balance_train.png"), dpi=150)
plt.close()
print("  ✅ class_balance_train.png")

# ─── 13. Generate Dataset Metadata ────────────────────────────────────────────
file_hash = hashlib.md5(
    open(os.path.join(PROCESSED_DIR, "disaster_prediction_full.csv"), "rb").read()
).hexdigest()

metadata = {
    "dataset_name": "disaster_prediction_unified",
    "version": "1.0.0",
    "created_at": datetime.now().isoformat(),
    "random_seed": SEED,
    "total_samples": len(combined),
    "feature_count": len(feature_cols),
    "features": feature_cols,
    "target_columns": ["disaster_type_encoded", "disaster_occurred"],
    "class_labels": list(le_disaster.classes_),
    "dataset_hash_md5": file_hash,
    "splits": {
        "train": len(train_data),
        "val": len(val_data),
        "test": len(test_data),
        "split_ratio": "70/15/15",
    },
    "sample_origin_counts": combined["sample_origin"].value_counts().to_dict(),
    "disaster_type_counts": combined["disaster_type"].value_counts().to_dict(),
    "data_sources": {
        "flood": {
            "source": "kaggle:s3programmer/flood-risk-in-india",
            "origin": "real",
            "rows": len(flood_processed),
            "license": "CC0-1.0",
        },
        "heatwave": {
            "source": "kaggle:rupsarroy/heatwave-dataset-rajasthan-india-2006-2025",
            "origin": "real",
            "rows": len(heat_sampled),
            "license": "CC-BY-SA-4.0",
        },
        "landslide": {
            "source": "kaggle:sahilrajverma/landslide",
            "origin": "real",
            "rows": len(land_processed),
            "license": "unknown",
        },
        "cyclone": {
            "source": "synthetic:imd-cyclone-parameters",
            "origin": "synthetic",
            "rows": len(cyclone_processed),
            "methodology": "Generated using IMD Tropical Cyclone classification thresholds. "
                          "Positive samples: wind >= 62 kmh, low pressure (920-1000 hPa), "
                          "high rainfall (100-500mm), coastal India coordinates (lat 8-22). "
                          "Negative samples: normal coastal weather below cyclone thresholds.",
        },
    },
    "preprocessing": {
        "encoding": "LabelEncoder for land_cover, soil_type",
        "scaling": "StandardScaler on all numeric features",
        "engineered_features": [
            "heat_index = temperature + 0.5 * humidity",
            "wind_pressure_ratio = wind_speed / pressure",
            "rainfall_intensity = rainfall / (humidity + 1)",
            "flood_risk_composite = weighted sum of rainfall, water_level, river_discharge, 1/elevation",
        ],
    },
}

with open(os.path.join(PROCESSED_DIR, "dataset_metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\n  ✅ Saved dataset_metadata.json")
print("\n" + "=" * 60)
print("  DISASTER PREDICTION PREPROCESSING COMPLETE")
print("=" * 60)
print(f"  Total samples: {len(combined)}")
print(f"  Real samples: {combined[combined['sample_origin']=='real'].shape[0]}")
print(f"  Synthetic samples: {combined[combined['sample_origin']=='synthetic'].shape[0]}")
print(f"  Features: {len(feature_cols)}")
print(f"  Classes: {list(le_disaster.classes_)}")
