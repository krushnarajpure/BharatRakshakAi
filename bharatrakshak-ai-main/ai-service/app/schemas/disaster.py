"""Request and response schemas for disaster prediction."""

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


RiskLevel = Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]


class DisasterPredictionRequest(BaseModel):
    """Raw feature request for the verified Phase 3 disaster model."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    latitude: float | None = Field(default=None, ge=6.0, le=38.0)
    longitude: float | None = Field(default=None, ge=68.0, le=98.0)

    rainfall_mm: float = Field(ge=0.0, le=1000.0)
    temperature_c: float = Field(ge=-20.0, le=60.0)
    humidity_pct: float = Field(ge=0.0, le=100.0)
    river_discharge: float | None = Field(default=None, ge=0.0)
    water_level_m: float | None = Field(default=None, ge=0.0)
    elevation_m: float | None = Field(default=None, ge=0.0)
    wind_speed_kmh: float | None = Field(default=None, ge=0.0)
    pressure_hpa: float | None = Field(default=None, ge=850.0, le=1100.0)
    population_density: float | None = Field(default=None, ge=0.0)
    land_cover: str | None = Field(default="Urban", max_length=50)
    soil_type: str | None = Field(default="Alluvial", max_length=50)

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_names(cls, data: Any) -> Any:
        """Accept legacy names used by the Express API while storing canonical names."""

        if not isinstance(data, dict):
            return data

        normalized = dict(data)
        legacy_pairs = {
            "humidity": "humidity_pct",
            "river_level_m": "water_level_m",
        }
        for legacy_name, canonical_name in legacy_pairs.items():
            if legacy_name in normalized and canonical_name not in normalized:
                normalized[canonical_name] = normalized.pop(legacy_name)
        return normalized


class ClassProbability(BaseModel):
    """Probability assigned to a disaster class."""

    label: str
    probability: float = Field(ge=0.0, le=1.0)


class FeatureValue(BaseModel):
    """Scaled model feature used for inference."""

    name: str
    value: float


class DisasterPredictionResponse(BaseModel):
    """Prediction response from the Phase 3 XGBoost model."""

    model_name: str
    model_version: str
    predicted_disaster: str
    predicted_class_index: int
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: RiskLevel
    probabilities: list[ClassProbability]
    features: list[FeatureValue]
    imputed_fields: dict[str, float | str]
    processing_time_ms: float


class HealthResponse(BaseModel):
    """Service health response."""

    status: Literal["ok", "degraded"]
    service: str
    version: str
    environment: str
    models: dict[str, str]
