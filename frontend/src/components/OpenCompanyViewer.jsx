"use client";

import { useEffect, useRef } from "react";
import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";

export default function IfcViewer({ selectedElementIds = [] }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const componentsRef = useRef(null);
  const modelRef = useRef(null); // Reference to store the loaded model
  const highlighterRef = useRef(null); // Reference to store the highlighter

  // Effect for initial setup
  useEffect(() => {
    const init = async () => {
      const container = containerRef.current;
      if (!container) return;

      const components = new OBC.Components();
      // Store components reference
      componentsRef.current = components;

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
      await highlighter.setup({
        world,
        selectMaterialDefinition: {
          color: new THREE.Color("#ff0000"), // Red color for highlighting
          opacity: 0.8,
          transparent: true,
          renderedFaces: 0,
        },
      });

      // Add event listeners to capture element IDs when clicking on the model
      highlighter.events.select.onHighlight.add(async (modelIdMap) => {
        console.log("=== ELEMENT CLICKED IN 3D MODEL ===");
        console.log("Selected modelIdMap:", modelIdMap);

        // Get the fragments manager
        const fragmentsManager = components.get(OBC.FragmentsManager);

        // Get detailed information about the selected elements
        for (const [modelId, localIds] of Object.entries(modelIdMap)) {
          console.log(`Model ID: ${modelId}, Local IDs:`, localIds);
          const model = fragmentsManager.list.get(modelId);
          if (!model) {
            console.log(`Model ${modelId} not found`);
            continue;
          }

          // Log model information
          console.log(`Model found:`, {
            id: model.id,
            hasItems: !!model.items,
            itemsSize: model.items?.size,
            hasGetItemsData: typeof model.getItemsData === "function",
          });

          // Try different ways to get element data
          for (const localId of localIds) {
            console.log(`\n--- Analyzing Local ID: ${localId} ---`);

            // Method 1: Try getItemsData
            try {
              if (model.getItemsData) {
                const itemData = await model.getItemsData([localId]);
                console.log(`getItemsData result:`, itemData);
              }
            } catch (e) {
              console.log(`getItemsData failed:`, e.message);
            }

            // Method 2: Check if localId exists in model.items
            if (model.items) {
              console.log(
                `Checking if localId ${localId} exists in model.items:`,
                model.items.has(localId)
              );
              if (model.items.has(localId)) {
                const itemInfo = model.items.get(localId);
                console.log(`Item info from model.items:`, itemInfo);
              }
            }

            // Method 3: Assume localId IS the expressID
            console.log(`Assuming localId ${localId} is the expressID`);
            console.log(
              `This means when we get expressID ${localId} from backend, we should use localId ${localId} for highlighting`
            );
          }
        }
      });

      highlighter.events.select.onClear.add(() => {
        console.log("Selection was cleared");
      });

      // Store references
      highlighterRef.current = highlighter;
      viewerRef.current = { components, world, highlighter };

      // Create grid component
      const grids = components.get(OBC.Grids);
      const grid = grids.create(world);

      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          path: "https://unpkg.com/web-ifc@0.0.69/",
          absolute: true,
        },
      });

      const githubUrl =
        "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
      const fetchedUrl = await fetch(githubUrl);
      const workerBlob = await fetchedUrl.blob();
      const workerFile = new File([workerBlob], "worker.mjs", {
        type: "text/javascript",
      });
      const workerUrl = URL.createObjectURL(workerFile);
      const fragments = components.get(OBC.FragmentsManager);
      fragments.init(workerUrl);

      world.camera.controls.addEventListener("rest", () =>
        fragments.core.update(true)
      );

      // Ensures that once the Fragments model is loaded
      // (converted from the IFC in this case),
      // it utilizes the world camera for updates
      // and is added to the scene.
      fragments.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        fragments.core.update(true);

        // Store model reference for highlighting
        modelRef.current = model;
        console.log("Model reference stored:", model);

        // Position grid at the bottom of the model
        try {
          // Wait a bit for the model to be fully processed
          setTimeout(() => {
            let bbox = null;
            let minY = 0; // Default fallback

            try {
              // Method 1: Try to get bounding box from the model object
              if (model.object) {
                const box = new THREE.Box3();
                box.setFromObject(model.object);

                // Check if the box is valid (not infinity)
                if (box.min.y !== Infinity && box.max.y !== -Infinity) {
                  bbox = box;
                  minY = bbox.min.y;
                  console.log("Successfully computed bounding box:", bbox);
                } else {
                  console.log(
                    "Bounding box has invalid values, trying alternative method"
                  );
                }
              }

              // Method 2: If still no valid bbox, traverse children and find actual geometry
              if (!bbox || minY === Infinity) {
                let foundValidGeometry = false;
                const tempBox = new THREE.Box3();

                model.object.traverse((child) => {
                  if (
                    child.geometry &&
                    child.geometry.attributes &&
                    child.geometry.attributes.position
                  ) {
                    child.geometry.computeBoundingBox();
                    if (
                      child.geometry.boundingBox &&
                      child.geometry.boundingBox.min.y !== Infinity
                    ) {
                      tempBox.expandByObject(child);
                      foundValidGeometry = true;
                    }
                  }
                });

                if (foundValidGeometry && tempBox.min.y !== Infinity) {
                  bbox = tempBox;
                  minY = bbox.min.y;
                  console.log("Found valid geometry bounding box:", bbox);
                }
              }

              // Method 3: Final fallback - use a reasonable default based on model center
              if (!bbox || minY === Infinity || minY === -Infinity) {
                console.log("Using default grid position");
                minY = -1; // Place grid slightly below origin
              }
            } catch (error) {
              console.warn("Error computing bounding box:", error);
              minY = -1; // Safe fallback
            }

            // Position the grid
            grid.three.position.y = minY - 0.1;
            grid.three.visible = true;

            console.log("Final grid position Y:", minY - 0.1);
            console.log("Grid visibility:", grid.three.visible);
          }, 1000); // Wait 1 second for model to be fully processed

          // Ensure grid is visible
          grid.three.visible = true;
          console.log("Grid created and positioned");
        } catch (error) {
          console.warn("Error positioning grid:", error);
          // Fallback: ensure grid is at least visible at origin
          grid.three.position.y = 0;
          grid.three.visible = true;
        }
      });

      // Load the IFC file
      await loadIfc("/ifc/simple_example.ifc", ifcLoader);
    };

    init();
  }, []);

  // Effect for highlighting elements when selectedElementIds changes
  useEffect(() => {
    const highlightElements = async () => {
      if (!highlighterRef.current || !viewerRef.current) {
        console.log("Highlighter or viewer not ready");
        return;
      }

      const highlighter = highlighterRef.current;
      const { components } = viewerRef.current;
      const fragments = components.get(OBC.FragmentsManager);

      try {
        // Clear any previous highlights
        await highlighter.clear("select");

        // If no elements selected, just return after clearing
        if (selectedElementIds.length === 0) {
          console.log("No elements to highlight");
          return;
        }

        // Convert IDs to numbers if they're strings
        const expressIds = selectedElementIds.map((id) =>
          typeof id === "string" ? parseInt(id) : id
        );

        console.log("Highlighting elements with IDs:", expressIds);

        // Based on our analysis, it seems express IDs from backend = local IDs in 3D model
        // Let's use a direct mapping approach
        console.log("Using direct mapping: express IDs = local IDs");

        const modelIdMap = {};

        // Get all fragment models and try to map express IDs directly
        for (const [modelId] of fragments.list) {
          console.log(`Checking model ${modelId} for express IDs:`, expressIds);

          // Since we observed that local IDs seem to be the same as express IDs,
          // let's try direct mapping first
          if (!modelIdMap[modelId]) {
            modelIdMap[modelId] = new Set();
          }

          // Add all express IDs as local IDs for this model
          expressIds.forEach((expressId) => {
            modelIdMap[modelId].add(expressId);
            console.log(
              `Added express ID ${expressId} as local ID for model ${modelId}`
            );
          });
        }

        console.log("Direct mapping model ID map:", modelIdMap);

        // Try to highlight using the direct mapping
        if (Object.keys(modelIdMap).length > 0) {
          try {
            await highlighter.highlightByID("select", modelIdMap, true);
            console.log(
              "Successfully highlighted elements using direct mapping!"
            );
          } catch (error) {
            console.error("Direct mapping failed:", error);

            // If direct mapping fails, try with just the main model
            console.log("Trying with main model only...");
            const mainModelId = "example"; // Based on what we saw in the logs
            const simpleMap = {
              [mainModelId]: new Set(expressIds),
            };

            console.log("Simple mapping:", simpleMap);
            await highlighter.highlightByID("select", simpleMap, true);
            console.log("Simple mapping highlighting completed");
          }
        }
      } catch (error) {
        console.error("Error highlighting elements:", error);
      }
    };

    highlightElements();
  }, [selectedElementIds]);

  const loadIfc = async (path, ifcLoader) => {
    try {
      const file = await fetch(path);
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);

      // Load the model
      await ifcLoader.load(buffer, false, "example", {
        processData: {
          progressCallback: (progress) => console.log(progress),
        },
      });

      console.log("IFC model loaded successfully");

      // After loading, try to map express IDs to meshes for easier highlighting
      if (viewerRef.current && viewerRef.current.components) {
        const { components } = viewerRef.current;
        const fragments = components.get(OBC.FragmentsManager);

        // Log fragments information for debugging
        console.log("Fragments after loading:", fragments);
        if (fragments && fragments.groups) {
          console.log("Fragments groups:", fragments.groups);
        }
      }
    } catch (error) {
      console.error("Error loading IFC model:", error);
    }
  };
  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
