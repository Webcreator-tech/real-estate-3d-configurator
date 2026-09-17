import React, { useState } from "react";
import {
  useCustomization,
  FURNITURE_CATALOG,
} from "../../state/customization";

const FURNITURE_FABRIC_COLORS = [
  { name: "Slate Grey", hex: "#4A5568" },
  { name: "Cream Bouclé", hex: "#E2E8F0" },
  { name: "Caramel Leather", hex: "#8D6E63" },
  { name: "Forest Velvet", hex: "#2E7D32" },
  { name: "Mustard Accent", hex: "#D69E2E" },
  { name: "Midnight Charcoal", hex: "#1A202C" },
];

export default function FurniturePanel({ onClose }) {
  const {
    furniture,
    selectedFurniture,
    selectedFurnitureId,
    addFurniture,
    selectFurniture,
    updateFurniture,
    removeFurniture,
  } = useCustomization();

  const [activeTab, setActiveTab] = useState(selectedFurniture ? "edit" : "add");

  const handleAddItem = (type) => {
    addFurniture(type);
    setActiveTab("edit");
  };

  const handleNudgePosition = (axis, delta) => {
    if (!selectedFurniture) return;
    const current = [...selectedFurniture.position];
    if (axis === "x") current[0] = Math.max(-4.0, Math.min(4.0, current[0] + delta));
    if (axis === "z") current[2] = Math.max(-5.8, Math.min(6.5, current[2] + delta));
    updateFurniture(selectedFurniture.id, { position: current });
  };

  const handleRotate = (angleDelta) => {
    if (!selectedFurniture) return;
    const currentRot = [...selectedFurniture.rotation];
    currentRot[1] = (currentRot[1] + angleDelta) % (Math.PI * 2);
    updateFurniture(selectedFurniture.id, { rotation: currentRot });
  };

  const handleSetScale = (scaleFactor) => {
    if (!selectedFurniture) return;
    updateFurniture(selectedFurniture.id, {
      scale: [scaleFactor, scaleFactor, scaleFactor],
    });
  };

  const handleColorChange = (hex) => {
    if (!selectedFurniture) return;
    updateFurniture(selectedFurniture.id, { color: hex });
  };

  return (
    <div className="customization-panel furniture-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-badge">Interior Staging</span>
          <h3 className="panel-title">Furniture & Decor</h3>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="panel-tab-bar">
        <button
          className={`panel-tab-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Add Items ({furniture.length})
        </button>
        <button
          className={`panel-tab-btn ${activeTab === "edit" ? "active" : ""}`}
          onClick={() => setActiveTab("edit")}
          disabled={!selectedFurniture}
        >
          {selectedFurniture ? `Edit: ${selectedFurniture.name}` : "Select Item to Edit"}
        </button>
      </div>

      {/* Tab 1: Catalog of Items */}
      {activeTab === "add" && (
        <div className="furniture-catalog-scroll">
          <div className="furniture-catalog-grid">
            {FURNITURE_CATALOG.map((item) => (
              <div key={item.type} className="furniture-catalog-card">
                <div className="card-info">
                  <span className="card-category">{item.category}</span>
                  <span className="card-title">{item.name}</span>
                </div>
                <button
                  className="card-add-btn"
                  onClick={() => handleAddItem(item.type)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>

          <div className="catalog-status-note">
            <span className="info-icon">ℹ️</span>
            <span>
              Configured with procedural 3D furniture scaffolding. Custom GLTF models
              can be dropped into catalog.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Transform & Style Selected Item */}
      {activeTab === "edit" && selectedFurniture && (
        <div className="furniture-editor-scroll">
          {/* Item Banner & Deselect */}
          <div className="selected-item-banner">
            <span className="item-name-tag">{selectedFurniture.name}</span>
            <button
              className="deselect-btn"
              onClick={() => selectFurniture(null)}
            >
              Deselect
            </button>
          </div>

          {/* Position Controls */}
          <div className="control-row-group">
            <span className="control-label">Position (Move on Floor)</span>
            <div className="dpad-nudge-grid">
              <button
                className="nudge-btn"
                onClick={() => handleNudgePosition("z", -0.4)}
                title="Move Forward"
              >
                ▲ Forward
              </button>
              <div className="dpad-middle-row">
                <button
                  className="nudge-btn"
                  onClick={() => handleNudgePosition("x", -0.4)}
                  title="Move Left"
                >
                  ◀ Left
                </button>
                <button
                  className="nudge-btn"
                  onClick={() => handleNudgePosition("x", 0.4)}
                  title="Move Right"
                >
                  Right ▶
                </button>
              </div>
              <button
                className="nudge-btn"
                onClick={() => handleNudgePosition("z", 0.4)}
                title="Move Backward"
              >
                ▼ Backward
              </button>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="control-row-group">
            <span className="control-label">Rotation</span>
            <div className="rotation-btn-group">
              <button
                className="rotate-btn"
                onClick={() => handleRotate(-Math.PI / 4)}
              >
                ↺ -45°
              </button>
              <button
                className="rotate-btn"
                onClick={() => handleRotate(Math.PI / 4)}
              >
                ↻ +45°
              </button>
              <button
                className="rotate-btn"
                onClick={() => handleRotate(Math.PI / 2)}
              >
                ↷ 90° Turn
              </button>
            </div>
          </div>

          {/* Scale Presets */}
          <div className="control-row-group">
            <span className="control-label">Size Scale</span>
            <div className="scale-btn-group">
              {[
                { label: "Compact", factor: 0.8 },
                { label: "Normal", factor: 1.0 },
                { label: "Spacious", factor: 1.25 },
              ].map((s) => {
                const currentFactor = selectedFurniture.scale?.[0] || 1;
                const isSelected = Math.abs(currentFactor - s.factor) < 0.05;
                return (
                  <button
                    key={s.label}
                    className={`scale-pill ${isSelected ? "active" : ""}`}
                    onClick={() => handleSetScale(s.factor)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color & Material */}
          <div className="control-row-group">
            <span className="control-label">Material & Color</span>
            <div className="furniture-color-row">
              {FURNITURE_FABRIC_COLORS.map((col) => {
                const isCurrent =
                  selectedFurniture.color?.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.name}
                    className={`furn-color-dot ${isCurrent ? "active" : ""}`}
                    style={{ backgroundColor: col.hex }}
                    onClick={() => handleColorChange(col.hex)}
                    title={col.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Delete Action */}
          <div className="panel-footer-actions">
            <button
              className="action-btn danger"
              onClick={() => {
                removeFurniture(selectedFurniture.id);
                setActiveTab("add");
              }}
            >
              🗑️ Delete Item
            </button>
          </div>
        </div>
      )}

      {/* Placed Items Quick Selector */}
      {furniture.length > 0 && (
        <div className="placed-furniture-strip">
          <span className="strip-title">Placed Items:</span>
          <div className="strip-items-scroll">
            {furniture.map((item, idx) => (
              <button
                key={item.id}
                className={`strip-item-tag ${
                  item.id === selectedFurnitureId ? "selected" : ""
                }`}
                onClick={() => {
                  selectFurniture(item.id);
                  setActiveTab("edit");
                }}
              >
                #{idx + 1} {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
