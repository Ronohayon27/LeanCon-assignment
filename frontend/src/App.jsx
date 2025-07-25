import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ModelsEntryPage from "./pages/ModelsPages/index";
import ModelsLayout from "./layouts/ModelsLayout";
import ModelViewerPage from "./pages/ModelsPages/ModelViewerPage ";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Entry point — decides where to go */}
        <Route path="/models" element={<ModelsEntryPage />} />

        {/* Viewer screen for specific model */}
        <Route path="/models/:id" element={<ModelsLayout />}>
          <Route index element={<ModelViewerPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
