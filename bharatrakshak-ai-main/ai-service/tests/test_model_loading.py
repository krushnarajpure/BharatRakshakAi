"""Tests for model artifact loading and preprocessing."""

from app.config.settings import get_settings
from app.schemas.disaster import DisasterPredictionRequest
from app.schemas.sos import SosPriorityRequest
from app.services.disaster_model import DisasterPredictionService
from app.services.sos_priority_model import SosPriorityService


def test_disaster_model_artifacts_load_successfully() -> None:
    service = DisasterPredictionService(get_settings())
    service.load()

    assert service.is_loaded
    assert service.class_names == ["cyclone", "flood", "heatwave", "landslide"]
    assert len(service.feature_names) == 15


def test_preprocessing_outputs_training_feature_order() -> None:
    service = DisasterPredictionService(get_settings())
    service.load()
    request = DisasterPredictionRequest(
        rainfall_mm=120.0,
        temperature_c=31.0,
        humidity_pct=82.0,
        water_level_m=5.2,
        land_cover="Urban",
        soil_type="Sandy",
    )

    features, imputed = service.prepare_features(request)

    assert list(features.columns) == service.feature_names
    assert features.shape == (1, 15)
    assert "river_discharge" in imputed
    assert "pressure_hpa" in imputed



def test_sos_priority_model_artifacts_load_successfully() -> None:
    service = SosPriorityService(get_settings())
    service.load()

    assert service.is_loaded
    assert service.class_names == ["critical", "high", "low", "medium"]
    assert len(service.feature_names) == 511


def test_sos_priority_preprocessing_outputs_training_feature_order() -> None:
    service = SosPriorityService(get_settings())
    service.load()
    request = SosPriorityRequest(
        emergency_message="URGENT! Flood water rising. 40 people trapped including elderly.",
        disaster_type="flood",
        people_affected=40,
        medical_emergency=True,
        vulnerable_groups="elderly",
        infrastructure_damage=True,
        location_type="rural",
        time_of_day="night",
    )

    features = service.prepare_features(request)

    assert list(features.columns) == service.feature_names
    assert features.shape == (1, 511)
