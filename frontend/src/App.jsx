import IFCViewer from "./components/IFCViewer";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 py-4 border-b border-gray-300">
          LeanCon IFC Viewer
        </h1>
      </header>
      <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <IFCViewer modelPath="/public/ifc/simple_example.ifc" />
      </main>
    </div>
  );
}

export default App;
