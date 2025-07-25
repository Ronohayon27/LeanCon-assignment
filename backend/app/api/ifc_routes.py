from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.geometry_parsing import parse_geometry_data
from app.services.db_service import save_ifc_model, get_ifc_model_by_id, get_all_ifc_models
import os

router = APIRouter()

IFC_DIR = os.path.join(os.getcwd(), "ifc")
os.makedirs(IFC_DIR, exist_ok=True)

@router.post("/api/v1/ifc")
async def upload_and_parse_ifc(file: UploadFile = File(...)):
    try:
        # Save file to disk
        file_name = file.filename
        file_path = os.path.abspath(os.path.join(IFC_DIR, file_name))

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Parse the IFC file
        parsed = parse_geometry_data(file_path)

        if "error" in parsed:
            raise HTTPException(status_code=400, detail=f"Failed to parse IFC: {parsed['error']}")

        # Save metadata and parsed data using the db service
        return save_ifc_model(file_name, file_path, parsed)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/ifc/{id}")
def get_parsed_ifc(id: str):
    try:
        doc = get_ifc_model_by_id(id)
        if not doc:
            raise HTTPException(status_code=404, detail="IFC file not found")

        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/ifc")
def list_all_ifc_files():
    try:
        return get_all_ifc_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
