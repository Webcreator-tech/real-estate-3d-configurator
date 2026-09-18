import React, { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * Orbit360 Component
 * 360° automated orbit mode around the house center.
 * Auto-rotation stops permanently upon any user touch or drag interaction.
 * User stays in 360° mode until explicitly switching back to walkthrough.
 */
export default function Orbit360({ onInteraction }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    // Position camera for a cinematic exterior overview of the house
    camera.position.set(15, 9, 15);
    camera.lookAt(0, 1.6, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.6, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  const handleStart = () => {
    // User interacted (touch / mouse drag / pinch) -> stop auto-rotation
    if (autoRotate) {
      setAutoRotate(false);
      if (onInteraction) {
        onInteraction();
      }
    }
  };

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={1.4}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      enableZoom={true}
      minDistance={4}
      maxDistance={25}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.2}
      target={[0, 1.6, 0]}
      onStart={handleStart}
    />
  );
}
