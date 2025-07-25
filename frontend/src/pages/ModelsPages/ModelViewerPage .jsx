import { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import { fetchModelDataMongo } from "@/services/modelService";
import { useModels } from "@/hooks/useModels";
import { createColumns } from "@/components/matsTable/columns";
import { DataTable } from "@/components/matsTable/data-table";
import IfcViewer from "@/components/OpenCompanyViewer";

export default function ModelViewerPage() {
  const { id } = useParams();
  const { models } = useModels();
  const [modelPath, setModelPath] = useState("");
  const [data, setData] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Reset selected level when model changes
    setSelectedLevel(null);
    setSelectedElementIds([]);

    const selectedModel = models.find(
      (model) => model._id === id || model.id === id
    );
    if (selectedModel) {
      fetchModelDataMongo(id)
        .then((response) => {
          setData(response.parsed_data.data || response);
          setUniqueLevels(response.parsed_data.metadata?.all_levels || []);
          const path = response.localmachin_path || "";
          setModelPath(path);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, models]);

  const handleRowClick = (row) => {
    const expressIds = Object.values(row.original.levels || {}).flatMap(
      (levelData) => levelData.expressIds || []
    );
    setSelectedElementIds(expressIds);
    setSelectedLevel(null);
  };

  const handleLevelClick = (levelName) => {
    if (selectedLevel === levelName) {
      setSelectedLevel(null);
      setSelectedElementIds([]);
      return;
    }

    setSelectedLevel(levelName);

    const allExpressIds = data.flatMap(
      (row) => row.levels?.[levelName]?.expressIds || []
    );

    setSelectedElementIds(allExpressIds);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-4">
        <div className="relative h-[70vh] w-full rounded-lg shadow-lg overflow-hidden mt-20">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                Loading viewer...
              </div>
            }
          >
            <IfcViewer
              key={`model-${id}-${modelPath}`}
              modelPath={modelPath}
              selectedElementIds={selectedElementIds}
            />
          </Suspense>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Element Analysis
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading model data...</span>
            </div>
          ) : (
            <DataTable
              columns={createColumns(
                uniqueLevels,
                handleLevelClick,
                selectedLevel
              )}
              data={data}
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
