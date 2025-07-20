from fastapi import APIRouter
from app.services.ifc_parser import get_element_summary
from app.core.config import settings

router = APIRouter()

@router.get("/api/elements")
def get_elements():
    return get_element_summary(settings.IFC_PATH)
