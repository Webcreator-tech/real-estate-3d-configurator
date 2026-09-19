import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCustomization } from "../../state/customization";
import DesktopWalkthrough from "../Walkthrough/DesktopWalkthrough";
import Orbit360 from "./Orbit360";

function DesktopOrbitOverview() {
  const { camera } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    camera.position.set(10, 8, 10);
    if ("fov" in camera) {
      Object.assign(camera, { fov: 45 });
      camera.updateProjectionMatrix();
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.6, 0);
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
      target={[0, 1.6, 0]}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={3}
      maxDistance={30}
    />
  );
}

export default function DesktopCamera() {
  const { mode } = useCustomization();

  if (mode === "walkthrough" || mode === "customization") {
    return <DesktopWalkthrough />;
  }

  if (mode === "orbit360") {
    return <Orbit360 />;
  }

  // Orbit Overview
  return <DesktopOrbitOverview />;
}
