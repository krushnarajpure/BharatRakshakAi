"""
Phase 3: Disaster Risk Prediction — Model Training
====================================================
Trains and compares:
  Approach A: Unified multiclass XGBoost
  Approach B: Separate binary XGBoost per disaster type
Uses Optuna for hyperparameter optimization.
Generates SHAP explanations, evaluation metrics, and comparison report.
"""
import os
import sys
import json
import time
import hashlib
import subprocess
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    precision_recall_curve, average_precision_score
)
from sklearn.calibration import calibration_curve
from sklearn.model_selection import StratifiedKFold, cross_val_score, learning_curve
from datetime import datetime

SEED = 42
np.random.seed(SEED)

BASE = "/home/lenovo/projects/bharatrakshak-ai/ai-service"
PROCESSED_DIR = os.path.join(BASE, "datasets", "processed")
MODEL_DIR = os.path.join(BASE, "models")
REPORT_DIR = os.path.join(BASE, "reports", "model_evaluation", "disaster")
EXPERIMENT_DIR = os.path.join(BASE, "experiments")
os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(EXPERIMENT_DIR, exist_ok=True)

# ─── Load Data ─────────────────────────────────────────────────────────────────
print("=" * 70)
print("  PHASE 3: DISASTER RISK PREDICTION MODEL TRAINING")
print("=" * 70)

train_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_train.csv"))
val_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_val.csv"))
test_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_test.csv"))

feature_cols = [c for c in train_df.columns if c not in ["disaster_type_encoded", "disaster_occurred"]]

X_train = train_df[feature_cols].values
y_train = train_df["disaster_type_encoded"].values
X_val = val_df[feature_cols].values
y_val = val_df["disaster_type_encoded"].values
X_test = test_df[feature_cols].values
y_test = test_df["disaster_type_encoded"].values

le = joblib.load(os.path.join(MODEL_DIR, "disaster_label_encoder.joblib"))
class_names = list(le.classes_)
n_classes = len(class_names)

print(f"  Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")
print(f"  Classes: {class_names}")
print(f"  Features: {feature_cols}")

# Compute dataset hash for experiment tracking
ds_hash = hashlib.md5(
    open(os.path.join(PROCESSED_DIR, "disaster_prediction_full.csv"), "rb").read()
).hexdigest()

# Try to get git hash
try:
    git_hash = subprocess.check_output(
        ["git", "rev-parse", "HEAD"],
        cwd=BASE, stderr=subprocess.DEVNULL
    ).decode().strip()
except Exception:
    git_hash = "not-a-git-repo"


# ════════════════════════════════════════════════════════════════════════════════
#  APPROACH A: UNIFIED MULTICLASS MODEL
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  APPROACH A: UNIFIED MULTICLASS XGBOOST")
print("═" * 70)

# ─── Optuna Hyperparameter Optimization ────────────────────────────────────────
def objective_multiclass(trial):
    params = {
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "n_estimators": trial.suggest_int("n_estimators", 100, 500, step=50),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
        "gamma": trial.suggest_float("gamma", 0, 5),
        "reg_alpha": trial.suggest_float("reg_alpha", 0, 2),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.5, 3),
    }

    model = XGBClassifier(
        **params,
        objective="multi:softprob",
        num_class=n_classes,
        eval_metric="mlogloss",
        random_state=SEED,
        n_jobs=-1,
        verbosity=0,
        early_stopping_rounds=20,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )
    y_pred = model.predict(X_val)
    return f1_score(y_val, y_pred, average="macro")

print("\n  Running Optuna optimization (50 trials)...")
t_optuna_start = time.time()
study_a = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=SEED))
study_a.optimize(objective_multiclass, n_trials=50, show_progress_bar=False)
t_optuna_a = time.time() - t_optuna_start

best_params_a = study_a.best_params
print(f"  Optuna completed in {t_optuna_a:.1f}s")
print(f"  Best trial F1: {study_a.best_value:.4f}")
print(f"  Best params: {json.dumps(best_params_a, indent=2)}")

# ─── Train Final Model A ──────────────────────────────────────────────────────
print("\n  Training final multiclass model...")
t_train_a_start = time.time()
model_a = XGBClassifier(
    **best_params_a,
    objective="multi:softprob",
    num_class=n_classes,
    eval_metric="mlogloss",
    random_state=SEED,
    n_jobs=-1,
    verbosity=0,
    early_stopping_rounds=20,
)
model_a.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False,
)
t_train_a = time.time() - t_train_a_start

