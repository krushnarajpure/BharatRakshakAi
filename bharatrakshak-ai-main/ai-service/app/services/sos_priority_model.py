"""Inference service for the Phase 4 SOS priority classifier."""

from __future__ import annotations

import json
import logging
import re
import time
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.config.settings import Settings
from app.schemas.sos import (
    SosPriorityProbability,
    SosPriorityRequest,
    SosPriorityResponse,
)
from app.services.disaster_model import ModelLoadError, PreprocessingError

logger = logging.getLogger(__name__)


class SosPriorityService:
    """Load Phase 4 SOS artifacts and run production inference."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model: Any | None = None
        self.vectorizer: Any | None = None
        self.scaler: Any | None = None
        self.metadata: dict[str, Any] = {}
        self.feature_names: list[str] = []
        self.structured_features: list[str] = []
        self.class_names: list[str] = []
        self.categorical_mappings: dict[str, dict[str, int]] = {}
        self.response_policy: dict[str, dict[str, str]] = {}

    @property
    def is_loaded(self) -> bool:
        """Return whether all required SOS artifacts are loaded."""

        return all(
            artifact is not None
            for artifact in (self.model, self.vectorizer, self.scaler)
        ) and bool(self.metadata)

    def load(self) -> None:
        """Load model, vectorizer, scaler, and metadata from disk."""

        paths = {
            "model": self.settings.sos_model_path,
            "vectorizer": self.settings.sos_vectorizer_path,
            "scaler": self.settings.sos_feature_scaler_path,
            "metadata": self.settings.sos_metadata_path,
        }
        for name, path in paths.items():
            self._require_file(name, path)

        self.model = joblib.load(paths["model"])
        self.vectorizer = joblib.load(paths["vectorizer"])
        self.scaler = joblib.load(paths["scaler"])
        self.metadata = json.loads(paths["metadata"].read_text(encoding="utf-8"))

        preprocessing = self.metadata["preprocessing"]
        self.feature_names = list(preprocessing["feature_columns"])
        self.structured_features = list(preprocessing["structured_features"])
        self.class_names = [str(label) for label in preprocessing["class_names"]]
        self.categorical_mappings = {
            field: {str(key).lower(): int(value) for key, value in mapping.items()}
            for field, mapping in preprocessing["categorical_mappings"].items()
        }
        self.response_policy = self.metadata.get("response_policy", {})

        scaler_features = list(getattr(self.scaler, "feature_names_in_", []))
        if scaler_features and scaler_features != self.structured_features:
            raise ModelLoadError("SOS scaler feature order does not match metadata.")

        expected_tfidf = preprocessing.get("tfidf_feature_count")
        actual_tfidf = len(self.vectorizer.get_feature_names_out())
        if expected_tfidf is not None and int(expected_tfidf) != actual_tfidf:
            raise ModelLoadError("SOS vectorizer feature count does not match metadata.")

        logger.info(
            "Loaded SOS priority model",
            extra={
                "model_name": self.metadata.get("model_name"),
                "version": self.metadata.get("model_version"),
                "features": len(self.feature_names),
            },
        )

    def predict(self, request: SosPriorityRequest) -> SosPriorityResponse:
        """Run preprocessing and model inference for a single SOS request."""

        if not self.is_loaded:
            raise ModelLoadError("SOS priority model is not loaded.")

        start = time.perf_counter()
        feature_frame = self.prepare_features(request)
        probabilities = np.asarray(self.model.predict_proba(feature_frame), dtype=float)[0]
        predicted_index = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_index])
        priority_key = self.class_names[predicted_index]
        policy = self.response_policy.get(priority_key, {})
        processing_time_ms = round((time.perf_counter() - start) * 1000, 4)

        return SosPriorityResponse(
            model_name=str(self.metadata["model_name"]),
            model_version=str(self.metadata["model_version"]),
            priority=self._display_priority(priority_key),
            priority_class_index=predicted_index,
            confidence=confidence,
            estimated_response_time=str(
                policy.get("estimated_response_time", "Response time unavailable")
            ),
            recommended_action=str(
                policy.get("recommended_action", "Route to emergency operations center.")
            ),
            probabilities=[
                SosPriorityProbability(
                    priority=self._display_priority(label),
                    probability=float(probability),
                )
                for label, probability in zip(self.class_names, probabilities, strict=True)
            ],
            processing_time_ms=processing_time_ms,
        )

    def prepare_features(self, request: SosPriorityRequest) -> pd.DataFrame:
        """Apply Phase 2 SOS feature engineering using saved preprocessors."""

        message = request.emergency_message
        structured = {
            "people_affected": float(request.people_affected),
            "medical_emergency": int(request.medical_emergency),
            "infrastructure_damage": int(request.infrastructure_damage),
            "disaster_type_encoded": self._encode_category(
                "disaster_type", request.disaster_type
            ),
            "vulnerable_groups_encoded": self._encode_category(
                "vulnerable_groups", request.vulnerable_groups
            ),
            "location_type_encoded": self._encode_category(
                "location_type", request.location_type
            ),
            "time_of_day_encoded": self._encode_category("time_of_day", request.time_of_day),
            "message_length": float(len(message)),
            "word_count": float(len(message.split())),
            "exclamation_count": float(message.count("!")),
            "has_urgent": float(
                bool(
                    re.search(
                        r"URGENT|MAYDAY|SOS|EMERGENCY|NOW|IMMEDIATELY|CRITICAL",
                        message,
                        flags=re.IGNORECASE,
                    )
                )
            ),
        }
        structured_frame = pd.DataFrame(
            [{name: structured[name] for name in self.structured_features}]
        )
        scaled_structured = pd.DataFrame(
            self.scaler.transform(structured_frame),
            columns=self.structured_features,
        )

        cleaned_message = self._clean_text(message)
        tfidf_matrix = self.vectorizer.transform([cleaned_message])
        tfidf_columns = [
            f"tfidf_{feature}" for feature in self.vectorizer.get_feature_names_out()
        ]
        tfidf_frame = pd.DataFrame(tfidf_matrix.toarray(), columns=tfidf_columns)

        combined = pd.concat(
            [scaled_structured.reset_index(drop=True), tfidf_frame.reset_index(drop=True)],
            axis=1,
        )
        missing = [name for name in self.feature_names if name not in combined.columns]
        if missing:
            raise PreprocessingError(f"Missing SOS feature(s): {missing}")
        return combined[self.feature_names]

    def _encode_category(self, field_name: str, value: str) -> float:
        mapping = self.categorical_mappings.get(field_name, {})
        normalized = str(value).strip().lower()
        if normalized not in mapping:
            allowed = ", ".join(sorted(mapping))
            raise PreprocessingError(
                f"Unsupported {field_name} '{value}'. Allowed values: {allowed}."
            )
        return float(mapping[normalized])

    @staticmethod
    def _clean_text(text: str) -> str:
        cleaned = str(text).lower()
        cleaned = re.sub(r"[^\w\s!?.,]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @staticmethod
    def _display_priority(priority: str) -> str:
        return priority.strip().title()

    @staticmethod
    def _require_file(name: str, path: Path) -> None:
        if not path.is_file():
            raise ModelLoadError(f"Required {name} artifact not found: {path}")
