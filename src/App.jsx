import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

function Flat() {
  const { scene } = useGLTF("/models/flat.glb");

  return <primitive object={scene} />;
}

export default function App() {
  return (
    <div className="app">
      <Canvas
        camera={{ position: [10, 8, 10], fov: 45 }}
        shadows
      >
        <ambientLight intensity={1.2} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={3}
          castShadow
        />

        <Environment preset="city" />

        <Flat />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/flat.glb");