
import React from "react";
import { useCustomization } from "../../state/customization";

export default function CustomizationToolbar() {
  const {
    mode,
    setMode,
    activePanel,
    setActivePanel,
    setResetModalOpen,
    furniture,
    selectedWall,
  } = useCustomization();

  const togglePanel = (panelName) => {
    setActivePanel((current) =>
      current === panelName ? null : panelName
    );
  };

  const handleModeToggle = () => {
    if (mode === "customization") {
      setActivePanel(null);
      setMode("walkthrough");
    } else {
      setMode("customization");
    }
  };

  const enter360 = () => {
    setActivePanel(null);
    setMode("orbit360");
  };

  return (
    <nav
      className="customization-toolbar"
      aria-label="Customization toolbar"
    >
      <div className="toolbar-container">

        {/* 1. Walls */}
        <button
          className={`toolbar-btn ${
            activePanel === "walls" ? "active" : ""
          }`}
          onClick={() => togglePanel("walls")}
          title="Customize Wall Paint & Finishes"
        >
          <span className="toolbar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </span>

          <span className="toolbar-label">Walls</span>

          {selectedWall && (
            <span className="toolbar-status-dot" />
          )}
        </button>

        {/* 2. Furniture */}
        <button
          className={`toolbar-btn ${
            activePanel === "furniture" ? "active" : ""
          }`}
          onClick={() => togglePanel("furniture")}
          title="Add and Arrange Furniture"
        >
          <span className="toolbar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
              <rect x="2" y="9" width="20" height="8" rx="2" />
              <path d="M4 17v4" />
              <path d="M20 17v4" />
            </svg>
          </span>

          <span className="toolbar-label">Furniture</span>

          {furniture.length > 0 && (
            <span className="toolbar-badge">
              {furniture.length}
            </span>
          )}
        </button>

        {/* 3. Lighting */}
        <button
          className={`toolbar-btn ${
            activePanel === "lighting" ? "active" : ""
          }`}
          onClick={() => togglePanel("lighting")}
          title="Change Sun & Daylight Atmosphere"
        >
          <span className="toolbar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </span>

          <span className="toolbar-label">Lighting</span>
        </button>

        {/* 4. 360° Aerial */}
        <button
          className={`toolbar-btn ${
            mode === "orbit360" ? "active orbit-active" : ""
          }`}
          onClick={enter360}
          title="Enter 360° Aerial View"
        >
          <span className="toolbar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <ellipse
                cx="12"
                cy="12"
                rx="9"
                ry="3.5"
              />
              <path d="M3 12h18" />
              <path d="M12 3c2.2 2.5 3.3 5.5 3.3 9s-1.1 6.5-3.3 9" />
              <path d="M12 3c-2.2 2.5-3.3 5.5-3.3 9s1.1 6.5 3.3 9" />
            </svg>
          </span>

          <span className="toolbar-label">360°</span>
        </button>

        {/* 5. Customization / Walkthrough */}
        <button
          className={`toolbar-btn mode-switch ${
            mode === "customization"
              ? "active orbit-active"
              : ""
          }`}
          onClick={handleModeToggle}
          title={
            mode === "customization"
              ? "Return to Walkthrough"
              : "Enter Customization View"
          }
        >
          <span className="toolbar-icon">
            {mode === "customization" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v7" />
                <path d="m9 11 3-3 3 3" />
                <path d="m9 18 3-4 3 4" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="9"
                  ry="3"
                />
                <path d="M12 3v18" />
              </svg>
            )}
          </span>

          <span className="toolbar-label">
            {mode === "customization"
              ? "Walkthrough"
              : "Customize"}
          </span>
        </button>

        {/* 6. Reset */}
        <button
          className="toolbar-btn reset-btn"
          onClick={() => setResetModalOpen(true)}
          title="Reset All Customizations"
        >
          <span className="toolbar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </span>

          <span className="toolbar-label">Reset</span>
        </button>

      </div>
    </nav>
  );
}
