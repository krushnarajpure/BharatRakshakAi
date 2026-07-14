"""
Phase 4: SOS priority classification training and evaluation.

This script consumes the existing processed SOS splits. It does not regenerate
datasets or rerun preprocessing.
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import label_binarize
from sklearn.svm import LinearSVC
from sklearn.utils.class_weight import compute_sample_weight
from xgboost import XGBClassifier


SEED = 42
BASE_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORT_DIR = BASE_DIR / "reports" / "model_evaluation" / "sos"
PHASE4_REPORT_PATH = BASE_DIR / "PHASE4_REPORT.md"

TRAIN_PATH = PROCESSED_DIR / "sos_train.csv"
VAL_PATH = PROCESSED_DIR / "sos_val.csv"
TEST_PATH = PROCESSED_DIR / "sos_test.csv"
RAW_DATA_PATH = PROCESSED_DIR / "sos_priority_dataset.csv"
DATASET_METADATA_PATH = PROCESSED_DIR / "sos_dataset_metadata.json"

MODEL_PATH = MODELS_DIR / "sos_model.joblib"
VECTOR_ALIAS_PATH = MODELS_DIR / "sos_vectorizer.joblib"
SOURCE_VECTOR_PATH = MODELS_DIR / "sos_tfidf_vectorizer.joblib"
SCALER_PATH = MODELS_DIR / "sos_feature_scaler.joblib"
PRIORITY_ENCODER_PATH = MODELS_DIR / "sos_priority_encoder.joblib"
DISASTER_ENCODER_PATH = MODELS_DIR / "sos_disaster_encoder.joblib"
METADATA_PATH = MODELS_DIR / "metadata.json"

STRUCTURED_FEATURES = [
    "people_affected",
    "medical_emergency",
    "infrastructure_damage",
    "disaster_type_encoded",
    "vulnerable_groups_encoded",
    "location_type_encoded",
    "time_of_day_encoded",
    "message_length",
    "word_count",
    "exclamation_count",
    "has_urgent",
]

RAW_FEATURES = [
    "emergency_message",
    "disaster_type",
    "people_affected",
    "medical_emergency",
    "vulnerable_groups",
    "infrastructure_damage",
    "location_type",
    "time_of_day",
]

TARGET_COLUMN = "priority_encoded"
MODEL_VERSION = "4.0.0"


def file_md5(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require_files(paths: list[Path]) -> None:
    missing = [str(path) for path in paths if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Required Phase 4 input artifact(s) missing: {missing}")


def load_processed_split(path: Path) -> tuple[pd.DataFrame, np.ndarray]:
    data = pd.read_csv(path)
    if TARGET_COLUMN not in data.columns:
        raise ValueError(f"{path} does not contain {TARGET_COLUMN}")
    features = data.drop(columns=[TARGET_COLUMN])
    labels = data[TARGET_COLUMN].astype(int).to_numpy()
    return features, labels


def load_splits() -> dict[str, Any]:
    require_files(
        [
            TRAIN_PATH,
            VAL_PATH,
            TEST_PATH,
            RAW_DATA_PATH,
            DATASET_METADATA_PATH,
            SOURCE_VECTOR_PATH,
            SCALER_PATH,
            PRIORITY_ENCODER_PATH,
            DISASTER_ENCODER_PATH,
        ]
    )
    x_train, y_train = load_processed_split(TRAIN_PATH)
    x_val, y_val = load_processed_split(VAL_PATH)
    x_test, y_test = load_processed_split(TEST_PATH)

    if list(x_train.columns) != list(x_val.columns) or list(x_train.columns) != list(
        x_test.columns
    ):
        raise ValueError("SOS processed train/val/test feature columns differ.")

    return {
        "x_train": x_train,
        "y_train": y_train,
        "x_val": x_val,
        "y_val": y_val,
        "x_test": x_test,
        "y_test": y_test,
        "feature_names": list(x_train.columns),
    }


def make_models(num_classes: int) -> dict[str, Any]:
    return {
        "Logistic Regression": LogisticRegression(
            class_weight="balanced",
            max_iter=2000,
            n_jobs=-1,
            random_state=SEED,
        ),
        "Random Forest": RandomForestClassifier(
            class_weight="balanced",
            n_estimators=350,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=SEED,
        ),
        "Linear SVM": CalibratedClassifierCV(
            estimator=LinearSVC(
                class_weight="balanced",
                dual="auto",
                max_iter=6000,
                random_state=SEED,
            ),
            method="sigmoid",
            cv=3,
        ),
        "Gradient Boosting": GradientBoostingClassifier(random_state=SEED),
        "XGBoost": XGBClassifier(
            objective="multi:softprob",
            num_class=num_classes,
            eval_metric="mlogloss",
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            tree_method="hist",
            n_jobs=-1,
            random_state=SEED,
        ),
    }


def fit_model(model_name: str, model: Any, x_train: pd.DataFrame, y_train: np.ndarray) -> Any:
    sample_weights = compute_sample_weight(class_weight="balanced", y=y_train)
    if model_name in {"Gradient Boosting", "XGBoost"}:
        model.fit(x_train, y_train, sample_weight=sample_weights)
    else:
        model.fit(x_train, y_train)
    return model


def predict_probabilities(model: Any, x_data: pd.DataFrame) -> np.ndarray:
    if not hasattr(model, "predict_proba"):
        raise TypeError(f"{type(model).__name__} does not expose predict_proba")
    probabilities = model.predict_proba(x_data)
    return np.asarray(probabilities, dtype=float)


def expected_calibration_error(
    y_true: np.ndarray, y_pred: np.ndarray, probabilities: np.ndarray, bins: int = 10
) -> float:
    confidences = probabilities.max(axis=1)
    correctness = (y_pred == y_true).astype(float)
    bin_edges = np.linspace(0.0, 1.0, bins + 1)
    ece = 0.0
    for lower, upper in zip(bin_edges[:-1], bin_edges[1:], strict=True):
        mask = (confidences > lower) & (confidences <= upper)
        if not np.any(mask):
            continue
        bin_weight = mask.mean()
        bin_accuracy = correctness[mask].mean()
        bin_confidence = confidences[mask].mean()
        ece += bin_weight * abs(bin_accuracy - bin_confidence)
    return float(ece)


def macro_brier_score(
    y_true: np.ndarray, probabilities: np.ndarray, class_indices: list[int]
) -> float:
    scores = [
        brier_score_loss((y_true == class_index).astype(int), probabilities[:, class_index])
        for class_index in class_indices
    ]
    return float(np.mean(scores))


def evaluate_model(
    model: Any, x_data: pd.DataFrame, y_true: np.ndarray, class_indices: list[int]
) -> dict[str, float]:
    y_pred = model.predict(x_data)
    probabilities = predict_probabilities(model, x_data)
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_macro": float(
            precision_score(y_true, y_pred, average="macro", zero_division=0)
        ),
        "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
    }
    metrics["roc_auc_ovr"] = float(
        roc_auc_score(
            y_true,
            probabilities,
            labels=class_indices,
            multi_class="ovr",
            average="macro",
        )
    )
    metrics["brier_score_macro"] = macro_brier_score(y_true, probabilities, class_indices)
    metrics["calibration_ece"] = expected_calibration_error(y_true, y_pred, probabilities)
    return metrics


def benchmark_models(splits: dict[str, Any], class_indices: list[int]) -> tuple[str, dict[str, Any]]:
    results: dict[str, Any] = {}
    models = make_models(len(class_indices))
    for model_name, model in models.items():
        print(f"\nTraining {model_name}...")
        start = time.perf_counter()
        fit_model(model_name, model, splits["x_train"], splits["y_train"])
        training_time = time.perf_counter() - start
        validation_metrics = evaluate_model(
            model, splits["x_val"], splits["y_val"], class_indices
        )
        test_metrics = evaluate_model(model, splits["x_test"], splits["y_test"], class_indices)
        results[model_name] = {
            "training_time_sec": round(training_time, 6),
            "validation_metrics": validation_metrics,
            "test_metrics": test_metrics,
        }
        print(
            f"  val_macro_f1={validation_metrics['macro_f1']:.6f}, "
            f"test_macro_f1={test_metrics['macro_f1']:.6f}, "
            f"train_time={training_time:.3f}s"
        )

    best_model_name = max(
        results,
        key=lambda name: (
            results[name]["validation_metrics"]["macro_f1"],
            results[name]["validation_metrics"]["accuracy"],
            results[name]["validation_metrics"]["roc_auc_ovr"],
            -results[name]["validation_metrics"]["calibration_ece"],
        ),
    )
    return best_model_name, results


def extract_feature_importance(model: Any, feature_names: list[str]) -> pd.DataFrame:
    importances: np.ndarray | None = None
    if hasattr(model, "feature_importances_"):
        importances = np.asarray(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        importances = np.mean(np.abs(np.asarray(model.coef_, dtype=float)), axis=0)
    elif isinstance(model, CalibratedClassifierCV):
        coefficients = []
        for calibrated_classifier in getattr(model, "calibrated_classifiers_", []):
            estimator = getattr(calibrated_classifier, "estimator", None)
            if estimator is not None and hasattr(estimator, "coef_"):
                coefficients.append(np.asarray(estimator.coef_, dtype=float))
        if coefficients:
            importances = np.mean(np.abs(np.vstack(coefficients)), axis=0)

    if importances is None:
        importances = np.zeros(len(feature_names), dtype=float)

    importance_frame = pd.DataFrame(
        {"feature": feature_names, "importance": importances[: len(feature_names)]}
    )
    return importance_frame.sort_values("importance", ascending=False).reset_index(drop=True)


def plot_model_comparison(results: dict[str, Any], output_path: Path) -> None:
    rows = []
    for model_name, result in results.items():
        row = {"model": model_name}
        row.update(
            {
                "Validation Macro F1": result["validation_metrics"]["macro_f1"],
                "Validation Accuracy": result["validation_metrics"]["accuracy"],
                "Validation ROC-AUC": result["validation_metrics"]["roc_auc_ovr"],
            }
        )
        rows.append(row)
    frame = pd.DataFrame(rows).set_index("model")
    ax = frame.plot(kind="bar", figsize=(12, 6), ylim=(0, 1.05), rot=30)
    ax.set_title("SOS Priority Model Comparison")
    ax.set_ylabel("Score")
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_confusion_matrix(
    model: Any, x_test: pd.DataFrame, y_test: np.ndarray, class_names: list[str], output_path: Path
) -> None:
    y_pred = model.predict(x_test)
    matrix = confusion_matrix(y_test, y_pred, labels=list(range(len(class_names))))
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.title("SOS Priority Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_roc_curves(
    model: Any, x_test: pd.DataFrame, y_test: np.ndarray, class_names: list[str], output_path: Path
) -> None:
    probabilities = predict_probabilities(model, x_test)
    y_binary = label_binarize(y_test, classes=list(range(len(class_names))))
    plt.figure(figsize=(9, 7))
    for index, class_name in enumerate(class_names):
        fpr, tpr, _ = roc_curve(y_binary[:, index], probabilities[:, index])
        auc_score = roc_auc_score(y_binary[:, index], probabilities[:, index])
        plt.plot(fpr, tpr, label=f"{class_name} AUC={auc_score:.3f}")
    plt.plot([0, 1], [0, 1], "k--", label="Chance")
    plt.title("SOS Priority ROC Curves")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_precision_recall_curves(
    model: Any, x_test: pd.DataFrame, y_test: np.ndarray, class_names: list[str], output_path: Path
) -> None:
    probabilities = predict_probabilities(model, x_test)
    y_binary = label_binarize(y_test, classes=list(range(len(class_names))))
    plt.figure(figsize=(9, 7))
    for index, class_name in enumerate(class_names):
        precision, recall, _ = precision_recall_curve(y_binary[:, index], probabilities[:, index])
        ap_score = average_precision_score(y_binary[:, index], probabilities[:, index])
        plt.plot(recall, precision, label=f"{class_name} AP={ap_score:.3f}")
    plt.title("SOS Priority Precision-Recall Curves")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.legend(loc="lower left")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_calibration(
    model: Any, x_test: pd.DataFrame, y_test: np.ndarray, output_path: Path
) -> None:
    probabilities = predict_probabilities(model, x_test)
    y_pred = np.argmax(probabilities, axis=1)
    confidences = probabilities.max(axis=1)
    correct = (y_pred == y_test).astype(int)
    bins = np.linspace(0.0, 1.0, 11)
    observed_accuracy = []
    mean_confidence = []
    labels = []
    for lower, upper in zip(bins[:-1], bins[1:], strict=True):
        mask = (confidences > lower) & (confidences <= upper)
        labels.append(f"{lower:.1f}-{upper:.1f}")
        if np.any(mask):
            observed_accuracy.append(float(correct[mask].mean()))
            mean_confidence.append(float(confidences[mask].mean()))
        else:
            observed_accuracy.append(np.nan)
            mean_confidence.append(np.nan)

    positions = np.arange(len(labels))
    plt.figure(figsize=(10, 6))
    plt.plot(positions, mean_confidence, marker="o", label="Mean confidence")
    plt.plot(positions, observed_accuracy, marker="s", label="Observed accuracy")
    plt.plot(positions, positions / (len(labels) - 1), "k--", alpha=0.5, label="Ideal")
    plt.xticks(positions, labels, rotation=45)
    plt.ylim(0, 1.05)
    plt.title("SOS Priority Confidence Calibration")
    plt.xlabel("Confidence bin")
    plt.ylabel("Rate")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_feature_importance(importance: pd.DataFrame, output_path: Path) -> None:
    top_features = importance.head(30).sort_values("importance")
    plt.figure(figsize=(10, 9))
    plt.barh(top_features["feature"], top_features["importance"])
    plt.title("SOS Priority Feature Importance")
    plt.xlabel("Importance")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()


def plot_learning_curves(
    model_name: str,
    model_factory: Callable[[], Any],
    x_train: pd.DataFrame,
    y_train: np.ndarray,
    x_val: pd.DataFrame,
    y_val: np.ndarray,
    output_path: Path,
) -> list[dict[str, float]]:
    rows: list[dict[str, float]] = []
    for train_fraction in [0.2, 0.4, 0.6, 0.8, 1.0]:
        if train_fraction < 1.0:
            x_subset, _, y_subset, _ = train_test_split(
                x_train,
                y_train,
                train_size=train_fraction,
                stratify=y_train,
                random_state=SEED,
            )
        else:
            x_subset = x_train
            y_subset = y_train
        model = model_factory()
        fit_model(model_name, model, x_subset, y_subset)
        train_pred = model.predict(x_subset)
        val_pred = model.predict(x_val)
        train_f1 = f1_score(y_subset, train_pred, average="macro", zero_division=0)
        val_f1 = f1_score(y_val, val_pred, average="macro", zero_division=0)
        rows.append(
            {
                "train_fraction": float(train_fraction),
                "train_size": int(len(x_subset)),
                "train_macro_f1": float(train_f1),
                "validation_macro_f1": float(val_f1),
            }
        )

    frame = pd.DataFrame(rows)
    plt.figure(figsize=(9, 6))
    plt.plot(frame["train_size"], frame["train_macro_f1"], marker="o", label="Train Macro F1")
    plt.plot(
        frame["train_size"],
        frame["validation_macro_f1"],
        marker="s",
        label="Validation Macro F1",
    )
    plt.ylim(0, 1.05)
    plt.title(f"SOS Priority Learning Curve ({model_name})")
    plt.xlabel("Training samples")
    plt.ylabel("Macro F1")
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    return rows


def measure_latency(model: Any, x_test: pd.DataFrame, repeats: int = 20) -> dict[str, float]:
    sample = x_test.copy()
    durations = []
    for _ in range(repeats):
        start = time.perf_counter()
        predict_probabilities(model, sample)
        durations.append(time.perf_counter() - start)
    best = min(durations)
    return {
        "batch_size": int(len(sample)),
        "repeats": repeats,
        "best_batch_ms": round(best * 1000, 6),
        "ms_per_sample": round((best * 1000) / len(sample), 6),
    }


def build_categorical_mappings(raw_data: pd.DataFrame, priority_encoder: Any, disaster_encoder: Any) -> dict[str, dict[str, int]]:
    return {
        "priority": {
            str(label): int(index) for index, label in enumerate(priority_encoder.classes_)
        },
        "disaster_type": {
            str(label): int(index) for index, label in enumerate(disaster_encoder.classes_)
        },
        "vulnerable_groups": {
            str(label): int(index)
            for index, label in enumerate(sorted(raw_data["vulnerable_groups"].unique()))
        },
        "location_type": {
            str(label): int(index)
            for index, label in enumerate(sorted(raw_data["location_type"].unique()))
        },
        "time_of_day": {
            str(label): int(index)
            for index, label in enumerate(sorted(raw_data["time_of_day"].unique()))
        },
    }


def response_policy() -> dict[str, dict[str, str]]:
    return {
        "critical": {
            "estimated_response_time": "0-15 minutes",
            "recommended_action": "Immediate dispatch of rescue, medical, and incident command teams.",
        },
        "high": {
            "estimated_response_time": "15-30 minutes",
            "recommended_action": "Prioritize rescue team dispatch and prepare medical support.",
        },
        "medium": {
            "estimated_response_time": "30-90 minutes",
            "recommended_action": "Queue field assessment, local responder support, and relief coordination.",
        },
        "low": {
            "estimated_response_time": "2-6 hours",
            "recommended_action": "Monitor, validate the report, and route to local relief resources.",
        },
    }


def write_report(metadata: dict[str, Any]) -> None:
    comparison_rows = []
    for model_name, result in metadata["benchmark_models"].items():
        val = result["validation_metrics"]
        test = result["test_metrics"]
        comparison_rows.append(
            "| {model} | {val_acc:.6f} | {val_f1:.6f} | {val_auc:.6f} | {test_acc:.6f} | {test_f1:.6f} | {test_auc:.6f} | {time:.3f} |".format(
                model=model_name,
                val_acc=val["accuracy"],
                val_f1=val["macro_f1"],
                val_auc=val["roc_auc_ovr"],
                test_acc=test["accuracy"],
                test_f1=test["macro_f1"],
                test_auc=test["roc_auc_ovr"],
                time=result["training_time_sec"],
            )
        )

    final_metrics = metadata["final_model"]["test_metrics"]
    class_distribution = metadata["dataset"]["class_distribution"]
    split_counts = metadata["dataset"]["splits"]
    report = f"""# Phase 4 Report: SOS Priority Classification

