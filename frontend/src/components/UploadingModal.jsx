import React, { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { UploadModelFile } from "@/services/modelService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function UploadingModal({ open, onOpenChange, onModelUploaded, modelsCount }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload file
      const result = await UploadModelFile(formData);

      // Complete progress and clear interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update models list with the new model
      onModelUploaded(result);

      // Close modal after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onOpenChange(false);
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload IFC Model</DialogTitle>
          <DialogDescription>
            Select an IFC file to upload to the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <label
              htmlFor="ifc-file"
              className={`
                flex flex-col items-center justify-center w-full h-32 
                border-2 border-dashed rounded-lg cursor-pointer 
                ${
                  isUploading
                    ? "bg-slate-100 border-slate-300"
                    : "bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-yellow-500"
                }
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload
                  className={`w-8 h-8 mb-2 ${
                    isUploading ? "text-slate-400" : "text-yellow-500"
                  }`}
                />
                {isUploading ? (
                  <div className="w-full px-4">
                    <div className="text-sm text-center mb-1">
                      {uploadProgress}% Uploading...
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-1 text-sm text-slate-500">
                      Click to select IFC file
                    </p>
                    <p className="text-xs text-slate-500">.ifc files only</p>
                  </>
                )}
              </div>
              <input
                id="ifc-file"
                type="file"
                accept=".ifc"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <div className="text-xs text-slate-500">
            {modelsCount}/3 models
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
