import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ModelsLayout from "./layouts/ModelsLayout";
import ModelViewerPage from "./pages/ModelsPages/ModelViewerPage ";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Viewer screen for specific model */}
        <Route path="/models/:id" element={<ModelsLayout />}>
          <Route index element={<ModelViewerPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
