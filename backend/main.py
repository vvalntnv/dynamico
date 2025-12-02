from fastapi import FastAPI
from api.routers import health_router

app = FastAPI(summary="Dynamic financing")

app.include_router(health_router)
