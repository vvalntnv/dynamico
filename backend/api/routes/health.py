from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health")


class HealthStatus(BaseModel):
    message: str


@router.get("/", status_code=200)
def get_health_status() -> HealthStatus:
    return HealthStatus(message="all good")
