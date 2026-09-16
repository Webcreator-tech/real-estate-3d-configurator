import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  PointerLockControls,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

/* =========================================================
   HOUSE
========================================================= */

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

        /*
         * Window glass
         */
        if (
          object.material &&
          object.material.name === "Window_Glass"
        ) {
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

/* =========================================================
   SUN
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
  const angle = sunValue * Math.PI;

  const sunX = Math.cos(angle) * 14;
  const sunZ = Math.sin(angle) * 14;
  const sunY = 5 + Math.sin(angle) * 13;

  const intensity = 1.6 + Math.sin(angle) * 1.6;

  const sunColor =
    sunValue < 0.34
      ? "#ffd7a0"
      : sunValue < 0.67
      ? "#fff3d0"
      : "#ffb06a";

  return (
    <directionalLight
      position={[sunX, sunY, sunZ]}
      color={sunColor}
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
   ORBIT MODE
========================================================= */

function CameraSetup({ walkthrough }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (walkthrough) return;

    camera.position.set(10, 8, 10);
    camera.lookAt(0, 1.5, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(
        0,
        1.5,
        0
      );

      controlsRef.current.update();
    }
  }, [camera, walkthrough]);

  if (walkthrough) return null;

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
      minDistance={1.5}
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
   WALKTHROUGH MODE
========================================================= */

function WalkthroughControls({ active }) {
  const { camera, gl } = useThree();

  const controlsRef = useRef();
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const velocity = useRef(
    new THREE.Vector3()
  );

  useEffect(() => {
    if (!active) return;

    camera.position.set(0, 1.65, 4);

    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;

        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;

        default:
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, [active, camera]);

  useEffect(() => {
    if (!active) return;

    const element = gl.domElement;

    const handleClick = () => {
      if (document.pointerLockElement !== element) {
        element.requestPointerLock?.();
      }
    };

    element.addEventListener(
      "click",
      handleClick
    );

    return () => {
      element.removeEventListener(
        "click",
        handleClick
      );
    };
  }, [active, gl]);

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (event) => {
      if (
        document.pointerLockElement !==
        gl.domElement
      ) {
        return;
      }

      const sensitivity = 0.0025;

      camera.rotation.order = "YXZ";

      camera.rotation.y -=
        event.movementX * sensitivity;

      camera.rotation.x -=
        event.movementY * sensitivity;

      const maxPitch = Math.PI / 2 - 0.05;

      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -maxPitch,
        maxPitch
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, [active, camera, gl]);

  useEffect(() => {
    if (!active) return;

    let animationFrame;

    const move = () => {
      const speed = 0.06;

      velocity.current.set(0, 0, 0);

      if (keys.current.forward) {
        velocity.current.z -= speed;
      }

      if (keys.current.backward) {
        velocity.current.z += speed;
      }

      if (keys.current.left) {
        velocity.current.x -= speed;
      }

      if (keys.current.right) {
        velocity.current.x += speed;
      }

      if (velocity.current.length() > 0) {
        velocity.current.normalize();
        velocity.current.multiplyScalar(speed);

        const direction =
          new THREE.Vector3(
            velocity.current.x,
            0,
            velocity.current.z
          );

        direction.applyQuaternion(
          camera.quaternion
        );

        direction.y = 0;

        camera.position.add(direction);

        /*
         * Keep player's head at floor level.
         */
        camera.position.y = 1.65;
      }

      animationFrame =
        requestAnimationFrame(move);
    };

    move();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active, camera]);

  return null;
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
                setSunValue(preset.value)
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
        <span>Advanced</span>

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
          />

          <div className="trajectory-labels">
            <span>Morning</span>
            <span>Midday</span>
            <span>Evening</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   WALKTHROUGH UI
========================================================= */

function WalkthroughHelp({ onExit }) {
  return (
    <div className="walkthrough-help">
      <div className="walkthrough-title">
        Walkthrough Mode
      </div>

      <div className="walkthrough-text">
        Click to look around
      </div>

      <div className="walkthrough-keys">
        <span>W</span>
        <span>A</span>
        <span>S</span>
        <span>D</span>
        <small>Move</small>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="walkthrough-exit"
      >
        Exit Walkthrough
      </button>
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

  const [walkthrough, setWalkthrough] =
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

        <ambientLight intensity={0.45} />

        <SunLight
          sunValue={sunValue}
        />

        <Environment
          preset="city"
          environmentIntensity={0.4}
        />

        <Flat />

        <CameraSetup
          walkthrough={walkthrough}
        />

        <WalkthroughControls
          active={walkthrough}
        />
      </Canvas>

      {/* WALKTHROUGH BUTTON */}

      {!walkthrough && (
        <button
          type="button"
          className="walkthrough-button"
          onClick={() =>
            setWalkthrough(true)
          }
        >
          Walkthrough
        </button>
      )}

      {/* WALKTHROUGH HELP */}

      {walkthrough && (
        <WalkthroughHelp
          onExit={() =>
            setWalkthrough(false)
          }
        />
      )}

      {/* LIGHTING BUTTON */}

      {!walkthrough && !lightingOpen && (
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

      {/* LIGHTING PANEL */}

      {lightingOpen && !walkthrough && (
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
