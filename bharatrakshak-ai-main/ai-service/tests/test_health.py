"""Smoke tests for service health."""

from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_reports_loaded_models() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["models"]["disaster_prediction"] == "loaded"
    assert payload["models"]["sos_priority"] == "loaded"