# ─── Evaluate Model A on TEST set ─────────────────────────────────────────────
print("\n  Evaluating on TEST set...")
t_infer_start = time.time()
y_pred_a = model_a.predict(X_test)
y_proba_a = model_a.predict_proba(X_test)
t_infer_a = (time.time() - t_infer_start) / len(X_test) * 1000  # ms per sample

metrics_a = {
    "accuracy": accuracy_score(y_test, y_pred_a),
    "precision_macro": precision_score(y_test, y_pred_a, average="macro"),
    "recall_macro": recall_score(y_test, y_pred_a, average="macro"),
    "f1_macro": f1_score(y_test, y_pred_a, average="macro"),
    "roc_auc_ovr": roc_auc_score(y_test, y_proba_a, multi_class="ovr", average="macro"),
    "training_time_s": round(t_train_a, 2),
    "inference_ms_per_sample": round(t_infer_a, 4),
    "optuna_time_s": round(t_optuna_a, 1),
    "n_estimators_used": model_a.best_iteration + 1 if hasattr(model_a, "best_iteration") else best_params_a.get("n_estimators"),
}

print(f"\n  APPROACH A RESULTS (Test Set):")
for k, v in metrics_a.items():
    print(f"    {k}: {v}")
print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_a, target_names=class_names))


# ════════════════════════════════════════════════════════════════════════════════
#  APPROACH B: SEPARATE BINARY MODELS
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  APPROACH B: SEPARATE BINARY XGBOOST MODELS")
print("═" * 70)

# Load full dataset to get disaster_occurred
full_train = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_prediction_full.csv"))
# We need to reconstruct binary labels from the full dataset
# Since the splits were done on encoded types, we need the original disaster_occurred

# Reload original data for binary approach
train_full_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_train.csv"))
val_full_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_val.csv"))
test_full_df = pd.read_csv(os.path.join(PROCESSED_DIR, "disaster_test.csv"))

binary_models = {}
binary_metrics = {}
total_train_time_b = 0
total_infer_time_b = 0

for cls_idx, cls_name in enumerate(class_names):
    print(f"\n  --- {cls_name.upper()} Binary Model ---")

    # Create binary labels (one-vs-rest)
    y_train_bin = (y_train == cls_idx).astype(int)
    y_val_bin = (y_val == cls_idx).astype(int)
    y_test_bin = (y_test == cls_idx).astype(int)

    pos_count = y_train_bin.sum()
    neg_count = len(y_train_bin) - pos_count
    scale_pos = neg_count / max(pos_count, 1)

    # Optuna for binary
    def objective_binary(trial):
        params = {
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
            "max_depth": trial.suggest_int("max_depth", 3, 8),
            "n_estimators": trial.suggest_int("n_estimators", 50, 300, step=50),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "gamma": trial.suggest_float("gamma", 0, 3),
        }
        m = XGBClassifier(
            **params,
            objective="binary:logistic",
            scale_pos_weight=scale_pos,
            eval_metric="logloss",
            random_state=SEED,
            n_jobs=-1,
            verbosity=0,
            early_stopping_rounds=15,
        )
        m.fit(X_train, y_train_bin, eval_set=[(X_val, y_val_bin)], verbose=False)
        pred = m.predict(X_val)
        return f1_score(y_val_bin, pred, average="binary")

    study_b = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=SEED))
    study_b.optimize(objective_binary, n_trials=30, show_progress_bar=False)
    best_params_b = study_b.best_params

    # Train final binary model
    t_start = time.time()
    model_b = XGBClassifier(
        **best_params_b,
        objective="binary:logistic",
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=SEED,
        n_jobs=-1,
        verbosity=0,
        early_stopping_rounds=15,
    )
    model_b.fit(X_train, y_train_bin, eval_set=[(X_val, y_val_bin)], verbose=False)
    t_train_b = time.time() - t_start
    total_train_time_b += t_train_b

    # Evaluate on test
    t_start = time.time()
    y_pred_bin = model_b.predict(X_test)
    y_proba_bin = model_b.predict_proba(X_test)[:, 1]
    t_infer_b = time.time() - t_start
    total_infer_time_b += t_infer_b

    binary_models[cls_name] = model_b
    binary_metrics[cls_name] = {
        "accuracy": accuracy_score(y_test_bin, y_pred_bin),
        "precision": precision_score(y_test_bin, y_pred_bin, zero_division=0),
        "recall": recall_score(y_test_bin, y_pred_bin, zero_division=0),
        "f1": f1_score(y_test_bin, y_pred_bin, zero_division=0),
        "roc_auc": roc_auc_score(y_test_bin, y_proba_bin) if len(np.unique(y_test_bin)) > 1 else 0,
        "train_time_s": round(t_train_b, 2),
        "best_params": best_params_b,
    }

    print(f"    F1: {binary_metrics[cls_name]['f1']:.4f}, "
          f"AUC: {binary_metrics[cls_name]['roc_auc']:.4f}, "
          f"Train: {t_train_b:.1f}s")

