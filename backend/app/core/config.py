import os
from pathlib import Path

class Settings:
    # Base directory
    BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
      
    # CORS settings
    ALLOWED_ORIGINS = ["*"] 

settings = Settings()
