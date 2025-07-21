// import { useEffect, useState, useRef } from "react";
// import { IfcViewerAPI } from "web-ifc-viewer";
// import { Color } from "three";

// export default function IFCViewer({ modelPath }) {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const viewerRef = useRef(null);

//   useEffect(() => {
//     // Suppress noisy WASM errors
//     const originalConsoleError = console.error;
//     let warned = false;
//     console.error = (...args) => {
//       if (
//         typeof args[0] === "string" &&
//         (args[0].includes("Unsupported trimmings") ||
//           args[0].includes("bad bound"))
//       ) {
//         if (!warned) {
//           warned = true;
//           console.warn(
//             "Some geometry in the IFC file is not supported and may be skipped."
//           );
//         }
//         return;
//       }
//       originalConsoleError(...args);
//     };
//     const container = document.getElementById("viewer-container");

//     const initViewer = async () => {
//       viewerRef.current = new IfcViewerAPI({
//         container,
//         backgroundColor: new Color(0xf5f5f5),
//       });

//       viewerRef.current.grid.setGrid();
//       viewerRef.current.axes.setAxes();

//       await viewerRef.current.IFC.setWasmPath("/wasm/");
//     };

//     const loadModel = async (modelPath) => {
//       try {
//         setLoading(true);
//         setError(null);

//         await initViewer(); // <-- Sets viewerRef.current

//         console.log(`Loading IFC model from: ${modelPath}`);
//         const model = await viewerRef.current.IFC.loadIfcUrl(modelPath, true);

//         viewerRef.current.context.fitToFrame();
//         setLoading(false);
//         return model;
//       } catch (err) {
//         console.error(`Error loading IFC model from ${modelPath}:`, err);
//         setError(
//           `Failed to load IFC model: ${err.message}. Try using a different IFC file.`
//         );
//         setLoading(false);
//       }
//     };

//     loadModel("ifc/simple_example.ifc");

//     return () => {
//       if (viewerRef.current) {
//         try {
//           viewerRef.current.dispose();
//         } catch (e) {
//           console.warn("Error during viewer cleanup:", e);
//         }
//       }
//     };
//   }, [modelPath]);

//   return (
//     <div className="relative">
//       <div
//         id="viewer-container"
//         className="w-full h-[70vh] rounded-lg shadow-inner bg-gray-50"
//       />

//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//             <p className="mt-2 text-gray-700 font-medium">
//               Loading IFC model...
//             </p>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
//           <div className="text-center text-red-600 p-4 max-w-md">
//             <svg
//               className="w-12 h-12 mx-auto text-red-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//               />
//             </svg>
//             <p className="mt-2">{error}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