# Approach B aggregate: predict by highest probability across all binary models
y_pred_b_probs = np.zeros((len(X_test), n_classes))
for cls_idx, cls_name in enumerate(class_names):
    y_pred_b_probs[:, cls_idx] = binary_models[cls_name].predict_proba(X_test)[:, 1]

y_pred_b = y_pred_b_probs.argmax(axis=1)
# Normalize probabilities for ROC-AUC
y_proba_b_norm = y_pred_b_probs / y_pred_b_probs.sum(axis=1, keepdims=True)

infer_per_sample_b = total_infer_time_b / len(X_test) * 1000

metrics_b = {
    "accuracy": accuracy_score(y_test, y_pred_b),
    "precision_macro": precision_score(y_test, y_pred_b, average="macro"),
    "recall_macro": recall_score(y_test, y_pred_b, average="macro"),
    "f1_macro": f1_score(y_test, y_pred_b, average="macro"),
    "roc_auc_ovr": roc_auc_score(y_test, y_proba_b_norm, multi_class="ovr", average="macro"),
    "training_time_s": round(total_train_time_b, 2),
    "inference_ms_per_sample": round(infer_per_sample_b, 4),
    "n_models": n_classes,
}

print(f"\n  APPROACH B AGGREGATE RESULTS (Test Set):")
for k, v in metrics_b.items():
    print(f"    {k}: {v}")
print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred_b, target_names=class_names))


# ════════════════════════════════════════════════════════════════════════════════
#  COMPARISON
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  MODEL COMPARISON")
print("═" * 70)

comparison = {
    "metric": ["Accuracy", "Precision (Macro)", "Recall (Macro)", "F1 (Macro)",
               "ROC-AUC (OvR)", "Training Time (s)", "Inference (ms/sample)",
               "Model Complexity", "Maintainability"],
    "approach_a_unified": [
        f"{metrics_a['accuracy']:.4f}",
        f"{metrics_a['precision_macro']:.4f}",
        f"{metrics_a['recall_macro']:.4f}",
        f"{metrics_a['f1_macro']:.4f}",
        f"{metrics_a['roc_auc_ovr']:.4f}",
        f"{metrics_a['training_time_s']:.2f}",
        f"{metrics_a['inference_ms_per_sample']:.4f}",
        "1 model",
        "Simple",
    ],
    "approach_b_separate": [
        f"{metrics_b['accuracy']:.4f}",
        f"{metrics_b['precision_macro']:.4f}",
        f"{metrics_b['recall_macro']:.4f}",
        f"{metrics_b['f1_macro']:.4f}",
        f"{metrics_b['roc_auc_ovr']:.4f}",
        f"{metrics_b['training_time_s']:.2f}",
        f"{metrics_b['inference_ms_per_sample']:.4f}",
        f"{n_classes} models",
        "Complex",
    ],
}

comp_df = pd.DataFrame(comparison)
print(comp_df.to_string(index=False))

# Select winner
f1_a = metrics_a["f1_macro"]
f1_b = metrics_b["f1_macro"]
if f1_a >= f1_b:
    winner = "A"
    winner_model = model_a
    winner_metrics = metrics_a
    winner_params = best_params_a
    winner_preds = y_pred_a
    winner_proba = y_proba_a
    print(f"\n  ✅ WINNER: Approach A (Unified) — F1={f1_a:.4f} vs {f1_b:.4f}")
