"""Runtime settings for the BharatRakshak AI service."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment with safe local defaults."""

    model_config = SettingsConfigDict(env_prefix="AI_SERVICE_", extra="ignore")

    app_name: str = "BharatRakshak AI Service"
    app_version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    environment: str = Field(default="development")
    log_level: str = Field(default="INFO")

    base_dir: Path = Path(__file__).resolve().parents[2]

    @property
    def models_dir(self) -> Path:
        return self.base_dir / "models"

    @property
    def disaster_model_path(self) -> Path:
        return self.models_dir / "disaster_prediction_xgb.joblib"

    @property
    def disaster_metadata_path(self) -> Path:
        return self.models_dir / "disaster_model_metadata.json"

    @property
    def disaster_scaler_path(self) -> Path:
        return self.models_dir / "disaster_scaler.joblib"

    @property
    def disaster_label_encoder_path(self) -> Path:
        return self.models_dir / "disaster_label_encoder.joblib"

    @property
    def land_cover_encoder_path(self) -> Path:
        return self.models_dir / "land_cover_encoder.joblib"

    @property
    def soil_type_encoder_path(self) -> Path:
        return self.models_dir / "soil_type_encoder.joblib"


    @property
    def sos_model_path(self) -> Path:
        return self.models_dir / "sos_model.joblib"

    @property
    def sos_metadata_path(self) -> Path:
        return self.models_dir / "metadata.json"

    @property
    def sos_vectorizer_path(self) -> Path:
        return self.models_dir / "sos_vectorizer.joblib"

    @property
    def sos_feature_scaler_path(self) -> Path:
        return self.models_dir / "sos_feature_scaler.joblib"


@lru_cache
def get_settings() -> Settings:
    """Return cached runtime settings."""

    return Settings()
