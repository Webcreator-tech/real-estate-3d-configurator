import React from "react";
import { useCustomization, WALL_COLORS_PALETTE } from "../../state/customization";

export default function WallPanel({ onClose }) {
  const {
    selectedWall,
    selectWall,
    wallColors,
    setWallColor,
    applyColorToAllWalls,
    wallFinish,
    setWallFinish,
  } = useCustomization();

  const currentColor = selectedWall
    ? wallColors[selectedWall]?.hex || wallColors.__all__?.hex || "#F5F2EB"
    : wallColors.__all__?.hex || "#F5F2EB";

  const handleSelectColor = (colorObj, applyToAll = false) => {
    if (applyToAll || !selectedWall) {
      applyColorToAllWalls(colorObj);
    } else {
      setWallColor(selectedWall, colorObj);
    }
  };

  const getFriendlyWallName = (name) => {
    if (!name) return "All Walls";
    if (name.includes("backFace.003")) return "Rear Master Wall";
    if (name.includes("backFace.006")) return "Front Entrance Wall";
    if (name.includes("backFace.002")) return "Living Room Accent";
    if (name.includes("backFace.005")) return "Kitchen Wall";
    if (name.includes("soul")) return "Hallway Partition";
    return name;
  };

  return (
    <div className="customization-panel wall-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-badge">Customization</span>
          <h3 className="panel-title">Wall Colors & Finish</h3>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      <div className="panel-status-bar">
        {selectedWall ? (
          <div className="selected-target">
            <span className="target-dot" />
            <span className="target-text">
              Wall: <strong>{getFriendlyWallName(selectedWall)}</strong>
            </span>
            <button className="target-clear-btn" onClick={() => selectWall(null)}>
              Target All
            </button>
          </div>
        ) : (
          <div className="target-hint">
            <span>Tap any wall in 3D, or select color for all walls:</span>
          </div>
        )}
      </div>

      {/* Color Palette Grid */}
      <div className="color-palette-scroll">
        <div className="color-palette-grid">
          {WALL_COLORS_PALETTE.map((color) => {
            const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.name}
                className={`color-swatch-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectColor(color)}
                title={color.name}
              >
                <span
                  className="color-swatch-circle"
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: isSelected ? `0 0 0 3px #38bdf8` : "none",
                  }}
                />
                <span className="color-swatch-name">{color.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Finish Selector */}
      <div className="finish-section">
        <span className="section-label">Surface Finish</span>
        <div className="finish-pill-group">
          {["matte", "satin", "gloss"].map((finish) => (
            <button
              key={finish}
              className={`finish-pill ${wallFinish === finish ? "active" : ""}`}
              onClick={() => setWallFinish(finish)}
            >
              {finish.charAt(0).toUpperCase() + finish.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Footer */}
      {selectedWall && (
        <div className="panel-footer-actions">
          <button
            className="action-btn secondary"
            onClick={() => {
              const active = WALL_COLORS_PALETTE.find(
                (c) => c.hex.toLowerCase() === currentColor.toLowerCase()
              ) || WALL_COLORS_PALETTE[0];
              applyColorToAllWalls(active);
            }}
          >
            Apply to Entire Home
          </button>
        </div>
      )}
    </div>
  );
}