else:
    winner = "B"
    winner_model = None  # Multiple models
    winner_metrics = metrics_b
    winner_params = {k: v["best_params"] for k, v in binary_metrics.items()}
    winner_preds = y_pred_b
    winner_proba = y_proba_b_norm
    print(f"\n  ✅ WINNER: Approach B (Separate) — F1={f1_b:.4f} vs {f1_a:.4f}")


# ════════════════════════════════════════════════════════════════════════════════
#  VISUALIZATIONS
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  GENERATING VISUALIZATIONS")
print("═" * 70)

# 1. Confusion Matrix (both approaches)
fig, axes = plt.subplots(1, 2, figsize=(16, 6))
for ax, preds, title in [(axes[0], y_pred_a, "Approach A: Unified"),
                          (axes[1], y_pred_b, "Approach B: Separate")]:
    cm = confusion_matrix(y_test, preds)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax,
                xticklabels=class_names, yticklabels=class_names)
    ax.set_title(f"Confusion Matrix — {title}")
    ax.set_ylabel("True")
    ax.set_xlabel("Predicted")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "confusion_matrices.png"), dpi=150)
plt.close()
print("  ✅ confusion_matrices.png")

# 2. ROC Curves
from sklearn.preprocessing import label_binarize
y_test_bin_all = label_binarize(y_test, classes=range(n_classes))

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
for ax, proba, title in [(axes[0], y_proba_a, "Approach A"),
                          (axes[1], y_proba_b_norm, "Approach B")]:
    for i, cls in enumerate(class_names):
        from sklearn.metrics import roc_curve, auc
        fpr, tpr, _ = roc_curve(y_test_bin_all[:, i], proba[:, i])
        roc_auc = auc(fpr, tpr)
        ax.plot(fpr, tpr, label=f"{cls} (AUC={roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], "k--", alpha=0.3)
    ax.set_title(f"ROC Curves — {title}")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.legend(fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "roc_curves.png"), dpi=150)
plt.close()
print("  ✅ roc_curves.png")

# 3. Precision-Recall Curves
fig, axes = plt.subplots(1, 2, figsize=(16, 6))
for ax, proba, title in [(axes[0], y_proba_a, "Approach A"),
                          (axes[1], y_proba_b_norm, "Approach B")]:
    for i, cls in enumerate(class_names):
        prec, rec, _ = precision_recall_curve(y_test_bin_all[:, i], proba[:, i])
        ap = average_precision_score(y_test_bin_all[:, i], proba[:, i])
        ax.plot(rec, prec, label=f"{cls} (AP={ap:.3f})")
    ax.set_title(f"Precision-Recall — {title}")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.legend(fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "precision_recall_curves.png"), dpi=150)
plt.close()
print("  ✅ precision_recall_curves.png")

# 4. Feature Importance (winner model)
fig, ax = plt.subplots(figsize=(12, 8))
if winner == "A":
    importances = model_a.feature_importances_
    feat_imp = pd.Series(importances, index=feature_cols).sort_values(ascending=True)
    feat_imp.plot(kind="barh", ax=ax, color="#2196F3")
    ax.set_title("Feature Importance — Unified Model (Approach A)")
else:
    # Average importance across binary models
    avg_imp = np.zeros(len(feature_cols))
    for cls_name, m in binary_models.items():
        avg_imp += m.feature_importances_
    avg_imp /= len(binary_models)
    feat_imp = pd.Series(avg_imp, index=feature_cols).sort_values(ascending=True)
    feat_imp.plot(kind="barh", ax=ax, color="#4CAF50")
    ax.set_title("Average Feature Importance — Separate Models (Approach B)")
ax.set_xlabel("Importance")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "feature_importance.png"), dpi=150)
plt.close()
print("  ✅ feature_importance.png")

