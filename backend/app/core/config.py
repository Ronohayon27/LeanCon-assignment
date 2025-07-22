import os
from pathlib import Path

class Settings:
    # Base directory
    BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    # IFC file path
    IFC_PATH = "ifc/rstadvancedsampleproject.ifc"
    
    # CORS settings
    ALLOWED_ORIGINS = ["*"]  # Change this later to your frontend origin

settings = Settings()
