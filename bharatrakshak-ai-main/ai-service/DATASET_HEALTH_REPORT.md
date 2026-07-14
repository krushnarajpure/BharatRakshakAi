# Damage Detection Dataset Health Report

**Generated:** 2026-07-03T08:40:35.080841
**Dataset:** rupankarmajumdar/disaster-response-object-detection-dataset

## Summary

| Metric | Value |
|--------|-------|
| Total Images | 12440 |
| Total Labels | 12440 |
| Total Annotations | 21164 |
| Classes | 6 |
| Critical Issues | NONE ✅ |

## Split Distribution

| Split | Images | Labels | Missing Labels | Empty Labels | Invalid Annotations |
|-------|--------|--------|----------------|--------------|---------------------|
| train | 10450 | 10450 | 1 | 110 | 0 |
| val | 1556 | 1556 | 0 | 24 | 0 |
| test | 434 | 434 | 0 | 8 | 0 |

## Class Distribution

| Class ID | Class Name | Count | Percentage |
|----------|-----------|-------|------------|
| 0 | person | 5351 | 25.3% |
| 1 | fire | 6173 | 29.2% |
| 2 | smoke | 1513 | 7.1% |
| 3 | small_vehicle | 3227 | 15.2% |
| 4 | large_vehicle | 2323 | 11.0% |
| 5 | two_wheeler | 2577 | 12.2% |

## Bounding Box Statistics

| Metric | Width | Height | Area |
|--------|-------|--------|------|
| Mean | 0.3966 | 0.4679 | 0.2346 |
| Std | 0.2828 | 0.2701 | 0.2447 |
| Min | 0.0026 | 0.0063 | 0.000085 |
| Max | 1.0000 | 1.0000 | 1.0000 |

## Objects Per Image

| Metric | Value |
|--------|-------|
| Mean | 1.7 |
| Max | 12 |
| Images with 0 objects | 142 |

## Issues Found

| Issue | Count | Severity |
|-------|-------|----------|
| Missing labels | 1 | ⚠️ Warning |
| Corrupted images | 0 | ✅ None |
| Duplicate images | 7 | ⚠️ Warning |
| Invalid annotations | 0 | ✅ None |
| Empty labels | 142 | ⚠️ Warning |

## Verdict

✅ Dataset is healthy. Safe to proceed with YOLOv8 training.
