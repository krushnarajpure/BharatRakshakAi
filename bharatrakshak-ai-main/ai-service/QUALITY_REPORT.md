# Dataset Quality Report — BharatRakshak AI

**Generated:** 2026-07-03T08:41:45.853447

---

## 1. Disaster Prediction Dataset

### Missing Values

Series([], )

### Feature Statistics

       latitude  longitude  rainfall_mm  temperature_c  humidity_pct  river_discharge  water_level_m  elevation_m  population_density  wind_speed_kmh  pressure_hpa  disaster_occurred  land_cover_encoded  soil_type_encoded  heat_index  wind_pressure_ratio  rainfall_intensity  flood_risk_composite
count  27000.00   27000.00     27000.00       27000.00      27000.00         27000.00       27000.00     27000.00            27000.00        27000.00      27000.00           27000.00            27000.00           27000.00    27000.00             27000.00            27000.00              27000.00
mean      22.46      79.29       122.57          31.65         74.10          2404.63           4.64      1960.67             3698.63           32.09        993.99               0.37                3.13               2.78       68.70                 0.03                1.96                 44.47
std        7.54       7.75       125.49           8.07         20.77          1576.00           3.01      2493.53             2626.35           43.58         26.03               0.48                1.45               1.54       14.48                 0.05                2.14                 41.10
min        8.00      68.00         0.00          10.00         20.00             0.04           0.00         0.00                2.29            0.07        900.01               0.00                0.00               0.00       25.10                 0.00                0.00                  0.92
25%       15.98      73.25         0.00          26.48         61.42          1172.95           2.33       217.53             1566.72           11.54        993.17               0.00                3.00               1.00       58.09                 0.01                0.00                  6.59
50%       25.25      75.75        87.42          31.93         80.88          2198.90           4.03       414.19             3077.86           19.41       1002.53               0.00                4.00               4.00       70.17                 0.02                1.35                 32.78
75%       28.00      85.43       215.55          38.45         91.11          3350.21           6.68      2939.79             5343.35           30.08       1009.56               1.00                4.00               4.00       81.51                 0.03                3.22                 73.44
max       36.99      97.00       499.86          48.51        100.00          7997.84          15.00      8846.89             9999.17          249.91       1020.17               1.00                5.00               5.00       94.64                 0.27               14.09                344.06

### Class Imbalance

disaster_type
flood        10000
heatwave      8000
cyclone       5000
landslide     4000

Disaster occurred by type:
disaster_type  disaster_occurred
cyclone        1                    2500
               0                    2500
flood          1                    5057
               0                    4943
heatwave       0                    7620
               1                     380
landslide      0                    2007
               1                    1993

### Feature Correlations (Top 10 pairs)

wind_speed_kmh      wind_pressure_ratio     0.999499
rainfall_mm         flood_risk_composite    0.981295
                    rainfall_intensity      0.840007
humidity_pct        heat_index              0.839293
rainfall_intensity  flood_risk_composite    0.810123
temperature_c       heat_index              0.714556
humidity_pct        rainfall_intensity      0.546431
heat_index          rainfall_intensity      0.545448
river_discharge     flood_risk_composite    0.508350
water_level_m       flood_risk_composite    0.505595

### Sample Origin Tracking

disaster_type  sample_origin
cyclone        synthetic         5000
flood          real             10000
heatwave       real              8000
landslide      real              4000

---

## 2. SOS Priority Dataset

### Missing Values

Series([], )

### Class Imbalance

priority
critical    2979
high        2427
medium       914
low          176

Note: Class imbalance is inherent to the priority scoring system.
Will use class_weight='balanced' during model training.

### Feature Engineering Summary

- Text features: TF-IDF vectorization (500 features, bigrams, min_df=2)
- Numerical features: people_affected, message_length, word_count, exclamation_count
- Categorical encodings: disaster_type, vulnerable_groups, location_type, time_of_day
- Binary flags: medical_emergency, infrastructure_damage, has_urgent
- Total feature vector: 511 dimensions
