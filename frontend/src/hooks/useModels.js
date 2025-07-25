import { useContext } from "react";
import { ModelsContext } from "@/contexts/ModelsContext";

export function useModels() {
  return useContext(ModelsContext);
}
