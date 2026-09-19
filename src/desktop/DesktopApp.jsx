import React from "react";
import { Canvas } from "@react-three/fiber";
import { useCustomization } from "../state/customization";
import Flat from "../components/House/Flat";
import SceneLighting from "../components/Lighting/SceneLighting";
import DesktopCamera from "../components/Camera/DesktopCamera";
import CustomizationToolbar from "../components/Customization/CustomizationToolbar";
import WallPanel from "../components/Customization/WallPanel";
import FurniturePanel from "../components/Customization/FurniturePanel";
import LightingPanel from "../components/Lighting/LightingPanel";
import ResetCustomization from "../components/Customization/ResetCustomization";
import "./DesktopApp.css";

export default function DesktopApp() {
  const { mode, setMode, activePanel, setActivePanel } = useCustomization();

  return (
    <div className="desktop-app-root">
      {/* 3D Canvas Scene */}
      <div className="desktop-canvas-container">
        <Canvas
          camera={{
            position: mode === "walkthrough" ? [2.4, 1.6, 7.2] : [10, 8, 10],
            fov: mode === "walkthrough" ? 60 : 45,
          }}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <SceneLighting />
          <Flat />
          <DesktopCamera />
        </Canvas>
      </div>

      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="desktop-brand-group">
          <span className="desktop-brand-title">The Grand Flat</span>
          <span className="desktop-brand-subtitle">Architectural 3D Configurator</span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="desktop-mode-switcher">
          <button
            className={`mode-pill-btn ${mode === "orbit" ? "active" : ""}`}
            onClick={() => setMode("orbit")}
          >
            <span>Orbit Overview</span>
          </button>
          <button
            className={`mode-pill-btn ${mode === "walkthrough" || mode === "customization" ? "active" : ""}`}
            onClick={() => setMode("walkthrough")}
          >
            <span>First-Person Walkthrough</span>
          </button>
          <button
            className={`mode-pill-btn ${mode === "orbit360" ? "active" : ""}`}
            onClick={() => setMode("orbit360")}
          >
            <span>360° Aerial</span>
          </button>
        </div>
      </header>

      {/* Desktop Walkthrough Instruction Hint */}
      {(mode === "walkthrough" || mode === "customization") && (
        <div className="desktop-controls-banner">
          <span>
            Move: <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or Arrow Keys
          </span>
          <span>•</span>
          <span>Click canvas to look with mouse (<kbd>ESC</kbd> to exit)</span>
        </div>
      )}

      {/* Customization Floating Panels */}
      {activePanel === "walls" && (
        <WallPanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "furniture" && (
        <FurniturePanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "lighting" && (
        <LightingPanel isDesktop={true} onClose={() => setActivePanel(null)} />
      )}

      {/* Floating Customization Toolbar */}
      <CustomizationToolbar isDesktop={true} />

      {/* Reset Confirmation Dialog */}
      <ResetCustomization />
    </div>
  );
}
