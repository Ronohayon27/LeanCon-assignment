import React, { useState } from "react";
import { Button } from "./ui/button";
import { Building, Hash, Info, Plus } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import UploadingModal from "./UploadingModal";

export default function Sidebar({ activeModelId, onModelSelect }) {
  const { models, setModels } = useModels();
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="w-64 h-full bg-gradient-to-b from-slate-50 to-yellow-100 border-r border-slate-200 flex flex-col shadow-inner overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
          <Building className="w-5 h-5 mr-2 text-yellow-500" />
          IFC Models
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-4">
          {models.map((model) => (
            <li
              key={model.id}
              className={`overflow-hidden rounded-lg transition-all duration-300 ${
                activeModelId === model.id
                  ? "shadow-md z-10 scale-[1.04]"
                  : "hover:shadow-md"
              }`}
            >
              <Button
                onClick={() => onModelSelect(model.id)}
                variant={activeModelId === model.id ? "secondary" : "ghost"}
                size="lg"
                className={`w-full justify-start h-[70px] py-5 ${
                  activeModelId === model.id
                    ? "border-l-4 border-yellow-500"
                    : "border-l-4 border-slate-500"
                }`}
              >
                <Building
                  className={`mr-2 h-5 w-5 ${
                    activeModelId === model.id
                      ? "text-yellow-600"
                      : "text-slate-500"
                  }`}
                />
                <div>
                  <div
                    className={`font-medium ${
                      activeModelId === model.id
                        ? "text-yellow-700"
                        : "text-slate-700"
                    }`}
                  >
                    {model.filename}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center mt-0.5">
                    <Hash className="w-3 h-3 mr-1 opacity-70" />
                    {model.elements} elements
                  </div>
                </div>
              </Button>
            </li>
          ))}
        </ul>
        {models.length < 3 && (
          <div className="mt-4">
            <div className="w-10 h-10 mx-auto group rounded-full transition-all duration-30 flex items-center justify-center">
              <Button
                onClick={() => setOpenModal(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-gray-200!"
                variant="outline"
                size="icon"
                title="Add model"
              >
                <Plus className="w-5 h-5 text-yellow-600 size-0.5 transition-transform duration-300 group-hover:scale-110" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-yellow-100 border-slate-200">
        <div className="text-xs text-slate-500 flex items-center justify-center">
          <Info className="w-3 h-3 mr-1" />
          {models.length} models available
        </div>
      </div>

      {/* Upload IFC Dialog */}
      <UploadingModal
        open={openModal}
        onOpenChange={setOpenModal}
        onModelUploaded={(newModel) =>
          setModels((prevModels) => [...prevModels, newModel])
        }
        modelsCount={models.length}
      />
    </div>
  );
}
