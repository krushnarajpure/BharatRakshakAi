"""Request and response schemas for SOS priority classification."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SosPriorityRequest(BaseModel):
    """Raw SOS request fields used by the Phase 4 priority model."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    emergency_message: str = Field(min_length=3, max_length=2000)
    disaster_type: str = Field(max_length=50)
    people_affected: int = Field(ge=0, le=1_000_000)
    medical_emergency: bool = False
    vulnerable_groups: str = Field(default="none", max_length=50)
    infrastructure_damage: bool = False
    location_type: str = Field(default="urban", max_length=50)
    time_of_day: str = Field(default="afternoon", max_length=50)

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_names(cls, data: Any) -> Any:
        """Accept snake_case and common camelCase names from API clients."""

        if not isinstance(data, dict):
            return data

        normalized = dict(data)
        legacy_pairs = {
            "message": "emergency_message",
            "emergencyMessage": "emergency_message",
            "disasterType": "disaster_type",
            "peopleAffected": "people_affected",
            "medicalEmergency": "medical_emergency",
            "vulnerableGroups": "vulnerable_groups",
            "infrastructureDamage": "infrastructure_damage",
            "locationType": "location_type",
            "timeOfDay": "time_of_day",
        }
        for legacy_name, canonical_name in legacy_pairs.items():
            if legacy_name in normalized and canonical_name not in normalized:
                normalized[canonical_name] = normalized.pop(legacy_name)
        return normalized


class SosPriorityProbability(BaseModel):
    """Probability assigned to one SOS priority class."""

    priority: str
    probability: float = Field(ge=0.0, le=1.0)


class SosPriorityResponse(BaseModel):
    """Prediction response from the Phase 4 SOS priority model."""

    model_name: str
    model_version: str
    priority: str
    priority_class_index: int
    confidence: float = Field(ge=0.0, le=1.0)
    estimated_response_time: str
    recommended_action: str
    probabilities: list[SosPriorityProbability]
    processing_time_ms: float
