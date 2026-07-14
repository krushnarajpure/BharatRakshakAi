# Phase 3 Report - Disaster Risk Prediction Model

## Status

Phase 3 model training is complete and independently verified. No retraining was performed during this engineering pass.

## Architecture

The Phase 3 AI subsystem uses a FastAPI microservice that loads the verified XGBoost artifact during application startup. Express remains a separate backend and consumes the FastAPI endpoint over HTTP.

- FastAPI health endpoint: `GET /health`
- FastAPI disaster prediction endpoint: `POST /api/v1/predict/disaster`
- Trained model: `models/disaster_prediction_xgb.joblib`
- Metadata: `models/disaster_model_metadata.json`
- Preprocessing artifacts:
  - `models/disaster_scaler.joblib`
  - `models/disaster_label_encoder.joblib`
  - `models/land_cover_encoder.joblib`
  - `models/soil_type_encoder.joblib`

## Dataset

The final disaster prediction dataset contains 27,000 samples, 15 model features, and 4 disaster classes.

| Class | Rows | Origin |
|---|---:|---|
| flood | 10,000 | real |
| heatwave | 8,000 | real |
| landslide | 4,000 | real |
| cyclone | 5,000 | synthetic |

Total real samples: 22,000. Total synthetic samples: 5,000.

The dataset hash recorded in both dataset metadata and model metadata is `83061cee9a2c5aaf3db8cce7b17d7046`.

## Training Pipeline

Training used the processed 70/15/15 train, validation, and test splits:

- Train: 18,900 rows
- Validation: 4,050 rows
- Test: 4,050 rows

The training script compared:

- Approach A: one unified multiclass XGBoost model
- Approach B: four one-vs-rest binary XGBoost models

Optuna was used for hyperparameter optimization, and early stopping was configured during final model training.

## Feature Schema

The model expects these 15 scaled features in exact order:

1. `rainfall_mm`
2. `temperature_c`
3. `humidity_pct`
4. `river_discharge`
5. `water_level_m`
6. `elevation_m`
7. `wind_speed_kmh`
8. `pressure_hpa`
9. `population_density`
10. `land_cover_encoded`
11. `soil_type_encoded`
12. `heat_index`
13. `wind_pressure_ratio`
14. `rainfall_intensity`
15. `flood_risk_composite`

The FastAPI inference service accepts raw environmental fields, applies the saved label encoders, recreates the engineered features, and applies the saved `StandardScaler`.

## Hyperparameters

The selected Approach A XGBoost hyperparameters are:

| Parameter | Value |
|---|---:|
| learning_rate | 0.03574712922600244 |
| max_depth | 10 |
| n_estimators | 400 |
| subsample | 0.8394633936788146 |
| colsample_bytree | 0.6624074561769746 |
| min_child_weight | 2 |
| gamma | 0.2904180608409973 |
| reg_alpha | 1.7323522915498704 |
| reg_lambda | 2.002787529358022 |

## Evaluation

Verified test metrics from the saved model and `disaster_test.csv`:

| Metric | Value |
|---|---:|
| Accuracy | 0.9982716049382716 |
| Macro Precision | 0.997760480113993 |
| Macro Recall | 0.9985833333333334 |
| Macro F1 | 0.9981684613706492 |
| ROC AUC OvR | 0.9999744603322225 |
| Model Size | 1,731,983 bytes |
| Batch Inference | about 0.004 ms/sample |

## Model Comparison

Approach A and Approach B produced equal macro F1 in the saved experiment record. Approach A was selected because it achieved equal or better quality with lower inference latency, lower deployment complexity, and simpler maintainability.

| Approach | Macro F1 | ROC AUC OvR | Inference |
|---|---:|---:|---:|
| Unified multiclass XGBoost | 0.9981684613706492 | 0.9999744603322225 | 0.0076 ms/sample recorded |
| Separate binary XGBoost models | 0.9981684613706492 | 0.9999639441731897 | 0.0127 ms/sample recorded |

## SHAP Analysis

The repository contains a validated SHAP global summary plot:

- `reports/model_evaluation/disaster/shap_global_summary.png`

The script contains code paths for SHAP bar and local waterfall plots, but those files are not present in the repository. The current explainability artifact should therefore be treated as global-only.

## Feature Importance

The repository contains:

- `reports/model_evaluation/disaster/feature_importance.png`

Correlation analysis in the quality report identifies strong relationships between:

- `wind_speed_kmh` and `wind_pressure_ratio`
- `rainfall_mm` and `flood_risk_composite`
- `rainfall_mm` and `rainfall_intensity`
- `humidity_pct` and `heat_index`

## Limitations

The model predicts the most likely disaster class among cyclone, flood, heatwave, and landslide. It does not directly predict the `disaster_occurred` binary label as a calibrated event probability.

The scaler was fitted before the train/validation/test split in the existing preprocessing script. This is not ideal evaluation hygiene and should be corrected in a future model version, but it does not invalidate the currently verified artifact for integration.

Cyclone samples are synthetic. Predictions involving cyclone risk should be reviewed carefully until real cyclone observations are added.

Some inference fields may be unavailable from the existing Express flood contract. The integration fills missing numeric sensor fields with training-set means and reports imputed fields in the FastAPI response.

## Deployment Notes

Run the FastAPI service from `ai-service`:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Run tests from `ai-service`:

```bash
python -m pytest tests
```

The Express backend should call:

```text
POST http://localhost:8000/api/v1/predict/disaster
```

The model loads during FastAPI startup and is cached in application state for reuse across requests.
