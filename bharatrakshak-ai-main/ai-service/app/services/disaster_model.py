"""Inference service for the verified Phase 3 disaster XGBoost model."""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.config.settings import Settings
from app.schemas.disaster import (
    ClassProbability,
    DisasterPredictionRequest,
    DisasterPredictionResponse,
    FeatureValue,
    RiskLevel,
)

logger = logging.getLogger(__name__)


class ModelLoadError(RuntimeError):
    """Raised when a required model artifact is missing or invalid."""


class PreprocessingError(ValueError):
    """Raised when an input cannot be transformed with training artifacts."""


class DisasterPredictionService:
    """Load Phase 3 artifacts and run production inference."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model: Any | None = None
        self.scaler: Any | None = None
        self.label_encoder: Any | None = None
        self.land_cover_encoder: Any | None = None
        self.soil_type_encoder: Any | None = None
        self.metadata: dict[str, Any] = {}
        self.feature_names: list[str] = []
        self.class_names: list[str] = []
        self.numeric_defaults: dict[str, float] = {}

    @property
    def is_loaded(self) -> bool:
        """Return whether all required artifacts are loaded."""

        return all(
            artifact is not None
            for artifact in (
                self.model,
                self.scaler,
                self.label_encoder,
                self.land_cover_encoder,
                self.soil_type_encoder,
            )
        )

    def load(self) -> None:
        """Load model, metadata, scaler, and encoders from disk."""

        paths = {
            "model": self.settings.disaster_model_path,
            "metadata": self.settings.disaster_metadata_path,
            "scaler": self.settings.disaster_scaler_path,
            "label_encoder": self.settings.disaster_label_encoder_path,
            "land_cover_encoder": self.settings.land_cover_encoder_path,
            "soil_type_encoder": self.settings.soil_type_encoder_path,
        }
        for name, path in paths.items():
            self._require_file(name, path)

        self.model = joblib.load(paths["model"])
        self.scaler = joblib.load(paths["scaler"])
        self.label_encoder = joblib.load(paths["label_encoder"])
        self.land_cover_encoder = joblib.load(paths["land_cover_encoder"])
        self.soil_type_encoder = joblib.load(paths["soil_type_encoder"])
        self.metadata = json.loads(paths["metadata"].read_text(encoding="utf-8"))

        self.feature_names = list(self.metadata["features"])
        self.class_names = [str(label) for label in self.label_encoder.classes_]
        scaler_features = list(getattr(self.scaler, "feature_names_in_", []))
        if scaler_features and scaler_features != self.feature_names:
            raise ModelLoadError("Scaler feature order does not match model metadata.")

        self.numeric_defaults = {
            name: float(value)
            for name, value in zip(self.feature_names, self.scaler.mean_, strict=True)
            if name not in {"land_cover_encoded", "soil_type_encoded"}
        }

        logger.info(
            "Loaded disaster prediction model",
            extra={
                "model_name": self.metadata.get("model_name"),
                "version": self.metadata.get("model_version"),
                "features": len(self.feature_names),
            },
        )

    def predict(self, request: DisasterPredictionRequest) -> DisasterPredictionResponse:
        """Run preprocessing and model inference for a single request."""

        if not self.is_loaded:
            raise ModelLoadError("Disaster prediction model is not loaded.")

        start = time.perf_counter()
        feature_frame, imputed_fields = self.prepare_features(request)
        probabilities = self.model.predict_proba(feature_frame.to_numpy())[0]
        predicted_index = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_index])
        predicted_disaster = self.class_names[predicted_index]
        processing_time_ms = round((time.perf_counter() - start) * 1000, 4)

        return DisasterPredictionResponse(
            model_name=str(self.metadata["model_name"]),
            model_version=str(self.metadata["model_version"]),
            predicted_disaster=predicted_disaster,
            predicted_class_index=predicted_index,
            confidence=confidence,
            risk_level=self._risk_level(confidence),
            probabilities=[
                ClassProbability(label=label, probability=float(probability))
                for label, probability in zip(self.class_names, probabilities, strict=True)
            ],
            features=[
                FeatureValue(name=name, value=float(feature_frame.iloc[0][name]))
                for name in self.feature_names
            ],
            imputed_fields=imputed_fields,
            processing_time_ms=processing_time_ms,
        )

    def prepare_features(
        self, request: DisasterPredictionRequest
    ) -> tuple[pd.DataFrame, dict[str, float | str]]:
        """Apply the exact Phase 2 feature engineering and scaler transform."""

        raw, imputed_fields = self._raw_feature_values(request)
        raw["land_cover_encoded"] = float(
            self._encode_category(
                "land_cover",
                str(raw.pop("land_cover")),
                self.land_cover_encoder,
            )
        )
        raw["soil_type_encoded"] = float(
            self._encode_category(
                "soil_type",
                str(raw.pop("soil_type")),
                self.soil_type_encoder,
            )
        )
        raw["heat_index"] = raw["temperature_c"] + 0.5 * raw["humidity_pct"]
        raw["wind_pressure_ratio"] = raw["wind_speed_kmh"] / raw["pressure_hpa"]
        raw["rainfall_intensity"] = raw["rainfall_mm"] / (raw["humidity_pct"] + 1)
        raw["flood_risk_composite"] = (
            raw["rainfall_mm"] * 0.3
            + raw["water_level_m"] * 0.3
            + raw["river_discharge"] / 100 * 0.2
            + (1 / (raw["elevation_m"] + 1)) * 1000 * 0.2
        )

        unscaled = pd.DataFrame([{name: raw[name] for name in self.feature_names}])
        scaled = pd.DataFrame(
            self.scaler.transform(unscaled),
            columns=self.feature_names,
        )
        return scaled, imputed_fields

    def _raw_feature_values(
        self, request: DisasterPredictionRequest
    ) -> tuple[dict[str, float | str], dict[str, float | str]]:
        imputed: dict[str, float | str] = {}

        def numeric(name: str, value: float | None) -> float:
            if value is not None:
                return float(value)
            default = self.numeric_defaults[name]
            imputed[name] = default
            return default

        land_cover = request.land_cover or "Urban"
        soil_type = request.soil_type or "Alluvial"
        if request.land_cover is None:
            imputed["land_cover"] = land_cover
        if request.soil_type is None:
            imputed["soil_type"] = soil_type

        return (
            {
                "rainfall_mm": float(request.rainfall_mm),
                "temperature_c": float(request.temperature_c),
                "humidity_pct": float(request.humidity_pct),
                "river_discharge": numeric("river_discharge", request.river_discharge),
                "water_level_m": numeric("water_level_m", request.water_level_m),
                "elevation_m": numeric("elevation_m", request.elevation_m),
                "wind_speed_kmh": numeric("wind_speed_kmh", request.wind_speed_kmh),
                "pressure_hpa": numeric("pressure_hpa", request.pressure_hpa),
                "population_density": numeric(
                    "population_density", request.population_density
                ),
                "land_cover": land_cover,
                "soil_type": soil_type,
            },
            imputed,
        )

    def _encode_category(self, field_name: str, value: str, encoder: Any) -> int:
        classes = [str(label) for label in encoder.classes_]
        normalized = {label.lower(): label for label in classes}
        selected = normalized.get(value.strip().lower())
        if selected is None:
            allowed = ", ".join(classes)
            raise PreprocessingError(
                f"Unsupported {field_name} '{value}'. Allowed values: {allowed}."
            )
        return int(encoder.transform([selected])[0])

    @staticmethod
    def _risk_level(confidence: float) -> RiskLevel:
        if confidence >= 0.85:
            return "CRITICAL"
        if confidence >= 0.65:
            return "HIGH"
        if confidence >= 0.40:
            return "MODERATE"
        return "LOW"

    @staticmethod
    def _require_file(name: str, path: Path) -> None:
        if not path.is_file():
            raise ModelLoadError(f"Required {name} artifact not found: {path}")
