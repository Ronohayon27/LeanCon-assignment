import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";

export default function IfcViewer({ selectedElementIds = [], modelPath }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const highlighterRef = useRef(null);
  const modelRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize viewer
  useEffect(() => {
    const initViewer = async () => {
      // creating a simple scene
      const container = containerRef.current;
      if (!container || viewerRef.current) return;

      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create();

      world.scene = new OBC.SimpleScene(components);
      world.scene.setup();
      world.scene.three.background = null;

      world.renderer = new OBC.SimpleRenderer(components, container);
      world.camera = new OBC.OrthoPerspectiveCamera(components);
      await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);

      components.init();

      const grids = components.get(OBC.Grids);
      const grid = grids.create(world);
      grid.three.visible = false; // for displaying the grid, needs to be true

      // creating fragment
      const ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({
        autoSetWasm: false,
        wasm: {
          path: "https://unpkg.com/web-ifc@0.0.69/",
          absolute: true,
        },
      });

      const res = await fetch(
        "https://thatopen.github.io/engine_fragment/resources/worker.mjs"
      );
      const blob = await res.blob();
      const workerUrl = URL.createObjectURL(
        new File([blob], "worker.mjs", { type: "text/javascript" })
      );

      const fragments = components.get(OBC.FragmentsManager);
      await fragments.init(workerUrl);

      // inintlized the highlighter
      const highlighter = components.get(OBF.Highlighter);
      highlighter.setup({
        world,
        selectMaterialDefinition: {
          color: new THREE.Color("#ff0000"),
          opacity: 0.8,
          transparent: true,
          renderedFaces: 0,
        },
      });

      highlighterRef.current = highlighter;
      viewerRef.current = { components, world, ifcLoader, fragments };
      world.camera.controls.addEventListener("rest", () =>
        fragments.core.update(true)
      );
      setIsInitialized(true);
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.components.dispose();
        viewerRef.current = null;
        highlighterRef.current = null;
        modelRef.current = null;
        setIsInitialized(false);
        setIsModelLoading(false);
        setLoadingProgress(0);
      }
    };
  }, []);

  // Load IFC when modelPath changes
  useEffect(() => {
    if (!isInitialized || !modelPath || !viewerRef.current) return;

    const loadModel = async () => {
      setIsModelLoading(true);
      setLoadingProgress(0);

      const { components, world, ifcLoader, fragments } = viewerRef.current;

      try {
        const file = await fetch(modelPath);
        const buffer = new Uint8Array(await file.arrayBuffer());

        fragments.list.clear();

        fragments.list.onItemSet.add(({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          modelRef.current = model;
          fragments.core.update(true);
          world.scene.three.updateMatrixWorld(true);
          setIsModelLoading(false);
        });

        await ifcLoader.load(buffer, false, "ifc-model", {
          processData: {
            progressCallback: (p) => setLoadingProgress(p),
          },
        });
      } catch (err) {
        console.error("Failed to load IFC:", err);
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, [modelPath, isInitialized]);

  // Highlight selected elements
  useEffect(() => {
    if (!isInitialized || !highlighterRef.current || !viewerRef.current) return;

    const highlight = async () => {
      const highlighter = highlighterRef.current;
      const fragments = viewerRef.current.components.get(OBC.FragmentsManager);

      await highlighter.clear("select");

      if (!selectedElementIds.length) return;

      const expressIds = selectedElementIds.map((id) => +id);
      const modelIdMap = {};

      for (const [modelId] of fragments.list) {
        modelIdMap[modelId] = new Set(expressIds);
      }

      try {
        await highlighter.highlightByID("select", modelIdMap, true);
      } catch (e) {
        console.warn("Highlight error:", e);
      }
    };

    highlight();
  }, [selectedElementIds, isInitialized]);

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
