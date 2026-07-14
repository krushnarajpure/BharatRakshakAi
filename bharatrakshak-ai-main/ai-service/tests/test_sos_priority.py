"""Smoke tests for SOS priority inference."""

from fastapi.testclient import TestClient

from app.main import app


VALID_SOS_PAYLOAD = {
    "emergency_message": "URGENT! Flood water rising in Assam village. 40 people trapped including elderly. Need rescue immediately!",
    "disaster_type": "flood",
    "people_affected": 40,
    "medical_emergency": True,
    "vulnerable_groups": "elderly",
    "infrastructure_damage": True,
    "location_type": "rural",
    "time_of_day": "night",
}


def test_sos_priority_endpoint_returns_model_output() -> None:
    with TestClient(app) as client:
        response = client.post("/api/v1/predict/sos-priority", json=VALID_SOS_PAYLOAD)

    assert response.status_code == 200
    payload = response.json()
    assert payload["priority"] in {"Critical", "High", "Medium", "Low"}
    assert 0.0 <= payload["confidence"] <= 1.0
    assert payload["estimated_response_time"]
    assert payload["recommended_action"]
    assert len(payload["probabilities"]) == 4


def test_sos_priority_endpoint_accepts_camel_case_names() -> None:
    payload = {
        "emergencyMessage": "SOS! Factory fire spreading. 22 workers injured and need medical support now!",
        "disasterType": "fire",
        "peopleAffected": 22,
        "medicalEmergency": True,
        "vulnerableGroups": "disabled",
        "infrastructureDamage": True,
        "locationType": "urban",
        "timeOfDay": "evening",
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/predict/sos-priority", json=payload)

    assert response.status_code == 200
    assert len(response.json()["probabilities"]) == 4


def test_sos_priority_endpoint_rejects_unknown_category() -> None:
    invalid_payload = dict(VALID_SOS_PAYLOAD)
    invalid_payload["disaster_type"] = "tsunami"

    with TestClient(app) as client:
        response = client.post("/api/v1/predict/sos-priority", json=invalid_payload)

    assert response.status_code == 422
    assert "Unsupported disaster_type" in response.json()["detail"]
