import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useCustomization } from "../state/customization";
import Flat from "../components/House/Flat";
import SceneLighting from "../components/Lighting/SceneLighting";
import MobileCamera from "../components/Camera/MobileCamera";
import { MobileTouchControls } from "../components/Walkthrough/MobileWalkthrough";
import CustomizationToolbar from "../components/Customization/CustomizationToolbar";
import WallPanel from "../components/Customization/WallPanel";
import FurniturePanel from "../components/Customization/FurniturePanel";
import LightingPanel from "../components/Lighting/LightingPanel";
import ResetCustomization from "../components/Customization/ResetCustomization";
import "./MobileApp.css";

export default function MobileApp() {
  const { mode, setMode, activePanel, setActivePanel } = useCustomization();

  // Ensure mobile directly enters Walkthrough mode on load
  useEffect(() => {
    if (mode !== "walkthrough" && mode !== "orbit360") {
      setMode("walkthrough");
    }
  }, [mode, setMode]);

  return (
    <div className="mobile-app-root">
      {/* 3D Canvas Scene */}
      <div className="mobile-canvas-container">
        <Canvas
          camera={{ position: [2.4, 1.6, 7.2], fov: 60 }}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <SceneLighting />
          <Flat />
          <MobileCamera />
        </Canvas>
      </div>

      {/* Top Real-Estate Header Status */}
      <header className="mobile-header">
        <div className="mobile-brand-pill">
          <span className="brand-dot" />
          <span className="property-name">The Grand Flat</span>
        </div>
        <div className="mobile-mode-tag">
          {mode === "orbit360" ? "360° Aerial" : "Walkthrough"}
        </div>
      </header>

      {/* Walkthrough Touch Controls (Left Joystick + Right Look Surface) */}
      {(mode === "walkthrough" || mode === "customization") && (
  <MobileTouchControls />
)}

      {/* Compact Customization Drawer Panels */}
      {activePanel === "walls" && (
        <WallPanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "furniture" && (
        <FurniturePanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "lighting" && (
        <LightingPanel isDesktop={false} onClose={() => setActivePanel(null)} />
      )}

      {/* Persistent Bottom Customization Toolbar */}
      <CustomizationToolbar isDesktop={false} />

      {/* Reset Confirmation Dialog */}
      <ResetCustomization />
    </div>
  );
}
