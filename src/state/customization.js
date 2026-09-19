import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export const WALL_COLORS_PALETTE = [
  { name: "Warm White", hex: "#F5F2EB", roughness: 0.85, metalness: 0.0 },
  { name: "Crisp Alabaster", hex: "#FFFFFF", roughness: 0.85, metalness: 0.0 },
  { name: "Soft Linen", hex: "#E9E3D5", roughness: 0.88, metalness: 0.0 },
  { name: "Nordic Greige", hex: "#CFC7BA", roughness: 0.85, metalness: 0.0 },
  { name: "Sage Mist", hex: "#B7C4B7", roughness: 0.8, metalness: 0.0 },
  { name: "Warm Terracotta", hex: "#C77D67", roughness: 0.8, metalness: 0.0 },
  { name: "Coastal Haze", hex: "#9AB1BC", roughness: 0.75, metalness: 0.0 },
  { name: "Midnight Accent", hex: "#2B3A42", roughness: 0.7, metalness: 0.05 },
  { name: "Modern Charcoal", hex: "#3A3D40", roughness: 0.75, metalness: 0.05 },
  { name: "Earthy Clay", hex: "#B88E74", roughness: 0.8, metalness: 0.0 },
];

export const LIGHTING_PRESETS = {
  morning: {
    id: "morning",
    name: "Morning Sun",
    description: "Soft dawn light casting gentle warm shadows",
    sunPosition: [8, 6, 8],
    sunColor: "#FFE3C2",
    sunIntensity: 2.6,
    ambientIntensity: 0.95,
    environmentPreset: "apartment",
    skyTint: "#FFEEDB",
  },
  afternoon: {
    id: "afternoon",
    name: "Afternoon Daylight",
    description: "Crisp, bright natural daylight filling every room",
    sunPosition: [5, 10, 5],
    sunColor: "#FFFFFF",
    sunIntensity: 3.0,
    ambientIntensity: 1.2,
    environmentPreset: "city",
    skyTint: "#F0F6FF",
  },
  evening: {
    id: "evening",
    name: "Golden Dusk",
    description: "Atmospheric golden hour with deep amber tones",
    sunPosition: [-8, 3.5, -6],
    sunColor: "#FFA366",
    sunIntensity: 2.2,
    ambientIntensity: 0.7,
    environmentPreset: "sunset",
    skyTint: "#FFD2B3",
  },
};

export const FURNITURE_CATALOG = [
  {
    type: "sofa",
    name: "Contemporary Sofa",
    defaultDimensions: [2.2, 0.8, 0.95],
    defaultScale: [1, 1, 1],
    defaultColor: "#4A5568",
    category: "Living Room",
  },
  {
    type: "dining_table",
    name: "Oak Dining Set",
    defaultDimensions: [1.8, 0.75, 1.0],
    defaultScale: [1, 1, 1],
    defaultColor: "#8D6E63",
    category: "Dining",
  },
  {
    type: "bed",
    name: "Minimalist Bed",
    defaultDimensions: [2.0, 0.9, 1.8],
    defaultScale: [1, 1, 1],
    defaultColor: "#E2E8F0",
    category: "Bedroom",
  },
  {
    type: "coffee_table",
    name: "Round Coffee Table",
    defaultDimensions: [0.9, 0.45, 0.9],
    defaultScale: [1, 1, 1],
    defaultColor: "#2D3748",
    category: "Living Room",
  },
  {
    type: "armchair",
    name: "Lounge Armchair",
    defaultDimensions: [0.9, 0.85, 0.85],
    defaultScale: [1, 1, 1],
    defaultColor: "#D69E2E",
    category: "Living Room",
  },
  {
    type: "indoor_plant",
    name: "Potted Monstera",
    defaultDimensions: [0.6, 1.4, 0.6],
    defaultScale: [1, 1, 1],
    defaultColor: "#38A169",
    category: "Decor",
  },
];

const CustomizationContext = createContext(null);

