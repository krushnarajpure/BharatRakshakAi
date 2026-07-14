# Data Dictionary — BharatRakshak AI Processed Datasets

**Generated:** 2026-07-03T08:41:45.733160

---

## 1. Disaster Prediction Dataset

**File:** `datasets/processed/disaster_prediction_full.csv`
**Rows:** 27000
**Purpose:** Multi-class disaster type classification (flood, cyclone, heatwave, landslide)

### Features

| # | Column | Type | Range/Values | Description | Source |
|---|--------|------|--------------|-------------|--------|
| 1 | `latitude` | float | 8.0 — 36.0 | Geographic latitude (India) | Real (flood, heatwave, landslide) / Synthetic (cyclone) |
| 2 | `longitude` | float | 68.0 — 97.0 | Geographic longitude (India) | Real / Synthetic |
| 3 | `rainfall_mm` | float | 0 — 500+ | Rainfall in millimeters | Real (flood, heatwave) / Derived (landslide: annual/12) |
| 4 | `temperature_c` | float | 10 — 50 | Temperature in Celsius | Real (all) / Converted (heatwave: Kelvin→C) |
| 5 | `humidity_pct` | float | 10 — 100 | Relative humidity (%) | Real (flood) / Derived (heatwave: dew/temp ratio) |
| 6 | `river_discharge` | float | 100 — 8000 | River discharge (m³/s) | Real (flood) / Synthetic (others) |
| 7 | `water_level_m` | float | 0.5 — 15 | Water level in meters | Real (flood) / Synthetic (others) |
| 8 | `elevation_m` | float | 0 — 8000+ | Elevation above sea level (m) | Real (all) |
| 9 | `land_cover` | categorical | Urban, Forest, Water Body, etc. | Land cover type | Real (flood) / Assigned (others) |
| 10 | `soil_type` | categorical | Clay, Sandy, Loam, etc. | Soil composition | Real (flood) / Assigned (others) |
| 11 | `population_density` | float | 50 — 10000 | People per sq km | Real (flood) / Synthetic (others) |
| 12 | `wind_speed_kmh` | float | 1 — 250 | Wind speed (km/h) | Real (heatwave: u10,v10→speed) / Synthetic (others) |
| 13 | `pressure_hpa` | float | 920 — 1020 | Mean sea level pressure (hPa) | Real (heatwave: Pa→hPa) / Synthetic (others) |
| 14 | `disaster_type` | categorical | flood, cyclone, heatwave, landslide | Disaster classification | Label |
| 15 | `disaster_occurred` | binary | 0, 1 | Whether disaster occurred | Target variable |
| 16 | `data_source` | string | kaggle:*, synthetic:* | Origin tracking | Metadata |
| 17 | `sample_origin` | string | real, synthetic | Real vs generated | Metadata |

### Engineered Features (in train/val/test splits)

| # | Column | Formula | Rationale |
|---|--------|---------|-----------|
| 1 | `heat_index` | temp + 0.5 × humidity | Combined heat-moisture stress indicator |
| 2 | `wind_pressure_ratio` | wind_speed / pressure | Cyclone intensity proxy |
| 3 | `rainfall_intensity` | rainfall / (humidity + 1) | Rainfall adjusted for moisture capacity |
| 4 | `flood_risk_composite` | 0.3×rain + 0.3×water + 0.2×discharge/100 + 0.2×(1000/(elev+1)) | Multi-factor flood risk score |
| 5 | `land_cover_encoded` | LabelEncoder | Numeric encoding of land cover |
| 6 | `soil_type_encoded` | LabelEncoder | Numeric encoding of soil type |

---

## 2. SOS Priority Classification Dataset

**File:** `datasets/processed/sos_priority_dataset.csv`
**Rows:** 6496
**Purpose:** Emergency SOS request priority classification (critical, high, medium, low)

### Features

| # | Column | Type | Range/Values | Description |
|---|--------|------|--------------|-------------|
| 1 | `emergency_message` | text | Free text | SOS emergency message (NDMA-style) |
| 2 | `disaster_type` | categorical | flood, cyclone, earthquake, fire, landslide, heatwave, industrial, medical | Type of disaster |
| 3 | `people_affected` | integer | 1 — 500 | Number of people needing rescue |
| 4 | `medical_emergency` | boolean | True/False | Whether medical aid is needed |
| 5 | `vulnerable_groups` | categorical | children, elderly, disabled, pregnant, none | Vulnerable population present |
| 6 | `location_type` | categorical | urban, suburban, rural, remote, coastal | Location accessibility |
| 7 | `time_of_day` | categorical | morning, afternoon, evening, night | Time of emergency |
| 8 | `infrastructure_damage` | boolean | True/False | Road/bridge damage |
| 9 | `priority` | categorical | critical, high, medium, low | **Target label** |

### Derived Features (in train/val/test splits)

| # | Column | Description |
|---|--------|-------------|
| 1 | `message_length` | Character count of emergency message |
| 2 | `word_count` | Word count of emergency message |
| 3 | `exclamation_count` | Count of '!' characters |
| 4 | `has_urgent` | Contains URGENT/MAYDAY/SOS/EMERGENCY keywords |
| 5 | `tfidf_*` | 500 TF-IDF features from cleaned messages |

### Priority Assignment Rules

| Factor | Points | Condition |
|--------|--------|-----------|
| People affected | 5-40 | 1-4→5, 5-9→10, 10-19→20, 20-49→30, 50+→40 |
| Medical emergency | +25 | If True |
| Vulnerable groups | +15-20 | children/elderly/disabled: +20, pregnant: +15 |
| Location | +8-15 | remote: +15, rural: +10, coastal: +8 |
| Time of day | +5-10 | night: +10, evening: +5 |
| Infrastructure damage | +15 | If True |
| Disaster type risk | +8-15 | earthquake: +15, fire/cyclone/industrial: +12, flood/landslide/medical: +10, heatwave: +8 |

**Thresholds:** critical ≥ 80, high ≥ 55, medium ≥ 35, low < 35

---

## 3. Damage Detection Dataset

**File:** `datasets/damage/` (YOLO format)
**Purpose:** Object detection for disaster response elements

### Classes

| ID | Class Name | Description |
|----|-----------|-------------|
| 0 | person | People in disaster scenes |
| 1 | fire | Active fire/flames |
| 2 | smoke | Smoke from fires/explosions |
| 3 | small_vehicle | Cars, motorcycles, small vehicles |
| 4 | large_vehicle | Trucks, buses, rescue vehicles |
| 5 | two_wheeler | Motorcycles, bicycles |

### YOLO Label Format

Each `.txt` file: `class_id x_center y_center width height` (normalized 0-1)