Generated: {metadata["created_at"]}

## Objective

Build a production-ready SOS emergency priority classifier for incoming rescue
requests. The model predicts one of four classes: critical, high, medium, low.

## Dataset

- Source file: `datasets/processed/sos_priority_dataset.csv`
- Total samples: {metadata["dataset"]["total_samples"]}
- Split files: `sos_train.csv`, `sos_val.csv`, `sos_test.csv`
- Split sizes: train={split_counts["train"]}, validation={split_counts["validation"]}, test={split_counts["test"]}
- Dataset MD5: `{metadata["dataset"]["dataset_hash_md5"]}`
- Class distribution: {json.dumps(class_distribution, sort_keys=True)}

The Phase 4 training run used the existing processed files only. It did not
regenerate SOS data or rerun preprocessing.

## Input Features

- Emergency message
- Disaster type
- People affected
- Medical emergency
- Vulnerable groups
- Infrastructure damage
- Location type
- Time of day

Production inference reconstructs the same 11 structured features used during
preprocessing and concatenates them with the saved 500-term TF-IDF vectorizer.

## Training Pipeline

1. Loaded existing processed train, validation, and test CSV files.
2. Trained benchmark classifiers on the training split.
3. Evaluated each benchmark on validation and held-out test splits.
4. Selected the final algorithm by validation Macro F1, with validation accuracy,
   ROC-AUC, and calibration as tie-breakers.