# 5. Learning Curves (winner)
print("  Generating learning curves...")
if winner == "A":
    lc_model = XGBClassifier(
        **best_params_a,
        objective="multi:softprob",
        num_class=n_classes,
        eval_metric="mlogloss",
        random_state=SEED,
        n_jobs=-1,
        verbosity=0,
    )
    train_sizes, train_scores, val_scores = learning_curve(
        lc_model, X_train, y_train,
        train_sizes=np.linspace(0.1, 1.0, 8),
        cv=3, scoring="f1_macro", n_jobs=-1,
    )
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(train_sizes, train_scores.mean(axis=1), "o-", label="Train F1", color="#2196F3")
    ax.fill_between(train_sizes,
                     train_scores.mean(axis=1) - train_scores.std(axis=1),
                     train_scores.mean(axis=1) + train_scores.std(axis=1), alpha=0.1, color="#2196F3")
    ax.plot(train_sizes, val_scores.mean(axis=1), "o-", label="Validation F1", color="#f44336")
    ax.fill_between(train_sizes,
                     val_scores.mean(axis=1) - val_scores.std(axis=1),
                     val_scores.mean(axis=1) + val_scores.std(axis=1), alpha=0.1, color="#f44336")
    ax.set_title("Learning Curves — Unified Model")
    ax.set_xlabel("Training Set Size")
    ax.set_ylabel("F1 Score (Macro)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(REPORT_DIR, "learning_curves.png"), dpi=150)
    plt.close()
    print("  ✅ learning_curves.png")

# 6. Calibration Plot
fig, ax = plt.subplots(figsize=(10, 8))
for i, cls in enumerate(class_names):
    prob_true, prob_pred = calibration_curve(
        y_test_bin_all[:, i], winner_proba[:, i], n_bins=10, strategy="uniform"
    )
    ax.plot(prob_pred, prob_true, "o-", label=cls)
ax.plot([0, 1], [0, 1], "k--", alpha=0.3, label="Perfectly calibrated")
ax.set_title(f"Calibration Plot — Approach {winner}")
ax.set_xlabel("Mean Predicted Probability")
ax.set_ylabel("Fraction of Positives")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "calibration_plot.png"), dpi=150)
plt.close()
print("  ✅ calibration_plot.png")

# 7. Model Comparison Bar Chart
fig, axes = plt.subplots(1, 2, figsize=(16, 5))
comp_metrics = ["Accuracy", "Precision (Macro)", "Recall (Macro)", "F1 (Macro)", "ROC-AUC (OvR)"]
a_vals = [float(comparison["approach_a_unified"][i]) for i in range(5)]
b_vals = [float(comparison["approach_b_separate"][i]) for i in range(5)]

x = np.arange(len(comp_metrics))
width = 0.35
axes[0].bar(x - width/2, a_vals, width, label="Approach A (Unified)", color="#2196F3")
axes[0].bar(x + width/2, b_vals, width, label="Approach B (Separate)", color="#FF9800")
axes[0].set_xticks(x)
axes[0].set_xticklabels(comp_metrics, rotation=45, ha="right", fontsize=9)
axes[0].set_ylabel("Score")
axes[0].set_title("Model Comparison — Classification Metrics")
axes[0].legend()
axes[0].set_ylim(0, 1.1)

# Time comparison
time_metrics = ["Training Time (s)", "Inference (ms/sample)"]
a_times = [float(comparison["approach_a_unified"][5]), float(comparison["approach_a_unified"][6])]
b_times = [float(comparison["approach_b_separate"][5]), float(comparison["approach_b_separate"][6])]
x2 = np.arange(len(time_metrics))
axes[1].bar(x2 - width/2, a_times, width, label="Approach A", color="#2196F3")
axes[1].bar(x2 + width/2, b_times, width, label="Approach B", color="#FF9800")
axes[1].set_xticks(x2)
axes[1].set_xticklabels(time_metrics)
axes[1].set_ylabel("Time")
axes[1].set_title("Model Comparison — Efficiency")
axes[1].legend()

plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "model_comparison.png"), dpi=150)
plt.close()
print("  ✅ model_comparison.png")


# ════════════════════════════════════════════════════════════════════════════════
#  SHAP EXPLANATIONS
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  SHAP EXPLANATIONS")
print("═" * 70)

