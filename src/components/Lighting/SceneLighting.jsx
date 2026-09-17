import React, { useMemo } from "react";
import * as THREE from "three";
import { Environment } from "@react-three/drei";
import { useCustomization } from "../../state/customization";

export default function SceneLighting() {
  const { currentLighting, lightingPreset, advancedLighting } = useCustomization();

  // Compute directional light position from advanced azimuth/elevation if available
  const lightPosition = useMemo(() => {
    if (advancedLighting && (advancedLighting.sunAzimuth !== 45 || advancedLighting.sunElevation !== 45)) {
      const r = 12;
      const phi = THREE.MathUtils.degToRad(90 - advancedLighting.sunElevation);
      const theta = THREE.MathUtils.degToRad(advancedLighting.sunAzimuth);
      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = Math.max(0.5, r * Math.cos(phi));
      const z = r * Math.sin(phi) * Math.cos(theta);
      return [x, y, z];
    }
    return currentLighting.sunPosition || [5, 10, 5];
  }, [currentLighting.sunPosition, advancedLighting]);

  return (
    <>
      <ambientLight
        intensity={currentLighting.ambientIntensity ?? 1.2}
        color={lightingPreset === "evening" ? "#ffeedd" : "#ffffff"}
      />

      <directionalLight
        position={lightPosition}
        intensity={currentLighting.sunIntensity ?? 3.0}
        color={currentLighting.sunColor ?? "#ffffff"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0005}
      />

      {/* Subtle secondary bounce fill light for realistic interiors */}
      <directionalLight
        position={[-lightPosition[0] * 0.5, 4, -lightPosition[2] * 0.5]}
        intensity={currentLighting.ambientIntensity * 0.35}
        color="#cce0ff"
      />

      <Environment preset={currentLighting.environmentPreset || "city"} />
    </>
  );
}
