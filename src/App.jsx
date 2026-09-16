import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
} from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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

  enableRotate
  rotateSpeed={0.6}

  enableZoom
  zoomSpeed={0.8}

  enablePan
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

export default function App() {
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
        <color attach="background" args={["#dfe3e6"]} />

        <ambientLight intensity={0.7} />

        <directionalLight
          position={[8, 12, 6]}
          intensity={2.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={40}
        />

        <Environment preset="city" />

        <Flat />

        <CameraSetup />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/flat.glb");