try:
    import shap

    if winner == "A":
        explainer = shap.TreeExplainer(model_a)
        # Use a sample for SHAP (full test set can be slow)
        X_shap = X_test[:500]
        shap_values = explainer.shap_values(X_shap)

        # Global SHAP summary
        fig, ax = plt.subplots(figsize=(12, 8))
        if isinstance(shap_values, list):
            # For multiclass, show mean absolute SHAP
            shap_mean = np.mean([np.abs(sv) for sv in shap_values], axis=0)
            shap.summary_plot(shap_values, X_shap, feature_names=feature_cols,
                              class_names=class_names, show=False, max_display=15)
        else:
            shap.summary_plot(shap_values, X_shap, feature_names=feature_cols,
                              show=False, max_display=15)
        plt.title("SHAP Global Feature Importance")
        plt.tight_layout()
        plt.savefig(os.path.join(REPORT_DIR, "shap_global_summary.png"), dpi=150, bbox_inches="tight")
        plt.close()
        print("  ✅ shap_global_summary.png")

        # SHAP bar plot (mean absolute)
        fig, ax = plt.subplots(figsize=(12, 8))
        if isinstance(shap_values, list):
            shap_abs_mean = np.mean(np.array([np.abs(sv).mean(axis=0) for sv in shap_values]), axis=0)
        else:
            shap_abs_mean = np.abs(shap_values).mean(axis=0)
        feat_shap = pd.Series(shap_abs_mean, index=feature_cols).sort_values(ascending=True)
        feat_shap.plot(kind="barh", ax=ax, color="#9C27B0")
        ax.set_title("SHAP Mean |SHAP Value| — Global Importance")
        ax.set_xlabel("Mean |SHAP Value|")
        plt.tight_layout()
        plt.savefig(os.path.join(REPORT_DIR, "shap_bar_importance.png"), dpi=150)
        plt.close()
        print("  ✅ shap_bar_importance.png")

        # Local explanation (first 3 samples)
        for idx in range(min(3, len(X_shap))):
            fig, ax = plt.subplots(figsize=(14, 4))
            if isinstance(shap_values, list):
                pred_class = int(model_a.predict(X_shap[idx:idx+1])[0])
                shap.waterfall_plot(
                    shap.Explanation(
                        values=shap_values[pred_class][idx],
                        base_values=explainer.expected_value[pred_class],
                        data=X_shap[idx],
                        feature_names=feature_cols,
                    ),
                    show=False, max_display=10
                )
            else:
                shap.waterfall_plot(
                    shap.Explanation(
                        values=shap_values[idx],
                        base_values=explainer.expected_value,
                        data=X_shap[idx],
                        feature_names=feature_cols,
                    ),
                    show=False, max_display=10
                )
            plt.title(f"SHAP Local Explanation — Sample {idx} (Predicted: {class_names[int(model_a.predict(X_shap[idx:idx+1])[0])]})")
            plt.tight_layout()
            plt.savefig(os.path.join(REPORT_DIR, f"shap_local_sample_{idx}.png"), dpi=150, bbox_inches="tight")
            plt.close()
        print("  ✅ shap_local_sample_0/1/2.png")

    else:
        # SHAP for each binary model
        for cls_name, m in binary_models.items():
            explainer = shap.TreeExplainer(m)
            X_shap = X_test[:300]
            shap_values = explainer.shap_values(X_shap)
            fig, ax = plt.subplots(figsize=(12, 8))
            shap.summary_plot(shap_values, X_shap, feature_names=feature_cols, show=False, max_display=10)
            plt.title(f"SHAP — {cls_name.title()} Model")
            plt.tight_layout()
            plt.savefig(os.path.join(REPORT_DIR, f"shap_{cls_name}.png"), dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✅ shap_{cls_name}.png")

except Exception as e:
    print(f"  ⚠️ SHAP generation error: {e}")
    import traceback
    traceback.print_exc()


# ════════════════════════════════════════════════════════════════════════════════
#  MODEL EXPORT
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "═" * 70)
print("  MODEL EXPORT")
print("═" * 70)

timestamp = datetime.now().isoformat()

