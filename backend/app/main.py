from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.ifc_routes import router
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
import os

IFC_DIR = os.path.join(os.getcwd(), "ifc") 



app = FastAPI(title="LeanCon IFC API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/ifc", StaticFiles(directory=IFC_DIR), name="ifc")

# Routes
app.include_router(router)
