import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

function Flat() {
  const { scene } = useGLTF("/models/flat.glb");

  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;

    model.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;

    if (object.material?.name === "Window_Glass") {
      object.material = object.material.clone();

      object.material.transparent = true;
      object.material.opacity = 0.12;
      object.material.depthWrite = false;
      object.material.side = THREE.DoubleSide;
    }
  }
});
  }, [model]);

  return <primitive object={model} />;
}

function CameraSetup() {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 1.5, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.5, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableZoom
      enableRotate
      rotateSpeed={0.6}
      zoomSpeed={0.8}
      panSpeed={0.8}
      minDistance={2}
      maxDistance={30}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.05}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

/* =========================================================
   SUN SYSTEM
========================================================= */

const SUN_PRESETS = {
  morning: {
    label: "Morning",
    value: 0.18,
  },

  afternoon: {
    label: "Afternoon",
    value: 0.5,
  },

  evening: {
    label: "Evening",
    value: 0.82,
  },
};

function SunLight({ sunValue }) {
  const sunRef = useRef();

  /*
   * Fixed curved trajectory.
   *
   * value 0 = sunrise side
   * value 0.5 = highest point
   * value 1 = sunset side
   */
  const angle = sunValue * Math.PI;

  const sunX = Math.cos(angle) * 14;
  const sunZ = Math.sin(angle) * 14;

  /*
   * Higher in the sky around the middle
   * and lower near morning/evening.
   */
  const sunY = 5 + Math.sin(angle) * 13;

  /*
   * Slight intensity variation across the day.
   */
  const intensity =
    1.4 + Math.sin(angle) * 1.1;

  return (
    <directionalLight
      ref={sunRef}
      position={[sunX, sunY, sunZ]}
      intensity={intensity}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-near={0.1}
      shadow-camera-far={45}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15}
      shadow-bias={-0.0001}
    />
  );
}

/* =========================================================
   LIGHTING PANEL
========================================================= */

function LightingPanel({
  sunValue,
  setSunValue,
  onClose,
}) {
  const [advancedOpen, setAdvancedOpen] =
    useState(false);

  const activePreset =
    sunValue < 0.34
      ? "morning"
      : sunValue < 0.67
      ? "afternoon"
      : "evening";

  const handlePreset = (preset) => {
    setSunValue(
      SUN_PRESETS[preset].value
    );
  };

  return (
    <div
      className="lighting-panel"
      onPointerDown={(event) =>
        event.stopPropagation()
      }
      onPointerMove={(event) =>
        event.stopPropagation()
      }
    >
      <div className="lighting-header">
        <div>
          <div className="lighting-title">
            ☀️ Lighting
          </div>

          <div className="lighting-subtitle">
            Change natural daylight
          </div>
        </div>

        <button
          type="button"
          className="lighting-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="lighting-section-label">
        Time of Day
      </div>

      <div className="sun-presets">
        {Object.entries(SUN_PRESETS).map(
          ([key, preset]) => (
            <button
              type="button"
              key={key}
              className={`sun-preset ${
                activePreset === key
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handlePreset(key)
              }
            >
              <span className="preset-icon">
                {key === "morning"
                  ? "🌅"
                  : key === "afternoon"
                  ? "☀️"
                  : "🌇"}
              </span>

              <span>
                {preset.label}
              </span>
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="advanced-toggle"
        onClick={() =>
          setAdvancedOpen(
            (previous) => !previous
          )
        }
      >
        <span>
          Advanced
        </span>

        <span
          className={`advanced-arrow ${
            advancedOpen ? "open" : ""
          }`}
        >
          ›
        </span>
      </button>

      {advancedOpen && (
        <div className="advanced-lighting">
          <div className="custom-time-row">
            <span>
              Custom Sun Position
            </span>

            <span className="sun-value">
              {Math.round(
                sunValue * 100
              )}
              %
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sunValue}
            onChange={(event) =>
              setSunValue(
                Number(event.target.value)
              )
            }
            className="sun-slider"
            aria-label="Custom sun position"
          />

          <div className="trajectory-labels">
            <span>Morning</span>
            <span>Midday</span>
            <span>Evening</span>
          </div>

          <div className="lighting-note">
            Sun moves along a fixed natural
            trajectory.
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [sunValue, setSunValue] =
    useState(0.5);

  const [lightingOpen, setLightingOpen] =
    useState(false);

  return (
    <div className="app">
      <Canvas
        shadows
        camera={{
          position: [10, 8, 10],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
      >
        <color
          attach="background"
          args={["#dfe3e6"]}
        />

        <ambientLight intensity={0.65} />

        <SunLight
          sunValue={sunValue}
        />

        <Environment preset="city" />

        <Flat />

        <CameraSetup />
      </Canvas>

      {/* =================================================
          LIGHTING BUTTON
      ================================================= */}

      {!lightingOpen && (
        <button
          type="button"
          className="lighting-main-button"
          onClick={() =>
            setLightingOpen(true)
          }
        >
          <span className="sun-button-icon">
            ☀️
          </span>

          <span>Lighting</span>
        </button>
      )}

      {/* =================================================
          LIGHTING PANEL
      ================================================= */}

      {lightingOpen && (
        <LightingPanel
          sunValue={sunValue}
          setSunValue={setSunValue}
          onClose={() =>
            setLightingOpen(false)
          }
        />
      )}
    </div>
  );
}

useGLTF.preload("/models/flat.glb");