if winner == "A":
    # Save unified model
    joblib.dump(model_a, os.path.join(MODEL_DIR, "disaster_prediction_xgb.joblib"))
    print(f"  ✅ disaster_prediction_xgb.joblib")

    model_metadata = {
        "model_name": "disaster_prediction_xgboost",
        "model_version": "1.0.0",
        "architecture": "unified_multiclass",
        "approach": "A",
        "algorithm": "XGBoost (multi:softprob)",
        "dataset_version": "1.0.0",
        "dataset_hash_md5": ds_hash,
        "classes": class_names,
        "features": feature_cols,
        "feature_count": len(feature_cols),
        "hyperparameters": best_params_a,
        "evaluation_metrics": {
            "test_set": metrics_a,
            "classification_report": classification_report(y_test, y_pred_a, target_names=class_names, output_dict=True),
        },
        "comparison_summary": {
            "approach_a_f1": metrics_a["f1_macro"],
            "approach_b_f1": metrics_b["f1_macro"],
            "winner": "A (Unified)",
            "reason": "Higher or equal F1 with simpler architecture",
        },
        "training_details": {
            "optuna_trials": 50,
            "optuna_time_s": round(t_optuna_a, 1),
            "training_time_s": metrics_a["training_time_s"],
            "inference_ms_per_sample": metrics_a["inference_ms_per_sample"],
            "early_stopping_rounds": 20,
        },
        "git_commit_hash": git_hash,
        "timestamp": timestamp,
        "random_seed": SEED,
    }
else:
    # Save all binary models
    for cls_name, m in binary_models.items():
        joblib.dump(m, os.path.join(MODEL_DIR, f"disaster_{cls_name}_xgb.joblib"))
        print(f"  ✅ disaster_{cls_name}_xgb.joblib")

    model_metadata = {
        "model_name": "disaster_prediction_xgboost",
        "model_version": "1.0.0",
        "architecture": "separate_binary",
        "approach": "B",
        "algorithm": "XGBoost (binary:logistic) × 4",
        "dataset_version": "1.0.0",
        "dataset_hash_md5": ds_hash,
        "classes": class_names,
        "features": feature_cols,
        "feature_count": len(feature_cols),
        "hyperparameters": {k: v["best_params"] for k, v in binary_metrics.items()},
        "evaluation_metrics": {
            "test_set": metrics_b,
            "per_class": binary_metrics,
            "classification_report": classification_report(y_test, y_pred_b, target_names=class_names, output_dict=True),
        },
        "comparison_summary": {
            "approach_a_f1": metrics_a["f1_macro"],
            "approach_b_f1": metrics_b["f1_macro"],
            "winner": "B (Separate)",
            "reason": "Higher F1 macro score",
        },
        "training_details": {
            "optuna_trials_per_model": 30,
            "total_training_time_s": metrics_b["training_time_s"],
            "inference_ms_per_sample": metrics_b["inference_ms_per_sample"],
        },
        "git_commit_hash": git_hash,
        "timestamp": timestamp,
        "random_seed": SEED,
    }

with open(os.path.join(MODEL_DIR, "disaster_model_metadata.json"), "w") as f:
    json.dump(model_metadata, f, indent=2, default=str)
print(f"  ✅ disaster_model_metadata.json")

# ─── Save Experiment Record ───────────────────────────────────────────────────
experiment = {
    "experiment_id": f"disaster_prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "model_version": "1.0.0",
    "dataset_version": "1.0.0",
    "dataset_hash": ds_hash,
    "approach_a": {
        "hyperparameters": best_params_a,
        "metrics": metrics_a,
    },
    "approach_b": {
        "per_class_metrics": binary_metrics,
        "aggregate_metrics": metrics_b,
    },
    "winner": f"Approach {winner}",
    "timestamp": timestamp,
    "git_commit": git_hash,
    "random_seed": SEED,
    "total_training_time_s": round(t_optuna_a + t_train_a + total_train_time_b, 1),
}

exp_file = os.path.join(EXPERIMENT_DIR, f"disaster_experiment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
with open(exp_file, "w") as f:
    json.dump(experiment, f, indent=2, default=str)
print(f"  ✅ Experiment record saved")

# ─── Final Summary ────────────────────────────────────────────────────────────
print("\n" + "═" * 70)
print("  PHASE 3 COMPLETE")
print("═" * 70)
print(f"  Winner: Approach {winner}")
print(f"  Test Accuracy: {winner_metrics['accuracy']:.4f}")
print(f"  Test F1 (Macro): {winner_metrics['f1_macro']:.4f}")
print(f"  Test ROC-AUC: {winner_metrics['roc_auc_ovr']:.4f}")
print(f"  Inference: {winner_metrics['inference_ms_per_sample']:.4f} ms/sample")
print(f"  Visualizations: {len(os.listdir(REPORT_DIR))} files in reports/model_evaluation/disaster/")
