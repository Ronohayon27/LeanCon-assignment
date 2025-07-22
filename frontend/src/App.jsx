import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ModelsPage from "./pages/ModelsPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/models" element={<ModelsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
