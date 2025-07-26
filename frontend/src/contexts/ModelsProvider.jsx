import { useEffect, useState } from "react";
import { fetchModelsList } from "@/services/modelService";
import { ModelsContext } from "./ModelsContext";

// provider for managing the models data swapping
export function ModelsProvider({ children }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelsList()
      .then(setModels)
      .catch((err) => console.error("Failed to fetch models", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ModelsContext.Provider value={{ models, setModels, loading }}>
      {children}
    </ModelsContext.Provider>
  );
}
