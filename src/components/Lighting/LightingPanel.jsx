import React from "react";
import { useCustomization, LIGHTING_PRESETS } from "../../state/customization";

export default function LightingPanel({ onClose, isDesktop = false }) {
  const {
    lightingPreset,
    setLightingPreset,
    advancedLighting,
    updateAdvancedLighting,
  } = useCustomization();

  const presets = [
    {
      id: "morning",
      label: "Morning",
      time: "08:00 AM",
      icon: "🌅",
      desc: LIGHTING_PRESETS.morning.description,
    },
    {
      id: "afternoon",
      label: "Afternoon",
      time: "01:00 PM",
      icon: "☀️",
      desc: LIGHTING_PRESETS.afternoon.description,
    },
    {
      id: "evening",
      label: "Golden Dusk",
      time: "06:30 PM",
      icon: "🌇",
      desc: LIGHTING_PRESETS.evening.description,
    },
  ];

  return (
    <div className="customization-panel lighting-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-badge">Environment</span>
          <h3 className="panel-title">Natural Daylight</h3>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      {/* Preset Cards */}
      <div className="lighting-preset-list">
        {presets.map((p) => {
          const isActive = lightingPreset === p.id;
          return (
            <button
              key={p.id}
              className={`lighting-preset-card ${isActive ? "active" : ""}`}
              onClick={() => setLightingPreset(p.id)}
            >
              <span className="preset-icon">{p.icon}</span>
              <div className="preset-info">
                <div className="preset-title-row">
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-time">{p.time}</span>
                </div>
                <span className="preset-desc">{p.desc}</span>
              </div>
              {isActive && <span className="preset-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Desktop Advanced Controls */}
      {isDesktop && (
        <div className="advanced-lighting-section">
          <div className="advanced-section-header">
            <span className="advanced-title">Advanced Sun & Atmosphere Control</span>
          </div>

          <div className="slider-control-group">
            <div className="slider-label-row">
              <span>Sun Azimuth Angle</span>
              <span className="slider-val">{Math.round(advancedLighting.sunAzimuth)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={advancedLighting.sunAzimuth}
              onChange={(e) =>
                updateAdvancedLighting({ sunAzimuth: parseFloat(e.target.value) })
              }
              className="custom-range-slider"
            />
          </div>

          <div className="slider-control-group">
            <div className="slider-label-row">
              <span>Sun Elevation</span>
              <span className="slider-val">{Math.round(advancedLighting.sunElevation)}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="85"
              value={advancedLighting.sunElevation}
              onChange={(e) =>
                updateAdvancedLighting({ sunElevation: parseFloat(e.target.value) })
              }
              className="custom-range-slider"
            />
          </div>

          <div className="slider-control-group">
            <div className="slider-label-row">
              <span>Direct Sun Intensity</span>
              <span className="slider-val">{advancedLighting.sunIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={advancedLighting.sunIntensity}
              onChange={(e) =>
                updateAdvancedLighting({ sunIntensity: parseFloat(e.target.value) })
              }
              className="custom-range-slider"
            />
          </div>

          <div className="slider-control-group">
            <div className="slider-label-row">
              <span>Ambient Room Illumination</span>
              <span className="slider-val">{advancedLighting.ambientIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.05"
              value={advancedLighting.ambientIntensity}
              onChange={(e) =>
                updateAdvancedLighting({ ambientIntensity: parseFloat(e.target.value) })
              }
              className="custom-range-slider"
            />
          </div>
        </div>
      )}
    </div>
  );
}
