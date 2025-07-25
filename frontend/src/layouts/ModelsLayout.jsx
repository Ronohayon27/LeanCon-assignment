import { Outlet, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useModels } from "@/hooks/useModels";

export default function ModelsLayout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { models, loading } = useModels();

  const handleModelSelect = (modelId) => {
    navigate(`/models/${modelId}`);
  };

  // Redirect to first model if no id in URL
  if (!loading && models.length > 0 && !id) {
    navigate(`/models/${models[0].id || models[0]._id}`, { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading models...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">
          LeanCon IFC Model Viewer
        </h1>
        <p className="text-sm text-gray-500">
          Analyze and visualize your BIM models with ease
        </p>
      </header>

      {/* Spacer to account for fixed header height */}
      <div className="h-[84px]"></div>

      {/* Main content with sidebar + outlet */}
      <div className="flex flex-1">
        {/* Fixed sidebar */}
        <div className="fixed left-0 top-[84px] bottom-0 z-10 w-64">
          <Sidebar activeModelId={id} onModelSelect={handleModelSelect} />
        </div>

        {/* Spacer for sidebar */}
        <div className="w-64 flex-shrink-0"></div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
