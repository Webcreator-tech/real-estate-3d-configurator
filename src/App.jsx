import React from "react";
import { useDevice } from "./utils/device";
import { CustomizationProvider } from "./state/customization";
import MobileApp from "./mobile/MobileApp";
import DesktopApp from "./desktop/DesktopApp";
import "./App.css";

export default function App() {
  const { isMobile } = useDevice();

  return (
    <CustomizationProvider initialMode={isMobile ? "walkthrough" : "orbit"}>
      <div className="app">
        {isMobile ? <MobileApp /> : <DesktopApp />}
      </div>
    </CustomizationProvider>
  );
}
