import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, UploadCloud } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { useNavigate } from "react-router-dom";

import UploadingModal from "@/components/UploadingModal";

export default function LandingPage() {
  const navigate = useNavigate();
  const { models, setModels, loading } = useModels();
  const [modalOpen, setModalOpen] = useState(false);

  const handleModelUploaded = (newModel) => {
    setModels((prev) => [...prev, newModel]);
  };

  const hasModels = models.length > 0;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-10">
        <img
          src="/img/leancon.webp"
          alt="LeanCon city background"
          className="object-cover w-full h-full scale-100 fill-accent transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl w-full text-white px-6">
        <header className="text-center mb-4">
          <h1 className="text-6xl font-bold mb-6 drop-shadow-xl tracking-tight">
            IFC Analyzer
          </h1>
          <p className="text-2xl text-white/90 drop-shadow max-w-2xl mx-auto">
            Advanced BIM Model Analysis & Visualization
          </p>
        </header>

        <main className="bg-black/10 backdrop-blur-sm rounded-xl p-10 shadow-2xl border border-white/10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Intelligent IFC Data Analysis
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                This app provides interactive 3D visualization of IFC files
                using Three.js, along with a structured quantities table by
                element type and level. It supports element highlighting,
                selection, enabling clear and efficient exploration of building
                models for analysis and review.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-yellow-400 mr-3 hover:scale-110 transition-all duration-300" />
                  <span className="text-lg">
                    Element quantities by type and level
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-yellow-400 mr-3 hover:scale-110 transition-all duration-300" />
                  <span className="text-lg">Interactive 3D visualization</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-yellow-400 mr-3 hover:scale-110 transition-all duration-300" />
                  <span className="text-lg">Level-based element filtering</span>
                </li>
              </ul>

              {hasModels ? (
                <>
                  <Button
                    size="lg"
                    onClick={() =>
                      navigate(`/models/${models[0].id || models[0]._id}`)
                    }
                    className="bg-white hover:bg-yellow-100 hover:text-black text-gray-700 text-lg py-6 px-8 rounded-md font-medium transition-all duration-300 shadow-lg"
                  >
                    View Your Models
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <span className="mt-4 text-sm text-white/80 ml-4">
                    You currently have {models.length} model
                    {models.length > 1 ? "s" : ""}.
                  </span>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="hover:bg-yellow-100! hover:text-black text-gray-700 text-lg py-6 px-8 rounded-md font-medium transition-all duration-300 shadow-lg"
                  >
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Upload Your First Model
                  </Button>
                </>
              )}

              <UploadingModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onModelUploaded={handleModelUploaded}
                modelsCount={models.length}
              />
            </div>

            <div className="hidden md:block">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 shadow-xl overflow-hidden transform transition-all hover:scale-[1.02] duration-500">
                <img
                  src="/img/bim-illustration.svg"
                  alt="BIM Illustration"
                  className="w-full h-auto rounded filter drop-shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/500x350/1e1e1e/ff3e3e?text=BIM+Analysis";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
