import { useEffect, useState } from "react";
import { columns } from "./components/matsTable/columns";
import { DataTable } from "./components/matsTable/data-table";
// import { generateMockElementData } from "./mockData/elements";
import IfcViewer from "./components/OpenCompanyViewer";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElementIds, setSelectedElementIds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/elements")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch elements");
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handle row selection in the table
  const handleRowClick = (row) => {
    // Get the expressIds from the selected row
    const ids = row.original.expressIds || [];
    console.log("Selected element IDs:", ids);
    setSelectedElementIds(ids);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 py-4 border-b border-gray-300">
          LeanCon IFC Viewer
        </h1>
      </header>
      <main className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <IfcViewer selectedElementIds={selectedElementIds} />
        <div className="container mx-auto py-10">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
