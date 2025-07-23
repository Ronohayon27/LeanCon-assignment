from fastapi import APIRouter, HTTPException, Path
from app.core.config import settings
import os
import json

router = APIRouter()

@router.get("/api/v1/geometry/{geometry_id}")
def get_geometry_by_id(geometry_id: int = Path(..., title="The ID of the geometry file to retrieve")):
    """
    Retrieve geometry data by ID.
    
    This endpoint returns the geometry data from the JSON file corresponding to the provided ID.
    For example, ID 1 will return data from 1.json, ID 2 from 2.json, etc.
    """
    try:
        # Construct the file path - data files are in the data directory
        file_path = os.path.join(settings.BASE_DIR, "data", f"{geometry_id}.json")
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Geometry data with ID {geometry_id} not found")
        
        # Read and parse the JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            geometry_data = json.load(f)
            
        return geometry_data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Error parsing geometry data file {geometry_id}.json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving geometry data: {str(e)}")
