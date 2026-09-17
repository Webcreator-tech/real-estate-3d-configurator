import React from "react";
import { useCustomization } from "../../state/customization";
import { MobileWalkthroughCamera } from "../Walkthrough/MobileWalkthrough";
import Orbit360 from "./Orbit360";

export default function MobileCamera() {
  const { mode } = useCustomization();

  if (mode === "orbit360") {
    return <Orbit360 />;
  }

  // Default to Walkthrough mode on mobile
  return <MobileWalkthroughCamera />;
}
