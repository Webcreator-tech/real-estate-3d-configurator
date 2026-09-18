import React, { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCustomization } from "../../state/customization";
import { mobileWalkthroughInput, TAP_THRESHOLD } from "./mobileInput";

/**
 * Mobile first-person camera.
 *
 * walkthrough:
 *   Starts outside the main entrance.
 *
 * customization:
 *   Starts inside the property.
 *
 * Both modes use the same joystick + swipe-look controls.
 */
export function MobileWalkthroughCamera() {
  const { camera } = useThree();
  const { mode } = useCustomization();

  const playerPos = useRef(new THREE.Vector3());
  const yaw = useRef(Math.PI);
  const pitch = useRef(0);

  const lastMode = useRef(null);

  useEffect(() => {
    const isCustomization = mode === "customization";

    if (isCustomization) {
      // Spawn inside the flat.
      // Kept near the main living area so the user can immediately
      // see and interact with the interior.
      playerPos.current.set(0, 1.6, 2.0);

      // Face toward the interior.
      yaw.current = Math.PI;
    } else {
      // Walkthrough starts outside the main entrance.
      playerPos.current.set(2.4, 1.6, 7.2);

      // Face toward the property.
      yaw.current = Math.PI;
    }

    pitch.current = 0;

    camera.position.copy(playerPos.current);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    lastMode.current = mode;
  }, [camera, mode]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // ------------------------------------------------------------
    // 1. LOOK
    // ------------------------------------------------------------

    const lookSensitivity = 0.0035;

    const dx = mobileWalkthroughInput.lookDelta.x;
    const dy = mobileWalkthroughInput.lookDelta.y;

    if (dx !== 0 || dy !== 0) {
      const movement = Math.hypot(dx, dy);

      if (movement > TAP_THRESHOLD) {
        yaw.current -= dx * lookSensitivity;
        pitch.current -= dy * lookSensitivity;

        const maxPitch = Math.PI * 0.36;

        pitch.current = Math.max(
          -maxPitch,
          Math.min(maxPitch, pitch.current)
        );
      }

      mobileWalkthroughInput.lookDelta.x = 0;
      mobileWalkthroughInput.lookDelta.y = 0;
    }

    // ------------------------------------------------------------
    // 2. MOVEMENT
    // ------------------------------------------------------------

    const mx = mobileWalkthroughInput.move.x;
    const my = mobileWalkthroughInput.move.y;

    if (mx !== 0 || my !== 0) {
      const walkSpeed = 2.8;

      const forwardX = -Math.sin(yaw.current);
      const forwardZ = -Math.cos(yaw.current);

      const rightX = Math.cos(yaw.current);
      const rightZ = -Math.sin(yaw.current);

      const moveX =
        forwardX * my +
        rightX * mx;

      const moveZ =
        forwardZ * my +
        rightZ * mx;

      playerPos.current.x += moveX * walkSpeed * dt;
      playerPos.current.z += moveZ * walkSpeed * dt;
    }

    // ------------------------------------------------------------
    // 3. MODE-SPECIFIC BOUNDS
    // ------------------------------------------------------------

    if (mode === "customization") {
      // Interior-only movement.
      //
      // These are intentionally conservative so the player remains
      // inside the property while customization mode is active.
      playerPos.current.x = THREE.MathUtils.clamp(
        playerPos.current.x,
        -3.7,
        3.7
      );

      playerPos.current.z = THREE.MathUtils.clamp(
        playerPos.current.z,
        -5.0,
        5.0
      );
    } else {
      // Walkthrough can move between the exterior entrance area
      // and the apartment.
      playerPos.current.x = THREE.MathUtils.clamp(
        playerPos.current.x,
        -4.1,
        4.1
      );

      playerPos.current.z = THREE.MathUtils.clamp(
        playerPos.current.z,
        -5.9,
        7.6
      );
    }

    // Never fly.
    playerPos.current.y = 1.6;

    camera.position.copy(playerPos.current);
    camera.rotation.set(
      pitch.current,
      yaw.current,
      0,
      "YXZ"
    );
  });

  return null;
}

/**
 * Mobile touch controller.
 *
 * IMPORTANT:
 * There is intentionally NO full-screen/right-side HTML look overlay.
 * This allows R3F/Three.js to receive wall and furniture touches.
 *
 * Camera look is tracked from document-level touch events instead.
 */