export function CustomizationProvider({ children, initialMode = "walkthrough" }) {
  // Navigation / Camera mode: 'walkthrough' | 'orbit360' | 'orbit'
  const [mode, setMode] = useState(initialMode);

  // Active floating panel: 'walls' | 'furniture' | 'lighting' | null
  const [activePanel, setActivePanel] = useState(null);

  // Wall customization: mapping from wall mesh name -> { color, roughness, metalness, name }
  const [wallColors, setWallColors] = useState({});

  // Currently selected wall mesh name (e.g. 'backFace')
  const [selectedWall, setSelectedWall] = useState(null);

  // Wall finish: 'matte' | 'satin' | 'gloss'
  const [wallFinish, setWallFinish] = useState("matte");

  // Lighting state
  const [lightingPreset, setLightingPreset] = useState("afternoon");
  const [advancedLighting, setAdvancedLighting] = useState({
    sunElevation: 45,
    sunAzimuth: 45,
    sunIntensity: 3.0,
    ambientIntensity: 1.2,
    sunColor: "#FFFFFF",
  });

  // Furniture items list
  const [furniture, setFurniture] = useState([]);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);

  // Reset confirmation modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Mode switching (Preserves all customizations!)
  const switchMode = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  // Wall actions
  const selectWall = useCallback((wallName) => {
    setSelectedWall(wallName);
    if (wallName) {
      setActivePanel("walls");
    }
  }, []);

  const setWallColor = useCallback((wallName, colorData) => {
    setWallColors((prev) => {
      if (wallName === "all") {
        return { ...prev, __all__: colorData };
      }
      return {
        ...prev,
        [wallName]: colorData,
      };
    });
  }, []);

  const applyColorToAllWalls = useCallback((colorData) => {
    setWallColors({ __all__: colorData });
  }, []);

  // Lighting actions
  const changeLightingPreset = useCallback((presetId) => {
    if (LIGHTING_PRESETS[presetId]) {
      setLightingPreset(presetId);
      const preset = LIGHTING_PRESETS[presetId];
      setAdvancedLighting((prev) => ({
        ...prev,
        sunElevation: 45,
        sunAzimuth: 45,
        sunIntensity: preset.sunIntensity,
        ambientIntensity: preset.ambientIntensity,
        sunColor: preset.sunColor,
      }));
    }
  }, []);

  const updateAdvancedLighting = useCallback((updates) => {
    setAdvancedLighting((prev) => ({ ...prev, ...updates }));
  }, []);

  // Furniture actions
  const addFurniture = useCallback((type, customPos = null) => {
    const catalogItem = FURNITURE_CATALOG.find((item) => item.type === type) || FURNITURE_CATALOG[0];
    const newItemId = "furn_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);

    setFurniture((prev) => {
      const index = prev.length;
      // Deterministic layout offset inside the living area
      const defaultPosition = customPos || [
        1.2 + (index % 3) * 0.7 - 0.7,
        0,
        1.2 + Math.floor(index / 3) * 0.7 - 0.7,
      ];

      const newItem = {
        id: newItemId,
        type: catalogItem.type,
        name: catalogItem.name,
        position: defaultPosition,
        rotation: [0, 0, 0],
        scale: [...catalogItem.defaultScale],
        color: catalogItem.defaultColor,
      };

      return [...prev, newItem];
    });

    setSelectedFurnitureId(newItemId);
    setActivePanel("furniture");
    return newItemId;
  }, []);

  const selectFurniture = useCallback((id) => {
    setSelectedFurnitureId(id);
    if (id) {
      setActivePanel("furniture");
    }
  }, []);

  const updateFurniture = useCallback((id, updates) => {
    setFurniture((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...updates,
          position: updates.position ? [...updates.position] : item.position,
          rotation: updates.rotation ? [...updates.rotation] : item.rotation,
          scale: updates.scale ? [...updates.scale] : item.scale,
        };
      })
    );
  }, []);

  const removeFurniture = useCallback((id) => {
    setFurniture((prev) => prev.filter((item) => item.id !== id));
    setSelectedFurnitureId((prev) => (prev === id ? null : prev));
  }, []);

  // Reset customization (Does NOT reset mode)
  const resetCustomization = useCallback(() => {
    setWallColors({});
    setSelectedWall(null);
    setWallFinish("matte");
    setFurniture([]);
    setSelectedFurnitureId(null);
    setLightingPreset("afternoon");
    setAdvancedLighting({
      sunElevation: 45,
      sunAzimuth: 45,
      sunIntensity: 3.0,
      ambientIntensity: 1.2,
      sunColor: "#FFFFFF",
    });
    setActivePanel(null);
    setResetModalOpen(false);
  }, []);

  // Active lighting configuration derived from preset + overrides
  const currentLighting = useMemo(() => {
    const base = LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.afternoon;
    return {
      ...base,
      sunIntensity: advancedLighting.sunIntensity,
      ambientIntensity: advancedLighting.ambientIntensity,
      sunColor: advancedLighting.sunColor,
      sunElevation: advancedLighting.sunElevation,
      sunAzimuth: advancedLighting.sunAzimuth,
    };
  }, [lightingPreset, advancedLighting]);

  // Selected furniture item object
  const selectedFurniture = useMemo(() => {
    if (!selectedFurnitureId) return null;
    return furniture.find((f) => f.id === selectedFurnitureId) || null;
  }, [furniture, selectedFurnitureId]);

  const value = {
    // Mode
    mode,
    setMode: switchMode,

    // Active panel
    activePanel,
    setActivePanel,

    // Walls
    selectedWall,
    selectWall,
    wallColors,
    setWallColor,
    applyColorToAllWalls,
    wallFinish,
    setWallFinish,

    // Furniture
    furniture,
    selectedFurnitureId,
    selectedFurniture,
    addFurniture,
    selectFurniture,
    updateFurniture,
    removeFurniture,

    // Lighting
    lightingPreset,
    setLightingPreset: changeLightingPreset,
    advancedLighting,
    updateAdvancedLighting,
    currentLighting,

    // Reset Modal
    resetModalOpen,
    setResetModalOpen,
    resetCustomization,
  };

  return React.createElement(CustomizationContext.Provider, { value }, children);
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error("useCustomization must be used within a CustomizationProvider");
  }
  return context;
}
