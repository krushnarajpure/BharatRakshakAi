"""Prediction endpoints."""

from fastapi import APIRouter, HTTPException, Request, status

from app.schemas.disaster import DisasterPredictionRequest, DisasterPredictionResponse
from app.schemas.sos import SosPriorityRequest, SosPriorityResponse
from app.services.disaster_model import (
    DisasterPredictionService,
    ModelLoadError,
    PreprocessingError,
)
from app.services.sos_priority_model import SosPriorityService

router = APIRouter(prefix="/api/v1/predict", tags=["prediction"])


def get_disaster_service(request: Request) -> DisasterPredictionService:
    """Return the loaded disaster prediction service from app state."""

    service = getattr(request.app.state, "disaster_service", None)
    if service is None or not service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Disaster prediction model is not loaded.",
        )
    return service


def get_sos_priority_service(request: Request) -> SosPriorityService:
    """Return the loaded SOS priority service from app state."""

    service = getattr(request.app.state, "sos_priority_service", None)
    if service is None or not service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SOS priority model is not loaded.",
        )
    return service


@router.post("/disaster", response_model=DisasterPredictionResponse)
def predict_disaster(
    payload: DisasterPredictionRequest,
    request: Request,
) -> DisasterPredictionResponse:
    """Predict the most likely disaster class from raw environmental inputs."""

    service = get_disaster_service(request)
    try:
        return service.predict(payload)
    except PreprocessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except ModelLoadError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/sos-priority", response_model=SosPriorityResponse)
def predict_sos_priority(
    payload: SosPriorityRequest,
    request: Request,
) -> SosPriorityResponse:
    """Predict emergency priority for an incoming SOS request."""

    service = get_sos_priority_service(request)
    try:
        return service.predict(payload)
    except PreprocessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except ModelLoadError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
