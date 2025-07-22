import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-700 flex flex-col items-center justify-center p-6">
      <header className="max-w-4xl w-full mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          LeanCon IFC Analyzer
        </h1>
        <p className="text-xl text-white/90 mb-2 drop-shadow">
          Advanced BIM Model Analysis & Visualization
        </p>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-blue-100">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-800 mb-4">
              Intelligent IFC Data Analysis
            </h2>
            <p className="text-gray-600 mb-6">
              Our platform provides powerful tools for analyzing and visualizing
              Building Information Models (BIM). Extract valuable insights from
              your IFC files including:
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-gray-700">Element quantities by type and level</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-gray-700">Interactive 3D visualization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-gray-700">Level-based element filtering</span>
              </li>
            </ul>
            <Button asChild size="lg" className="mt-2">
              <Link to="/models">
                View Your Models
                <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-100">
              <img
                src="/img/bim-illustration.svg"
                alt="BIM Illustration"
                className="w-full h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300/e2f0ff/2563eb?text=BIM+Analysis";
                }}
              />
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
