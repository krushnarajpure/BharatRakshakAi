# Phase 4 Report: SOS Priority Classification

Generated: 2026-07-03T11:02:51.593486+00:00

## Objective

Build a production-ready SOS emergency priority classifier for incoming rescue
requests. The model predicts one of four classes: critical, high, medium, low.

## Dataset

- Source file: `datasets/processed/sos_priority_dataset.csv`
- Total samples: 6496
- Split files: `sos_train.csv`, `sos_val.csv`, `sos_test.csv`
- Split sizes: train=5196, validation=650, test=650
- Dataset MD5: `978ff3f331eff104e9a11a58d8d69c40`
- Class distribution: {"critical": 2979, "high": 2427, "low": 176, "medium": 914}

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
| Logistic Regression | 1.000000 | 1.000000 | 1.000000 | 0.998462 | 0.998121 | 0.999997 | 8.560 |
| Random Forest | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 2.139 |
| Linear SVM | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 0.810 |
| Gradient Boosting | 1.000000 | 1.000000 | 1.000000 | 0.998462 | 0.998133 | 1.000000 | 28.941 |
| XGBoost | 1.000000 | 1.000000 | 1.000000 | 0.998462 | 0.998133 | 1.000000 | 12.518 |

## Final Model Selection

- Selected model: XGBoost
- Selection metric: validation Macro F1
- Final model training time: 12.800931 seconds
- Model size: 1,252,654 bytes
- Batch inference latency: 0.036588 ms/sample

## Evaluation Metrics

- Accuracy: 0.9984615385
- Macro Precision: 0.9973118280
- Macro Recall: 0.9989711934
- Macro F1: 0.9981331847
- ROC-AUC OvR: 1.0000000000
- Brier Score Macro: 0.0002359920
- Expected Calibration Error: 0.0018708182

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
