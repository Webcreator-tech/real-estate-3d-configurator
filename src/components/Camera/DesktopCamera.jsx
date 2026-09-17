import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useCustomization } from "../../state/customization";
import DesktopWalkthrough from "../Walkthrough/DesktopWalkthrough";
import Orbit360 from "./Orbit360";

export default function DesktopCamera() {
  const { mode } = useCustomization();

  if (mode === "walkthrough") {
    return <DesktopWalkthrough />;
  }

  if (mode === "orbit360") {
    return <Orbit360 />;
  }

  // Preserved original OrbitControls behavior
  return (
    <OrbitControls
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
