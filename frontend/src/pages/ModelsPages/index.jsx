import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadModelFile } from "@/services/modelService";
import { useModels } from "@/hooks/useModels";

export default function ModelsEntryPage() {
  const { models, loading } = useModels();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && models.length > 0) {
      // Add a small delay to allow IFC viewer components to properly initialize
      // This prevents the "fragments not initialized" error when navigating
      // from the entry page to the first model
      setTimeout(() => {
        navigate(`/models/${models[0].id || models[0]._id}`);
      }, 100); // 100ms delay should be sufficient for initialization
    }
  }, [loading, models, navigate]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".ifc")) {
      setError("Please upload a valid .ifc file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setError(null);

    try {
      const res = await UploadModelFile(formData);

      if (res.ok) {
        navigate(`/models/${res.id}`);
      } else {
        setError(res.detail || "Failed to upload model");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 px-4">
      {loading ? (
        <p className="text-gray-600 text-lg">Loading available models...</p>
      ) : (
        <>
          <p className="text-gray-700 text-lg">Upload an IFC model to begin:</p>

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow transition">
            {uploading ? "Uploading..." : "Select .IFC File"}
            <input
              type="file"
              accept=".ifc"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </>
      )}
    </div>
  );
}
