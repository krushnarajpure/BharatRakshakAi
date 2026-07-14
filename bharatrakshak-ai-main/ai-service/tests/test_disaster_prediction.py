"""Smoke tests for disaster prediction inference."""

from fastapi.testclient import TestClient

from app.main import app


VALID_PAYLOAD = {
    "state": "Assam",
    "district": "Dibrugarh",
    "rainfall_mm": 180.0,
    "temperature_c": 30.5,
    "humidity_pct": 88.0,
    "river_discharge": 4200.0,
    "water_level_m": 7.5,
    "elevation_m": 120.0,
    "wind_speed_kmh": 28.0,
    "pressure_hpa": 1001.0,
    "population_density": 950.0,
    "land_cover": "Agricultural",
    "soil_type": "Alluvial",
}


def test_prediction_endpoint_returns_model_output() -> None:
    with TestClient(app) as client:
        response = client.post("/api/v1/predict/disaster", json=VALID_PAYLOAD)

    assert response.status_code == 200
    payload = response.json()
    assert payload["predicted_disaster"] in {
        "cyclone",
        "flood",
        "heatwave",
        "landslide",
    }
    assert 0.0 <= payload["confidence"] <= 1.0
    assert len(payload["probabilities"]) == 4
    assert len(payload["features"]) == 15


def test_prediction_endpoint_accepts_legacy_humidity_and_river_names() -> None:
    legacy_payload = dict(VALID_PAYLOAD)
    legacy_payload["humidity"] = legacy_payload.pop("humidity_pct")
    legacy_payload["river_level_m"] = legacy_payload.pop("water_level_m")

    with TestClient(app) as client:
        response = client.post("/api/v1/predict/disaster", json=legacy_payload)

    assert response.status_code == 200
    assert len(response.json()["probabilities"]) == 4


def test_prediction_endpoint_rejects_unknown_category() -> None:
    invalid_payload = dict(VALID_PAYLOAD)
    invalid_payload["land_cover"] = "Glacier"

    with TestClient(app) as client:
        response = client.post("/api/v1/predict/disaster", json=invalid_payload)

    assert response.status_code == 422
    assert "Unsupported land_cover" in response.json()["detail"]
