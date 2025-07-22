import { useEffect, useState } from "react";
import { createColumns } from "../../components/matsTable/columns";
import { DataTable } from "../../components/matsTable/data-table";
import IfcViewer from "../../components/OpenCompanyViewer";
import Sidebar from "../../components/Sidebar";
import { fetchModelData } from "../../services/modelService";

export default function ModelsPage() {
  // Available models
  const [models] = useState([
    {
      id: 2,
      name: "Simple Example",
      path: "/ifc/simple_example.ifc",
      dataUrl: 2,
      elements: 124,
    },
    {
      id: 1,
      name: "Advanced Sample",
      path: "/ifc/adv.ifc",
      dataUrl: 1,
      elements: 907,
    },
  ]);

  // Current model state
  const [activeModelId, setActiveModelId] = useState(2); // Default to Simple Example
  const [modelPath, setModelPath] = useState("/ifc/simple_example.ifc");

  // Data state
  const [data, setData] = useState([]);
  const [uniqueLevels, setUniqueLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Handle model selection
  const handleModelSelect = (modelId) => {
    if (modelId === activeModelId) return;

    // Reset state
    setSelectedElementIds([]);
    setSelectedLevel(null);
    setLoading(true);

    // Update active model
    setActiveModelId(modelId);

    // Find the selected model
    const selectedModel = models.find((model) => model.id === modelId);
    if (selectedModel) {
      setModelPath(selectedModel.path);

      // Fetch data for the selected model using the service
      fetchModelData(selectedModel.dataUrl)
        .then((response) => {
          setData(response.data || response);
          setUniqueLevels(response.metadata.all_levels || []);
          console.log("Fetched data for model:", selectedModel.name);
          console.log("Unique levels:", response.metadata.all_levels || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  // Initial data load
  useEffect(() => {
    // Get the initial model
    const initialModel = models.find((model) => model.id === activeModelId);
    if (initialModel) {
      // Use the modelService to fetch data
      fetchModelData(initialModel.dataUrl)
        .then((response) => {
          setData(response.data || response);
          setUniqueLevels(response.metadata.all_levels || []);
          console.log("Fetched data for model:", initialModel.name);
          console.log("Unique levels:", response.metadata.all_levels || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [models, activeModelId]);

  const handleRowClick = (row) => {
    // Collect all expressIds from all levels for this element
    const allExpressIds = [];

    // Get the element data
    const elementData = row.original;

    // Go through each level in the element's levels object
    if (elementData.levels) {
      Object.values(elementData.levels).forEach((levelData) => {
        if (levelData.expressIds && Array.isArray(levelData.expressIds)) {
          // Add all express IDs from this level to our collection
          allExpressIds.push(...levelData.expressIds);
        }
      });
    }

    console.log("Selected element:", elementData.name);
    console.log(
      "Total expressIds found across all levels:",
      allExpressIds.length
    );
    console.log("Express IDs:", allExpressIds);

    // Set the selected element IDs to highlight in the viewer
    setSelectedElementIds(allExpressIds);
    setSelectedLevel(null);
  };

  const handleLevelClick = (levelName) => {
    console.log(`Clicked on level: ${levelName}`);

    if (selectedLevel === levelName) {
      setSelectedLevel(null);
      setSelectedElementIds([]);
      console.log(`Deselected level: ${levelName}`);
      return;
    }

    setSelectedLevel(levelName);

    const allExpressIds = [];
    data.forEach((row) => {
      const levelData = row.levels?.[levelName];
      if (levelData?.count > 0 && levelData.expressIds) {
        allExpressIds.push(...levelData.expressIds);
      }
    });

    console.log(
      `Found ${allExpressIds.length} elements on ${levelName}:`,
      allExpressIds
    );
    setSelectedElementIds(allExpressIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <header className="w-full bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">
          LeanCon IFC Model Analyzer
        </h1>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Sidebar
          models={models}
          activeModelId={activeModelId}
          onModelSelect={handleModelSelect}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {models.find((m) => m.id === activeModelId)?.name ||
                "Model Viewer"}
            </h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[50vh]">
              <IfcViewer
                selectedElementIds={selectedElementIds}
                modelPath={modelPath}
                key={`model-${activeModelId}`}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Element Analysis
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">
                  Loading model data...
                </span>
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
    </div>
  );
}
