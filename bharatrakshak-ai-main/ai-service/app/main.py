"""FastAPI entrypoint for BharatRakshak AI."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.routers.health import router as health_router
from app.routers.prediction import router as prediction_router
from app.services.disaster_model import DisasterPredictionService
from app.services.sos_priority_model import SosPriorityService
from app.utils.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Load model artifacts once during application startup."""

    settings = get_settings()
    configure_logging(settings.log_level)
    disaster_service = DisasterPredictionService(settings)
    disaster_service.load()
    app.state.disaster_service = disaster_service

    sos_priority_service = SosPriorityService(settings)
    sos_priority_service.load()
    app.state.sos_priority_service = sos_priority_service
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Production AI inference service for BharatRakshak AI.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(prediction_router)
    return app


app = create_app()
