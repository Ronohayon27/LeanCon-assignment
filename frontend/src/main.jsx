import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ModelsProvider } from "./contexts/ModelsProvider";

createRoot(document.getElementById("root")).render(
  <ModelsProvider>
    <App />
  </ModelsProvider>
);