export function MobileTouchControls() {
  const joystickBaseRef = useRef(null);

  const [stickPos, setStickPos] = useState({
    x: 0,
    y: 0,
  });

  const [isJoystickActive, setIsJoystickActive] =
    useState(false);

  const [hasInteracted, setHasInteracted] =
    useState(false);

  const touchIdRef = useRef(null);

  const lookTouchIdRef = useRef(null);

  const lastLookPosRef = useRef({
    x: 0,
    y: 0,
  });

  const lookStartedRef = useRef(false);

  // ------------------------------------------------------------
  // GLOBAL LOOK TOUCH HANDLER
  // ------------------------------------------------------------

  useEffect(() => {
    const isJoystickTouch = (target) => {
      if (!target || !target.closest) return false;

      return Boolean(
        target.closest(".mobile-joystick-zone")
      );
    };

    const isUiTouch = (target) => {
  if (!target || !target.closest) return false;

  return Boolean(
    target.closest(
      ".customization-panel, .customization-toolbar, .mobile-header, .modal-backdrop"
    )
  );
};

const handleTouchStart = (e) => {
  // Joystick and UI panels own their own touches.
  if (isJoystickTouch(e.target) || isUiTouch(e.target)) return;

  // Only one look finger.
  if (lookTouchIdRef.current !== null) return;

  // Don't treat pinch/multi-touch as camera look.
  if (e.touches.length > 1) return;

      const touch = e.changedTouches[0];

      if (!touch) return;

      lookTouchIdRef.current = touch.identifier;

      lastLookPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };

      lookStartedRef.current = false;

      setHasInteracted(true);
    };

    const handleTouchMove = (e) => {
      if (lookTouchIdRef.current === null) return;

      for (const touch of e.changedTouches) {
        if (
          touch.identifier !==
          lookTouchIdRef.current
        ) {
          continue;
        }

        const dx =
          touch.clientX -
          lastLookPosRef.current.x;

        const dy =
          touch.clientY -
          lastLookPosRef.current.y;

        const movement = Math.hypot(dx, dy);

        if (movement > TAP_THRESHOLD) {
          lookStartedRef.current = true;

          mobileWalkthroughInput.lookDelta.x += dx;
          mobileWalkthroughInput.lookDelta.y += dy;
        }

        lastLookPosRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        };

        break;
      }
    };

    const handleTouchEnd = (e) => {
      for (const touch of e.changedTouches) {
        if (
          touch.identifier !==
          lookTouchIdRef.current
        ) {
          continue;
        }

        lookTouchIdRef.current = null;

        lastLookPosRef.current = {
          x: 0,
          y: 0,
        };

        lookStartedRef.current = false;

        mobileWalkthroughInput.lookDelta.x = 0;
        mobileWalkthroughInput.lookDelta.y = 0;

        break;
      }
    };

    window.addEventListener(
      "touchstart",
      handleTouchStart,
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      handleTouchMove,
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      handleTouchEnd,
      { passive: true }
    );

    window.addEventListener(
      "touchcancel",
      handleTouchEnd,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      window.removeEventListener(
        "touchmove",
        handleTouchMove
      );

      window.removeEventListener(
        "touchend",
        handleTouchEnd
      );

      window.removeEventListener(
        "touchcancel",
        handleTouchEnd
      );
    };
  }, []);

  // ------------------------------------------------------------
  // JOYSTICK
  // ------------------------------------------------------------

  const updateJoystick = (clientX, clientY) => {
    if (!joystickBaseRef.current) return;

    const rect =
      joystickBaseRef.current.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setStickPos({
      x: dx,
      y: dy,
    });

    mobileWalkthroughInput.move.x =
      dx / maxRadius;

    mobileWalkthroughInput.move.y =
      -dy / maxRadius;
  };

  const handleJoystickTouchStart = (e) => {
    e.stopPropagation();

    if (touchIdRef.current !== null) return;

    const touch = e.changedTouches[0];

    if (!touch) return;

    touchIdRef.current = touch.identifier;

    setIsJoystickActive(true);
    setHasInteracted(true);

    updateJoystick(
      touch.clientX,
      touch.clientY
    );
  };

  const handleJoystickTouchMove = (e) => {
    e.stopPropagation();

    for (const touch of e.changedTouches) {
      if (
        touch.identifier ===
        touchIdRef.current
      ) {
        updateJoystick(
          touch.clientX,
          touch.clientY
        );

        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e) => {
    e.stopPropagation();

    for (const touch of e.changedTouches) {
      if (
        touch.identifier ===
        touchIdRef.current
      ) {
        touchIdRef.current = null;

        setIsJoystickActive(false);

        setStickPos({
          x: 0,
          y: 0,
        });

        mobileWalkthroughInput.move.x = 0;
        mobileWalkthroughInput.move.y = 0;

        break;
      }
    }
  };

  return (
    <div className="mobile-touch-controls">
      {/* 
        NO mobile-look-surface here.
        The Canvas must receive touches directly.
      */}

      <div className="mobile-joystick-zone">
        <div
          ref={joystickBaseRef}
          className={`virtual-joystick-base ${
            isJoystickActive
              ? "active"
              : ""
          }`}
          onTouchStart={
            handleJoystickTouchStart
          }
          onTouchMove={
            handleJoystickTouchMove
          }
          onTouchEnd={
            handleJoystickTouchEnd
          }
          onTouchCancel={
            handleJoystickTouchEnd
          }
        >
          <div
            className="virtual-joystick-thumb"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          />
        </div>
      </div>

      {!hasInteracted && (
        <div className="mobile-controls-hint">
          <span>Move (Left Stick)</span>
          <span className="dot">•</span>
          <span>Look (Swipe)</span>
        </div>
      )}
    </div>
  );
}

export default function MobileWalkthrough() {
  return <MobileWalkthroughCamera />;
}
