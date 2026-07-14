# BharatRakshak AI — Dataset Report (Phase 1)

## Executive Summary

Searched Kaggle extensively using 15+ query variations across disaster prediction, emergency triage, and damage detection. Downloaded and inspected 5 datasets. Final selections below.

---

## 1. Disaster Risk Prediction

### Kaggle Searches Performed

| Query | Results | Top Candidate |
|-------|---------|---------------|
| `india flood prediction` | 8 | `s3programmer/flood-risk-in-india` |
| `flood prediction rainfall` | 18 | `naiyakhalid/flood-prediction-dataset` |
| `natural disaster prediction` | 20 | `emirhanakku/disaster-and-emergency-response` |
| `india weather disaster` | 14 | `imdevskp/kerala-floods-2018` |
| `india cyclone heatwave` | 2 | None suitable |
| `disaster risk assessment weather` | 20 | None suitable |

### Dataset Comparison

| Criterion | s3programmer/flood-risk-in-india | naiyakhalid/flood-prediction | emirhanakku/disaster-emergency |
|-----------|--------------------------------|------------------------------|-------------------------------|
| **Rows** | 10,000 | 50,000 (+ 1.1M train) | 50,000 |
| **Weather features** | ✅ Rainfall, Temp, Humidity, River Level, Elevation | ❌ Synthetic scores only | ❌ No weather features |
| **India-specific** | ✅ Yes (lat/lon within India) | ❌ No geo-context | ❌ Global |
| **Multi-disaster** | ❌ Flood only | ❌ Flood only | ✅ 10 disaster types |
| **Geo-coordinates** | ✅ Lat/Lon | ❌ No | ✅ Lat/Lon |
| **Label type** | Binary (Flood Occurred 0/1) | Continuous (FloodProbability) | Categorical (disaster_type) |
| **Feature quality** | ✅ Real weather parameters | ❌ Abstract vulnerability indices | ✅ Severity, casualties |
| **License** | CC0-1.0 | CC0-1.0 | Other |
| **Usability** | 1.0 | — | 1.0 |

### ✅ Selected: `s3programmer/flood-risk-in-india`

**Why:**
- Real weather parameters (rainfall_mm, temperature_c, humidity, river_level, elevation) — directly match our API input schema
- India-specific with accurate geo-coordinates
- Clean CSV, high usability rating, CC0 license
- 10,000 rows is sufficient for XGBoost (tree-based models are data-efficient)

**Limitation & Mitigation:**
The dataset only covers **flood**. To support Cyclone, Heatwave, and Landslide predictions, I will:

1. Use the flood dataset as the base (real data)
2. Generate realistic augmentation samples for Cyclone, Heatwave, and Landslide using **domain-specific meteorological parameter ranges** derived from IMD historical data, NDMA thresholds, and published research.

This approach (Option A: Unified multiclass model vs Option B: separate models) will be evaluated in Phase 3.

### Dataset Files

```
datasets/prediction/
├── flood_risk_dataset_india.csv      (1.77 MB, 10,000 rows, 14 columns)
│   Columns: Latitude, Longitude, Rainfall (mm), Temperature (°C), Humidity (%),
│            River Discharge (m³/s), Water Level (m), Elevation (m),
│            Land Cover, Soil Type, Population Density, Infrastructure,
│            Historical Floods, Flood Occurred
│
├── disaster_emergency/
│   └── global_disaster_response_2018_2024.csv  (4.19 MB, 50,000 rows)
│       Types: Drought, Earthquake, Extreme Heat, Flood, Hurricane, Landslide,
│              Storm Surge, Tornado, Volcanic Eruption, Wildfire
│       USE: Reference for severity indices and disaster type distributions
```

---

## 2. SOS Priority Classification

### Kaggle Searches Performed

| Query | Results | Suitable? |
|-------|---------|-----------|
| `emergency classification text` | 20 | ❌ No disaster SOS datasets |
| `disaster text classification priority` | 1 | ❌ Earthquake report only |
| `SOS emergency priority triage` | 0 | ❌ No results |
| `emergency triage priority classification` | 4 | ❌ Medical vitals only |
| `disaster emergency response dataset` | 20 | ❌ No text/priority data |
| `911 emergency calls classification` | 2 | ❌ Audio only / 403 error |
| `disaster tweets nlp text` | 20 | ❌ Real/fake classification, not priority |

### ❌ No Suitable Public Dataset Found

After searching 7 distinct query variations, no public dataset combines emergency text messages + disaster type + priority labeling + people affected count.

### ✅ Decision: Generate Synthetic Dataset

| Feature | Type | Description |
|---------|------|-------------|
| `emergency_message` | text | Realistic disaster SOS message |
| `disaster_type` | categorical | flood, cyclone, earthquake, fire, landslide, heatwave, industrial, medical |
| `people_affected` | integer | Number of people needing rescue |
| `medical_emergency` | boolean | Whether medical aid is needed |
| `vulnerable_groups` | categorical | children, elderly, disabled, pregnant, none |
| `location_type` | categorical | urban, suburban, rural, remote, coastal |
| `time_of_day` | categorical | morning, afternoon, evening, night |
| `infrastructure_damage` | boolean | Whether roads/bridges are damaged |
| `priority` | categorical | critical, high, medium, low (target) |

6,000+ samples, class-balanced, documented methodology.

---

## 3. Damage Detection (YOLOv8)

### ✅ Selected: `rupankarmajumdar/disaster-response-object-detection-dataset`

- 977 MB, object detection format (bounding boxes)
- Disaster-specific classes, usability 1.0
- Download in progress

---

## 4. Hardware

| Resource | Status | Impact |
|----------|--------|--------|
| GPU | ❌ Not available | YOLOv8n (nano), no DistilBERT |
| Python | 3.12.3 | ✅ |

---

## Next Steps (Phase 2)

1. Preprocess flood dataset + generate multi-disaster augmentation
2. Generate synthetic SOS dataset with documented methodology
3. Verify damage dataset YOLO format, prepare splits
4. EDA visualizations and statistics
