import React from "react";
import { Button } from "./ui/button";
import { Building, Hash, Info } from "lucide-react";

export default function Sidebar({ models = [], activeModelId, onModelSelect }) {
  return (
    <div className="w-64 h-full bg-gradient-to-b from-slate-50 to-yellow-100 border-r border-slate-200 flex flex-col shadow-inner">
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
                  ? "shadow-md z-10 scale-[1.02]"
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
                    : ""
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
                    {model.name}
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
      </div>

      <div className="p-3 bg-yellow-100 border-slate-200">
        <div className="text-xs text-slate-500 flex items-center justify-center">
          <Info className="w-3 h-3 mr-1" />
          {models.length} models available
        </div>
      </div>
    </div>
  );
}