5. Refit the selected algorithm on train plus validation data.
6. Evaluated the final model on the held-out test split.
7. Exported model artifacts, metadata, and evaluation plots.

## Model Comparison

| Model | Val Accuracy | Val Macro F1 | Val ROC-AUC | Test Accuracy | Test Macro F1 | Test ROC-AUC | Train Time (s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
{chr(10).join(comparison_rows)}

## Final Model Selection

- Selected model: {metadata["final_model"]["algorithm"]}
- Selection metric: validation Macro F1
- Final model training time: {metadata["final_model"]["training_time_sec"]:.6f} seconds
- Model size: {metadata["final_model"]["model_size_bytes"]:,} bytes
- Batch inference latency: {metadata["final_model"]["inference_latency"]["ms_per_sample"]:.6f} ms/sample

## Evaluation Metrics

- Accuracy: {final_metrics["accuracy"]:.10f}
- Macro Precision: {final_metrics["precision_macro"]:.10f}
- Macro Recall: {final_metrics["recall_macro"]:.10f}
- Macro F1: {final_metrics["macro_f1"]:.10f}
- ROC-AUC OvR: {final_metrics["roc_auc_ovr"]:.10f}
- Brier Score Macro: {final_metrics["brier_score_macro"]:.10f}
- Expected Calibration Error: {final_metrics["calibration_ece"]:.10f}

## Explainability And Evaluation Artifacts

- `reports/model_evaluation/sos/feature_importance.png`
- `reports/model_evaluation/sos/confusion_matrix.png`
- `reports/model_evaluation/sos/roc_curves.png`
- `reports/model_evaluation/sos/precision_recall_curves.png`
- `reports/model_evaluation/sos/calibration_plot.png`
- `reports/model_evaluation/sos/learning_curves.png`
- `reports/model_evaluation/sos/model_comparison.png`

## Exported Artifacts

- `models/sos_model.joblib`
- `models/sos_vectorizer.joblib`
- `models/sos_feature_scaler.joblib`
- `models/metadata.json`

Existing preprocessing artifacts were reused. The scaler was not refit.

## Deployment Notes

FastAPI loads the SOS model, TF-IDF vectorizer, feature scaler, and metadata at
startup. The production endpoint is:

`POST /api/v1/predict/sos-priority`

The response includes predicted priority, confidence, class probabilities,
estimated response time, recommended emergency action, and processing latency.

## Limitations

- The SOS dataset is synthetic and generated from rule-based emergency templates.
- Priority labels reflect the scoring policy used during dataset generation.
- Location, time, and vulnerable-group encodings are deterministic
  `LabelEncoder`-style mappings reconstructed from the existing raw processed
  SOS dataset and stored in metadata.
- Calibration is measured on the held-out test split and should be revisited
  when real operational SOS data is collected.

## Future Improvements

- Validate against real SOS reports from drills or field operations.
- Add active-learning review workflows for ambiguous priorities.
- Evaluate multilingual Indian emergency messages.
- Add geospatial and responder-availability features.
- Recalibrate the classifier periodically as live data distribution shifts.
"""
    PHASE4_REPORT_PATH.write_text(report, encoding="utf-8")


def main() -> None:
    np.random.seed(SEED)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    splits = load_splits()
    raw_data = pd.read_csv(RAW_DATA_PATH)
    dataset_metadata = json.loads(DATASET_METADATA_PATH.read_text(encoding="utf-8"))
    priority_encoder = joblib.load(PRIORITY_ENCODER_PATH)
    disaster_encoder = joblib.load(DISASTER_ENCODER_PATH)
    class_names = [str(label) for label in priority_encoder.classes_]
    class_indices = list(range(len(class_names)))

    print("=" * 72)
    print("Phase 4: SOS Priority Classification")
    print("=" * 72)
    print(f"Train: {splits['x_train'].shape}, Val: {splits['x_val'].shape}, Test: {splits['x_test'].shape}")
    print(f"Classes: {class_names}")

    best_model_name, benchmark_results = benchmark_models(splits, class_indices)
    print(f"\nSelected benchmark: {best_model_name}")

    model_factory = lambda: make_models(len(class_indices))[best_model_name]
    final_model = model_factory()
    x_final = pd.concat([splits["x_train"], splits["x_val"]], axis=0)
    y_final = np.concatenate([splits["y_train"], splits["y_val"]])
    start = time.perf_counter()
    fit_model(best_model_name, final_model, x_final, y_final)
    final_training_time = time.perf_counter() - start
    final_metrics = evaluate_model(final_model, splits["x_test"], splits["y_test"], class_indices)
    latency = measure_latency(final_model, splits["x_test"])

    joblib.dump(final_model, MODEL_PATH)
    source_vectorizer = joblib.load(SOURCE_VECTOR_PATH)
    joblib.dump(source_vectorizer, VECTOR_ALIAS_PATH)
    model_size = MODEL_PATH.stat().st_size

    plots = {
        "model_comparison": REPORT_DIR / "model_comparison.png",
        "confusion_matrix": REPORT_DIR / "confusion_matrix.png",
        "roc_curves": REPORT_DIR / "roc_curves.png",
        "precision_recall_curves": REPORT_DIR / "precision_recall_curves.png",
        "calibration_plot": REPORT_DIR / "calibration_plot.png",
        "feature_importance": REPORT_DIR / "feature_importance.png",
        "learning_curves": REPORT_DIR / "learning_curves.png",
    }
    plot_model_comparison(benchmark_results, plots["model_comparison"])
    plot_confusion_matrix(
        final_model, splits["x_test"], splits["y_test"], class_names, plots["confusion_matrix"]
    )
    plot_roc_curves(final_model, splits["x_test"], splits["y_test"], class_names, plots["roc_curves"])
    plot_precision_recall_curves(
        final_model,
        splits["x_test"],
        splits["y_test"],
        class_names,
        plots["precision_recall_curves"],
    )
    plot_calibration(final_model, splits["x_test"], splits["y_test"], plots["calibration_plot"])
    importance = extract_feature_importance(final_model, splits["feature_names"])
    plot_feature_importance(importance, plots["feature_importance"])
    learning_curve_rows = plot_learning_curves(
        best_model_name,
        model_factory,
        splits["x_train"],
        splits["y_train"],
        splits["x_val"],
        splits["y_val"],
        plots["learning_curves"],
    )

    categorical_mappings = build_categorical_mappings(
        raw_data, priority_encoder, disaster_encoder
    )
    metadata = {
        "model_name": "sos_priority_classifier",
        "model_version": MODEL_VERSION,
        "phase": "Phase 4",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "random_seed": SEED,
        "dataset": {
            "name": dataset_metadata.get("dataset_name", "sos_priority_classification"),
            "version": dataset_metadata.get("version"),
            "total_samples": int(len(raw_data)),
            "dataset_hash_md5": file_md5(RAW_DATA_PATH),
            "metadata_dataset_hash_md5": dataset_metadata.get("dataset_hash_md5"),
            "splits": {
                "train": int(len(splits["x_train"])),
                "validation": int(len(splits["x_val"])),
                "test": int(len(splits["x_test"])),
            },
            "class_distribution": raw_data["priority"].value_counts().to_dict(),
            "source_files": {
                "raw": str(RAW_DATA_PATH.relative_to(BASE_DIR)),
                "train": str(TRAIN_PATH.relative_to(BASE_DIR)),
                "validation": str(VAL_PATH.relative_to(BASE_DIR)),
                "test": str(TEST_PATH.relative_to(BASE_DIR)),
            },
            "file_hashes_md5": {
                "raw": file_md5(RAW_DATA_PATH),
                "train": file_md5(TRAIN_PATH),
                "validation": file_md5(VAL_PATH),
                "test": file_md5(TEST_PATH),
            },
        },
        "raw_features": RAW_FEATURES,
        "preprocessing": {
            "uses_existing_processed_splits": True,
            "structured_features": STRUCTURED_FEATURES,
            "tfidf_feature_count": int(len(source_vectorizer.get_feature_names_out())),
            "feature_columns": splits["feature_names"],
            "target_column": TARGET_COLUMN,
            "class_names": class_names,
            "categorical_mappings": categorical_mappings,
            "text_cleaning": {
                "lowercase": True,
                "regex_keep_pattern": r"[^\w\s!?.,]",
                "urgent_pattern": r"URGENT|MAYDAY|SOS|EMERGENCY|NOW|IMMEDIATELY|CRITICAL",
            },
            "scaler_feature_names": list(joblib.load(SCALER_PATH).feature_names_in_),
        },
        "benchmark_models": benchmark_results,
        "selection": {
            "selected_model": best_model_name,
            "selection_metric": "validation_macro_f1",
            "tie_breakers": [
                "validation_accuracy",
                "validation_roc_auc_ovr",
                "lowest_validation_calibration_ece",
            ],
        },
        "final_model": {
            "algorithm": best_model_name,
            "training_time_sec": round(final_training_time, 6),
            "test_metrics": final_metrics,
            "inference_latency": latency,
            "model_size_bytes": int(model_size),
            "top_features": importance.head(30).to_dict(orient="records"),
            "learning_curve": learning_curve_rows,
        },
        "response_policy": response_policy(),
        "artifacts": {
            "model": str(MODEL_PATH.relative_to(BASE_DIR)),
            "vectorizer": str(VECTOR_ALIAS_PATH.relative_to(BASE_DIR)),
            "source_vectorizer": str(SOURCE_VECTOR_PATH.relative_to(BASE_DIR)),
            "feature_scaler": str(SCALER_PATH.relative_to(BASE_DIR)),
            "metadata": str(METADATA_PATH.relative_to(BASE_DIR)),
        },
        "plots": {key: str(path.relative_to(BASE_DIR)) for key, path in plots.items()},
    }

    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    write_report(metadata)

    print("\nFinal test metrics:")
    for key, value in final_metrics.items():
        print(f"  {key}: {value:.10f}")
    print(f"  model_size_bytes: {model_size}")
    print(f"  inference_ms_per_sample: {latency['ms_per_sample']}")
    print(f"\nSaved model: {MODEL_PATH}")
    print(f"Saved metadata: {METADATA_PATH}")
    print(f"Saved report: {PHASE4_REPORT_PATH}")


if __name__ == "__main__":
    main()
