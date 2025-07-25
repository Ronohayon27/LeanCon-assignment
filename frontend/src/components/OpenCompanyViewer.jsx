"use client";

import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";

export default function IfcViewer({ selectedElementIds = [], modelPath }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const componentsRef = useRef(null);
  const modelRef = useRef(null); // Reference to store the loaded model
  const highlighterRef = useRef(null); // Reference to store the highlighter
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization state
  const [isModelLoading, setIsModelLoading] = useState(true); // Track model loading state
  const [loadingProgress, setLoadingProgress] = useState(0); // Track loading progress

  // Effect for initial setup
  useEffect(() => {
    // Reset initialization state when model path changes
    setIsInitialized(false);
    setIsModelLoading(true);
    setLoadingProgress(0);

    const init = async () => {
      const container = containerRef.current;
      if (!container) return;

      // Clean up previous instance if it exists
      if (componentsRef.current) {
        try {
          componentsRef.current.dispose();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      }

      const components = new OBC.Components();
      // Store components reference
      componentsRef.current = components;
      viewerRef.current = { components };

      const worlds = components.get(OBC.Worlds);
      const world = worlds.create();

      world.scene = new OBC.SimpleScene(components);
      world.scene.setup();
      world.scene.three.background = null;

      world.renderer = new OBC.SimpleRenderer(components, container);
      world.camera = new OBC.OrthoPerspectiveCamera(components);
      await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

      components.init();

      // Set up the highlighter
      components.get(OBC.Raycasters).get(world);
      const highlighter = components.get(OBF.Highlighter);
      highlighter.setup({
        world,
        selectMaterialDefinition: {
          color: new THREE.Color("#ff0000"), // Red color for highlighting
          opacity: 0.8,
          transparent: true,
          renderedFaces: 0,
        },
      });

      // Store highlighter reference for later use
      highlighterRef.current = highlighter;

      // Add event listeners to capture element IDs when clicking on the model
      highlighter.events.select.onHighlight.add(async (modelIdMap) => {
        // Get the fragments manager
        const fragmentsManager = components.get(OBC.FragmentsManager);

        // Get detailed information about the selected elements
        for (const [modelId, localIds] of Object.entries(modelIdMap)) {
          const model = fragmentsManager.list.get(modelId);
          if (!model) {
            continue;
          }

          // Try different ways to get element data
          for (const localId of localIds) {
            // getItemsData for highlight
            try {
              if (model.getItemsData) {
                await model.getItemsData([localId]);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      });

      highlighter.events.select.onClear.add(() => {});

      // Store references
      highlighterRef.current = highlighter;
      viewerRef.current = { components, world, highlighter };

      // Create grid component
      const grids = components.get(OBC.Grids);
      const grid = grids.create(world);
      grid.three.position.set(0, 0, 0); // Set XYZ position
      grid.three.updateMatrixWorld(true);
      grid.three.visible = false;

      // Set up IFC loader first
      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          path: "https://unpkg.com/web-ifc@0.0.69/",
          absolute: true,
        },
      });

      // Initialize fragments manager AFTER IFC loader setup
      const githubUrl =
        "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
      const fetchedUrl = await fetch(githubUrl);
      const workerBlob = await fetchedUrl.blob();
      const workerFile = new File([workerBlob], "worker.mjs", {
        type: "text/javascript",
      });
      const workerUrl = URL.createObjectURL(workerFile);

      const fragments = components.get(OBC.FragmentsManager);

      await fragments.init(workerUrl);

      // Mark as initialized after fragments manager is ready
      setIsInitialized(true);

      // Set up event listeners for when models are loaded
      fragments.list.onItemSet.add(async ({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);

        // Store model reference for highlighting
        modelRef.current = model;

        // Force multiple fragment updates to ensure full rendering

        // Initial update
        fragments.core.update(true);

        // Force scene update
        world.scene.three.updateMatrixWorld(true);

        // Add camera event listeners to maintain fragment updates
        world.camera.controls.addEventListener("rest", () => {
          if (fragments && fragments.core) {
            fragments.core.update(true);
          }
        });

        world.camera.controls.addEventListener("change", () => {
          if (fragments && fragments.core) {
            // Throttle updates during movement
            if (!world.camera.controls._updating) {
              world.camera.controls._updating = true;
              setTimeout(() => {
                fragments.core.update(false); // Lighter update during movement
                world.camera.controls._updating = false;
              }, 50);
            }
          }
        });
        setIsModelLoading(false);
      });

      // Try to load the IFC file - with proper error handling
      try {
        await loadIfc(modelPath, ifcLoader, fragments);
      } catch (error) {
        console.error(error);

        setIsModelLoading(false);
      }

      // Initialization is now marked earlier after fragments manager is ready
    };

    init();

    // Cleanup function when component unmounts or modelPath changes
    return () => {
      if (componentsRef.current) {
        try {
          componentsRef.current.dispose();
          componentsRef.current = null;
          viewerRef.current = null;
          highlighterRef.current = null;
          setIsInitialized(false);
          setIsModelLoading(true);
          setLoadingProgress(0);
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      }
    };
  }, [modelPath]); // Re-initialize when model path changes

  // Effect for highlighting elements
  useEffect(() => {
    // Skip if not initialized or no elements to highlight
    if (
      !isInitialized ||
      !componentsRef.current ||
      !viewerRef.current ||
      !highlighterRef.current
    ) {
      return;
    }

    const highlightElements = async () => {
      try {
        const highlighter = highlighterRef.current;
        const { components } = viewerRef.current;

        // Check if fragments manager exists and is initialized
        const fragments = components.get(OBC.FragmentsManager);
        if (!fragments || !fragments.list) {
          return;
        }

        // Clear any previous highlights
        await highlighter.clear("select");

        // If no elements selected, just return after clearing
        if (selectedElementIds.length === 0) {
          return;
        }

        // Convert IDs to numbers if they're strings
        const expressIds = selectedElementIds.map((id) =>
          typeof id === "string" ? parseInt(id) : id
        );

        const modelIdMap = {};

        // Get all fragment models and try to map express IDs directly
        for (const [modelId] of fragments.list) {
          // let's try direct mapping first
          if (!modelIdMap[modelId]) {
            modelIdMap[modelId] = new Set();
          }

          // Add all express IDs as local IDs for this model
          expressIds.forEach((expressId) => {
            modelIdMap[modelId].add(expressId);
          });
        }

        // Try to highlight using the direct mapping
        if (Object.keys(modelIdMap).length > 0) {
          try {
            await highlighter.highlightByID("select", modelIdMap, true);
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    highlightElements();
  }, [selectedElementIds, isInitialized]);

  const loadIfc = async (path, ifcLoader) => {
    try {
      const file = await fetch(path);

      if (!file.ok) {
        throw new Error(
          `Failed to fetch IFC file: ${file.status} ${file.statusText}`
        );
      }

      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);

      try {
        await ifcLoader.load(buffer, false, "ifc-model", {
          processData: {
            progressCallback: (progress) => {
              setLoadingProgress(progress);
            },
          },
        });
      } catch (loadError) {
        // Suppress the "fragments not initialized" error if it contains this message
        // but still allow the loading to continue since it works anyway
        if (
          loadError.message &&
          loadError.message.includes("initialize fragments")
        ) {
          // Don't throw the error, just log it and continue
        } else {
          // For other errors, still throw them
          throw loadError;
        }
      }
    } catch (error) {
      // Only log and stop loading for actual critical errors
      if (!error.message || !error.message.includes("initialize fragments")) {
        setIsModelLoading(false);
        throw error;
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-white">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {isModelLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Loading IFC Model
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {loadingProgress > 0
                  ? `${Math.round(loadingProgress * 100)}%`
                  : "Initializing..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
