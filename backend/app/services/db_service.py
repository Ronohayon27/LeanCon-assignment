from app.dataBase.mongo import ifc_collection
from bson import ObjectId
import datetime

def save_ifc_model(file_name, file_path, parsed_data):
    """
    Save IFC model data to MongoDB
    """
    saved_file_name = file_name.split('.')[0] if '.' in file_name else file_name
    
    # Create document for MongoDB
    doc = {
        "filename": saved_file_name,
        "file_path": file_path,
        "localmachin_path": f"http://localhost:8000/ifc/{file_name}",
        "uploaded_at": datetime.datetime.now(),
        "parsed_data": parsed_data
    }
    
    # Insert into MongoDB
    result = ifc_collection.insert_one(doc)
    
    return {
        "status": "uploaded",
        "id": str(result.inserted_id),
        "filename": saved_file_name,
        "summary": parsed_data["metadata"]
    }

def get_ifc_model_by_id(id):
    """
    Retrieve a single IFC model by ID
    """
    doc = ifc_collection.find_one({"_id": ObjectId(id)})
    
    if not doc:
        return None
    
    return {
        "id": str(doc["_id"]),
        "filename": doc["filename"],
        "file_path": doc["file_path"],
        "localmachin_path": doc["localmachin_path"],
        "uploaded_at": doc["uploaded_at"],
        "parsed_data": doc["parsed_data"]
    }

def get_all_ifc_models():
    """
    Retrieve all IFC models with summary information
    """
    docs = ifc_collection.find(
        {}, 
        {
            "_id": 1, 
            "filename": 1, 
            "uploaded_at": 1,
            "parsed_data.metadata.total_processed_elements": 1
        }
    )
    
    return [
        {
            "id": str(doc["_id"]),
            "filename": doc.get("filename"),
            "uploaded_at": doc.get("uploaded_at"),
            "elements": doc.get("parsed_data", {}).get("metadata", {}).get("total_processed_elements", 0)
        }
        for doc in docs
    ]
