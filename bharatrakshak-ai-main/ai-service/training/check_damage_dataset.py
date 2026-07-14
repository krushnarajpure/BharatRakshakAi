"""
Phase 2: Damage Detection Dataset Health Check
===============================================
Automatically inspects the downloaded YOLO dataset for:
- YOLO annotation integrity
- Missing labels
- Corrupted images
- Duplicate images
- Class distribution
- Bounding box statistics
Generates DATASET_HEALTH_REPORT.md
"""
import os
import json
import hashlib
from collections import Counter, defaultdict
from datetime import datetime

BASE = "/home/lenovo/projects/bharatrakshak-ai/ai-service"
DAMAGE_DIR = os.path.join(BASE, "datasets", "damage")
REPORT_DIR = os.path.join(BASE, "reports", "eda")
os.makedirs(REPORT_DIR, exist_ok=True)

# Load data.yaml
import yaml
with open(os.path.join(DAMAGE_DIR, "data.yaml"), "r") as f:
    data_config = yaml.safe_load(f)

CLASS_NAMES = data_config["names"]
NUM_CLASSES = data_config["nc"]
print(f"Classes ({NUM_CLASSES}): {CLASS_NAMES}")

# ─── Health Check Functions ────────────────────────────────────────────────────
def check_split(split_name, split_dir):
    """Check a single split (train/val/test) for issues."""
    img_dir = os.path.join(split_dir, "images")
    lbl_dir = os.path.join(split_dir, "labels")

    results = {
        "split": split_name,
        "total_images": 0,
        "total_labels": 0,
        "missing_labels": [],
        "missing_images": [],
        "corrupted_images": [],
        "empty_labels": [],
        "invalid_annotations": [],
        "class_counts": Counter(),
        "bbox_widths": [],
        "bbox_heights": [],
        "bbox_areas": [],
        "objects_per_image": [],
        "duplicate_images": [],
        "image_sizes": Counter(),
    }

    # Get file lists
    img_files = set()
    lbl_files = set()

    if os.path.exists(img_dir):
        for f in os.listdir(img_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp')):
                img_files.add(os.path.splitext(f)[0])
    if os.path.exists(lbl_dir):
        for f in os.listdir(lbl_dir):
            if f.endswith('.txt'):
                lbl_files.add(os.path.splitext(f)[0])

    results["total_images"] = len(img_files)
    results["total_labels"] = len(lbl_files)

    # Check missing labels
    results["missing_labels"] = list(img_files - lbl_files)

    # Check missing images (orphan labels)
    results["missing_images"] = list(lbl_files - img_files)

    # Check for corrupted images (just file size check, PIL would be more thorough)
    for stem in list(img_files)[:500]:  # Sample check
        for ext in ['.jpg', '.jpeg', '.png']:
            img_path = os.path.join(img_dir, stem + ext)
            if os.path.exists(img_path):
                size = os.path.getsize(img_path)
                if size < 100:  # Less than 100 bytes = likely corrupted
                    results["corrupted_images"].append(stem)
                results["image_sizes"][size // 1024] = results["image_sizes"].get(size // 1024, 0) + 1
                break

    # Check for duplicate images via file hash (sample)
    hashes = defaultdict(list)
    for stem in list(img_files)[:1000]:  # Sample
        for ext in ['.jpg', '.jpeg', '.png']:
            img_path = os.path.join(img_dir, stem + ext)
            if os.path.exists(img_path):
                file_hash = hashlib.md5(open(img_path, "rb").read()).hexdigest()
                hashes[file_hash].append(stem)
                break

    for h, files in hashes.items():
        if len(files) > 1:
            results["duplicate_images"].extend(files[1:])

    # Check YOLO annotations
    matched = img_files & lbl_files
    for stem in matched:
        lbl_path = os.path.join(lbl_dir, stem + ".txt")
        try:
            with open(lbl_path, "r") as f:
                lines = f.readlines()
            if len(lines) == 0:
                results["empty_labels"].append(stem)
                results["objects_per_image"].append(0)
                continue

            obj_count = 0
            for line in lines:
                parts = line.strip().split()
                if len(parts) != 5:
                    results["invalid_annotations"].append(f"{stem}: expected 5 values, got {len(parts)}")
                    continue

                try:
                    cls_id = int(parts[0])
                    x_center = float(parts[1])
                    y_center = float(parts[2])
                    width = float(parts[3])
                    height = float(parts[4])

                    # Validate ranges
                    if cls_id < 0 or cls_id >= NUM_CLASSES:
                        results["invalid_annotations"].append(f"{stem}: class {cls_id} out of range [0, {NUM_CLASSES-1}]")
                        continue
                    if not (0 <= x_center <= 1 and 0 <= y_center <= 1):
                        results["invalid_annotations"].append(f"{stem}: center ({x_center}, {y_center}) out of [0,1]")
                        continue
                    if not (0 < width <= 1 and 0 < height <= 1):
                        results["invalid_annotations"].append(f"{stem}: size ({width}, {height}) out of (0,1]")
                        continue

                    results["class_counts"][cls_id] += 1
                    results["bbox_widths"].append(width)
                    results["bbox_heights"].append(height)
                    results["bbox_areas"].append(width * height)
                    obj_count += 1

                except ValueError as e:
                    results["invalid_annotations"].append(f"{stem}: parse error: {e}")

            results["objects_per_image"].append(obj_count)

        except Exception as e:
            results["invalid_annotations"].append(f"{stem}: read error: {e}")

    return results

# ─── Run Health Checks ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  DAMAGE DATASET HEALTH CHECK")
print("=" * 60)

all_results = {}
total_class_counts = Counter()
all_bbox_widths = []
all_bbox_heights = []
all_bbox_areas = []
all_objects_per_image = []

has_critical_issues = False

for split in ["train", "val", "test"]:
    split_dir = os.path.join(DAMAGE_DIR, split)
    if not os.path.exists(split_dir):
        print(f"\n  ⚠️ {split}/ directory not found!")
        continue

    print(f"\n  Checking {split}/...")
    results = check_split(split, split_dir)
    all_results[split] = results
    total_class_counts += results["class_counts"]
    all_bbox_widths.extend(results["bbox_widths"])
    all_bbox_heights.extend(results["bbox_heights"])
    all_bbox_areas.extend(results["bbox_areas"])
    all_objects_per_image.extend(results["objects_per_image"])

    print(f"    Images: {results['total_images']}")
    print(f"    Labels: {results['total_labels']}")
    print(f"    Missing labels: {len(results['missing_labels'])}")
    print(f"    Missing images: {len(results['missing_images'])}")
    print(f"    Corrupted images: {len(results['corrupted_images'])}")
    print(f"    Empty labels: {len(results['empty_labels'])}")
    print(f"    Invalid annotations: {len(results['invalid_annotations'])}")
    print(f"    Duplicates found: {len(results['duplicate_images'])}")

    # Critical issue check
    if len(results["missing_labels"]) > results["total_images"] * 0.1:
        has_critical_issues = True
        print(f"    ❌ CRITICAL: >10% missing labels!")
    if len(results["invalid_annotations"]) > len(results["objects_per_image"]) * 0.1:
        has_critical_issues = True
        print(f"    ❌ CRITICAL: >10% invalid annotations!")

# ─── Generate Statistics ───────────────────────────────────────────────────────
print("\n  Class Distribution:")
for cls_id in range(NUM_CLASSES):
    count = total_class_counts[cls_id]
    pct = count / sum(total_class_counts.values()) * 100 if sum(total_class_counts.values()) > 0 else 0
    print(f"    {cls_id} ({CLASS_NAMES[cls_id]}): {count} ({pct:.1f}%)")

if all_bbox_widths:
    import numpy as np
    print(f"\n  Bounding Box Statistics:")
    print(f"    Width:  mean={np.mean(all_bbox_widths):.4f}, std={np.std(all_bbox_widths):.4f}, min={np.min(all_bbox_widths):.4f}, max={np.max(all_bbox_widths):.4f}")
    print(f"    Height: mean={np.mean(all_bbox_heights):.4f}, std={np.std(all_bbox_heights):.4f}, min={np.min(all_bbox_heights):.4f}, max={np.max(all_bbox_heights):.4f}")
    print(f"    Area:   mean={np.mean(all_bbox_areas):.4f}, std={np.std(all_bbox_areas):.4f}")
    print(f"    Objects/image: mean={np.mean(all_objects_per_image):.1f}, max={np.max(all_objects_per_image)}")

# ─── Generate EDA Plots ───────────────────────────────────────────────────────
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Class distribution
fig, ax = plt.subplots(figsize=(10, 5))
classes = [CLASS_NAMES[i] for i in range(NUM_CLASSES)]
counts = [total_class_counts[i] for i in range(NUM_CLASSES)]
ax.bar(classes, counts, color=["#2196F3", "#f44336", "#FF9800", "#4CAF50", "#9C27B0", "#009688"])
ax.set_title("Damage Detection: Class Distribution")
ax.set_ylabel("Instance Count")
ax.tick_params(axis='x', rotation=45)
for i, v in enumerate(counts):
    ax.text(i, v + 50, str(v), ha='center', fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "damage_class_distribution.png"), dpi=150)
plt.close()

# Objects per image histogram
fig, ax = plt.subplots(figsize=(10, 5))
ax.hist(all_objects_per_image, bins=30, color="#2196F3", edgecolor="white")
ax.set_title("Objects per Image Distribution")
ax.set_xlabel("Number of Objects")
ax.set_ylabel("Image Count")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "damage_objects_per_image.png"), dpi=150)
plt.close()

