"""
Phase 2: SOS Priority Dataset Preprocessing & EDA
===================================================
Preprocesses the synthetic SOS dataset: NLP text processing,
TF-IDF vectorization, feature engineering, and class balancing.
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
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
import re
import joblib
from datetime import datetime

SEED = 42
np.random.seed(SEED)

BASE = "/home/lenovo/projects/bharatrakshak-ai/ai-service"
REPORT_DIR = os.path.join(BASE, "reports", "eda")
PROCESSED_DIR = os.path.join(BASE, "datasets", "processed")

# ─── 1. Load Data ─────────────────────────────────────────────────────────────
print("=" * 60)
print("  SOS PRIORITY PREPROCESSING")
print("=" * 60)

df = pd.read_csv(os.path.join(PROCESSED_DIR, "sos_priority_dataset.csv"))
print(f"\nLoaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"\nPriority distribution:")
print(df["priority"].value_counts().to_string())

# ─── 2. NLP Preprocessing ─────────────────────────────────────────────────────
print("\n  NLP Preprocessing...")

def clean_text(text):
    """Clean and normalize emergency text."""
    text = str(text).lower()
    text = re.sub(r'[^\w\s!?.,]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df["message_cleaned"] = df["emergency_message"].apply(clean_text)
df["message_length"] = df["emergency_message"].str.len()
df["word_count"] = df["emergency_message"].str.split().str.len()
df["exclamation_count"] = df["emergency_message"].str.count("!")
df["has_urgent"] = df["emergency_message"].str.contains(
    r"URGENT|MAYDAY|SOS|EMERGENCY|NOW|IMMEDIATELY|CRITICAL",
    case=False, regex=True
).astype(int)

print(f"  ✅ Cleaned text, extracted: message_length, word_count, exclamation_count, has_urgent")

# ─── 3. Encode Categorical Features ───────────────────────────────────────────
le_disaster = LabelEncoder()
le_vulnerable = LabelEncoder()
le_location = LabelEncoder()
le_time = LabelEncoder()
le_priority = LabelEncoder()

df["disaster_type_encoded"] = le_disaster.fit_transform(df["disaster_type"])
df["vulnerable_groups_encoded"] = le_vulnerable.fit_transform(df["vulnerable_groups"])
df["location_type_encoded"] = le_location.fit_transform(df["location_type"])
df["time_of_day_encoded"] = le_time.fit_transform(df["time_of_day"])
df["priority_encoded"] = le_priority.fit_transform(df["priority"])

print(f"  ✅ Encoded categoricals")
print(f"  Priority mapping: {dict(zip(le_priority.classes_, range(len(le_priority.classes_))))}")

# ─── 4. TF-IDF Vectorization ──────────────────────────────────────────────────
tfidf = TfidfVectorizer(
    max_features=500,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95,
    stop_words="english",
)
tfidf_matrix = tfidf.fit_transform(df["message_cleaned"])
tfidf_df = pd.DataFrame(tfidf_matrix.toarray(), columns=[f"tfidf_{w}" for w in tfidf.get_feature_names_out()])

print(f"  ✅ TF-IDF: {tfidf_matrix.shape[1]} features from {len(df)} documents")

# ─── 5. Combine Features ──────────────────────────────────────────────────────
structured_features = [
    "people_affected", "medical_emergency", "infrastructure_damage",
    "disaster_type_encoded", "vulnerable_groups_encoded",
    "location_type_encoded", "time_of_day_encoded",
    "message_length", "word_count", "exclamation_count", "has_urgent"
]

X_structured = df[structured_features].copy()
X_structured["medical_emergency"] = X_structured["medical_emergency"].astype(int)
X_structured["infrastructure_damage"] = X_structured["infrastructure_damage"].astype(int)

# Scale structured features
scaler = StandardScaler()
X_structured_scaled = pd.DataFrame(
    scaler.fit_transform(X_structured),
    columns=structured_features
)

# Combine TF-IDF + structured
X_combined = pd.concat([X_structured_scaled.reset_index(drop=True), tfidf_df.reset_index(drop=True)], axis=1)
y = df["priority_encoded"].values

print(f"  ✅ Combined feature vector: {X_combined.shape[1]} features (11 structured + {tfidf_matrix.shape[1]} TF-IDF)")

# ─── 6. Train/Val/Test Split (80/10/10) ───────────────────────────────────────
X_train, X_temp, y_train, y_temp = train_test_split(
    X_combined, y, test_size=0.20, random_state=SEED, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=SEED, stratify=y_temp
)

print(f"\n  Split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
print(f"  Train priority distribution:")
for i, name in enumerate(le_priority.classes_):
    count = (y_train == i).sum()
    print(f"    {name}: {count} ({count/len(y_train)*100:.1f}%)")

# ─── 7. Save Processed Data ───────────────────────────────────────────────────
train_data = X_train.copy()
train_data["priority_encoded"] = y_train
train_data.to_csv(os.path.join(PROCESSED_DIR, "sos_train.csv"), index=False)

val_data = X_val.copy()
val_data["priority_encoded"] = y_val
val_data.to_csv(os.path.join(PROCESSED_DIR, "sos_val.csv"), index=False)

test_data = X_test.copy()
test_data["priority_encoded"] = y_test
test_data.to_csv(os.path.join(PROCESSED_DIR, "sos_test.csv"), index=False)

# Save preprocessors
joblib.dump(tfidf, os.path.join(BASE, "models", "sos_tfidf_vectorizer.joblib"))
joblib.dump(scaler, os.path.join(BASE, "models", "sos_feature_scaler.joblib"))
joblib.dump(le_priority, os.path.join(BASE, "models", "sos_priority_encoder.joblib"))
joblib.dump(le_disaster, os.path.join(BASE, "models", "sos_disaster_encoder.joblib"))

print(f"\n  ✅ Saved sos_train.csv, sos_val.csv, sos_test.csv")
print(f"  ✅ Saved TF-IDF vectorizer, scalers, encoders")

# ─── 8. EDA Visualizations ────────────────────────────────────────────────────
print("\n  Generating EDA plots...")

# Priority distribution
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
df["priority"].value_counts().plot(kind="bar", ax=axes[0], color=["#f44336", "#ff9800", "#2196f3", "#4caf50"])
axes[0].set_title("SOS Priority Distribution")
axes[0].set_ylabel("Count")
axes[0].tick_params(axis='x', rotation=45)

pd.crosstab(df["disaster_type"], df["priority"]).plot(kind="bar", ax=axes[1], stacked=True)
axes[1].set_title("Priority by Disaster Type")
axes[1].set_ylabel("Count")
axes[1].tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "sos_priority_distribution.png"), dpi=150)
plt.close()

# Message length by priority
fig, ax = plt.subplots(figsize=(10, 5))
df.boxplot(column="message_length", by="priority", ax=ax)
ax.set_title("Message Length by Priority")
ax.set_ylabel("Characters")
plt.suptitle("")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "sos_message_length.png"), dpi=150)
plt.close()

# People affected by priority
fig, ax = plt.subplots(figsize=(10, 5))
df.boxplot(column="people_affected", by="priority", ax=ax)
ax.set_title("People Affected by Priority")
ax.set_ylabel("Count")
plt.suptitle("")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "sos_people_affected.png"), dpi=150)
plt.close()

# Feature importance heatmap (correlation with priority)
fig, ax = plt.subplots(figsize=(10, 6))
corr_with_priority = df[structured_features + ["priority_encoded"]].corr()["priority_encoded"].drop("priority_encoded").sort_values()
corr_with_priority.plot(kind="barh", ax=ax, color=["#f44336" if v < 0 else "#4caf50" for v in corr_with_priority])
ax.set_title("Feature Correlation with Priority")
ax.set_xlabel("Pearson Correlation")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "sos_feature_correlation.png"), dpi=150)
plt.close()

print("  ✅ sos_priority_distribution.png")
print("  ✅ sos_message_length.png")
print("  ✅ sos_people_affected.png")
print("  ✅ sos_feature_correlation.png")
print("\n  SOS PREPROCESSING COMPLETE")
