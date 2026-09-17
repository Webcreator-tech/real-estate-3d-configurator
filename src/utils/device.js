import { useState, useEffect } from "react";

/**
 * Checks if the current environment/viewport is a mobile or tablet device.
 */
export function isMobileDevice() {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 1024;

  // If mobile user agent or touch-enabled tablet/phone screen
  return isMobileUA || (isTouchDevice && isSmallScreen) || isSmallScreen;
}

/**
 * React hook to reactively track if device is mobile/tablet.
 */
export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    const isMobile = isMobileDevice();
    const isPortrait = typeof window !== "undefined" ? window.innerHeight > window.innerWidth : true;
    return {
      isMobile,
      isDesktop: !isMobile,
      isPortrait,
      width: typeof window !== "undefined" ? window.innerWidth : 1200,
      height: typeof window !== "undefined" ? window.innerHeight : 800,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = isMobileDevice();
      const isPortrait = window.innerHeight > window.innerWidth;
      setDeviceInfo({
        isMobile,
        isDesktop: !isMobile,
        isPortrait,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return deviceInfo;
}