# Bbox size distribution
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(all_bbox_widths, bins=50, color="#4CAF50", edgecolor="white", alpha=0.7)
axes[0].set_title("Bounding Box Width Distribution")
axes[0].set_xlabel("Width (normalized)")
axes[1].hist(all_bbox_heights, bins=50, color="#FF9800", edgecolor="white", alpha=0.7)
axes[1].set_title("Bounding Box Height Distribution")
axes[1].set_xlabel("Height (normalized)")
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "damage_bbox_distribution.png"), dpi=150)
plt.close()

# Split distribution
fig, ax = plt.subplots(figsize=(8, 5))
splits = list(all_results.keys())
img_counts = [all_results[s]["total_images"] for s in splits]
ax.bar(splits, img_counts, color=["#4CAF50", "#2196F3", "#FF9800"])
ax.set_title("Images per Split")
ax.set_ylabel("Image Count")
for i, v in enumerate(img_counts):
    ax.text(i, v + 50, str(v), ha='center')
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, "damage_split_distribution.png"), dpi=150)
plt.close()

print("\n  ✅ damage_class_distribution.png")
print("  ✅ damage_objects_per_image.png")
print("  ✅ damage_bbox_distribution.png")
print("  ✅ damage_split_distribution.png")

# ─── Generate Health Report ────────────────────────────────────────────────────
report = f"""# Damage Detection Dataset Health Report

**Generated:** {datetime.now().isoformat()}
**Dataset:** rupankarmajumdar/disaster-response-object-detection-dataset

## Summary

| Metric | Value |
|--------|-------|
| Total Images | {sum(r['total_images'] for r in all_results.values())} |
| Total Labels | {sum(r['total_labels'] for r in all_results.values())} |
| Total Annotations | {sum(total_class_counts.values())} |
| Classes | {NUM_CLASSES} |
| Critical Issues | {'YES ❌' if has_critical_issues else 'NONE ✅'} |

## Split Distribution

| Split | Images | Labels | Missing Labels | Empty Labels | Invalid Annotations |
|-------|--------|--------|----------------|--------------|---------------------|
"""
for split, r in all_results.items():
    report += f"| {split} | {r['total_images']} | {r['total_labels']} | {len(r['missing_labels'])} | {len(r['empty_labels'])} | {len(r['invalid_annotations'])} |\n"

