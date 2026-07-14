"""Health endpoints."""

from fastapi import APIRouter, Request

from app.config.settings import get_settings
from app.schemas.disaster import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Return service health and model loading status."""

    settings = get_settings()
    disaster_service = getattr(request.app.state, "disaster_service", None)
    sos_priority_service = getattr(request.app.state, "sos_priority_service", None)
    disaster_status = (
        "loaded"
        if disaster_service is not None and disaster_service.is_loaded
        else "unavailable"
    )
    sos_priority_status = (
        "loaded"
        if sos_priority_service is not None and sos_priority_service.is_loaded
        else "unavailable"
    )
    models = {
        "disaster_prediction": disaster_status,
        "sos_priority": sos_priority_status,
    }
    status = "ok" if all(value == "loaded" for value in models.values()) else "degraded"

    return HealthResponse(
        status=status,
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        models=models,
    )