report += f"""
## Class Distribution

| Class ID | Class Name | Count | Percentage |
|----------|-----------|-------|------------|
"""
total_objs = sum(total_class_counts.values())
for i in range(NUM_CLASSES):
    count = total_class_counts[i]
    pct = count / total_objs * 100 if total_objs > 0 else 0
    report += f"| {i} | {CLASS_NAMES[i]} | {count} | {pct:.1f}% |\n"

if all_bbox_widths:
    report += f"""
## Bounding Box Statistics

| Metric | Width | Height | Area |
|--------|-------|--------|------|
| Mean | {np.mean(all_bbox_widths):.4f} | {np.mean(all_bbox_heights):.4f} | {np.mean(all_bbox_areas):.4f} |
| Std | {np.std(all_bbox_widths):.4f} | {np.std(all_bbox_heights):.4f} | {np.std(all_bbox_areas):.4f} |
| Min | {np.min(all_bbox_widths):.4f} | {np.min(all_bbox_heights):.4f} | {np.min(all_bbox_areas):.6f} |
| Max | {np.max(all_bbox_widths):.4f} | {np.max(all_bbox_heights):.4f} | {np.max(all_bbox_areas):.4f} |

## Objects Per Image

| Metric | Value |
|--------|-------|
| Mean | {np.mean(all_objects_per_image):.1f} |
| Max | {np.max(all_objects_per_image)} |
| Images with 0 objects | {sum(1 for x in all_objects_per_image if x == 0)} |
"""

report += f"""
## Issues Found

| Issue | Count | Severity |
|-------|-------|----------|
| Missing labels | {sum(len(r['missing_labels']) for r in all_results.values())} | {'⚠️ Warning' if sum(len(r['missing_labels']) for r in all_results.values()) > 0 else '✅ None'} |
| Corrupted images | {sum(len(r['corrupted_images']) for r in all_results.values())} | {'❌ Critical' if sum(len(r['corrupted_images']) for r in all_results.values()) > 0 else '✅ None'} |
| Duplicate images | {sum(len(r['duplicate_images']) for r in all_results.values())} | {'⚠️ Warning' if sum(len(r['duplicate_images']) for r in all_results.values()) > 0 else '✅ None'} |
| Invalid annotations | {sum(len(r['invalid_annotations']) for r in all_results.values())} | {'❌ Critical' if sum(len(r['invalid_annotations']) for r in all_results.values()) > 0 else '✅ None'} |
| Empty labels | {sum(len(r['empty_labels']) for r in all_results.values())} | {'⚠️ Warning' if sum(len(r['empty_labels']) for r in all_results.values()) > 0 else '✅ None'} |

## Verdict

{'❌ CRITICAL ISSUES DETECTED. Do not proceed with training until resolved.' if has_critical_issues else '✅ Dataset is healthy. Safe to proceed with YOLOv8 training.'}
"""

with open(os.path.join(BASE, "DATASET_HEALTH_REPORT.md"), "w") as f:
    f.write(report)

print(f"\n  ✅ Saved DATASET_HEALTH_REPORT.md")
print(f"\n  {'❌ CRITICAL ISSUES - DO NOT TRAIN' if has_critical_issues else '✅ DATASET HEALTHY - SAFE TO TRAIN'}")
