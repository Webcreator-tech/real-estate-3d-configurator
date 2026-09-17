import React, { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mobileWalkthroughInput, TAP_THRESHOLD } from "./mobileInput";

/**
 * 3D Camera Controller for Mobile Walkthrough
 * Must be mounted inside <Canvas>
 * Distinguishes short tap (object selection) from intentional look drag (camera rotation).
 */
export function MobileWalkthroughCamera() {
  const { camera } = useThree();

  // Starting location: outside near the main entrance door
  // Door is at [2.37, 1.2, 5.95], so outside is at z = 7.2
  const playerPos = useRef(new THREE.Vector3(2.4, 1.6, 7.2));
  const yaw = useRef(Math.PI); // Facing inward toward z = 0
  const pitch = useRef(0);

  // Tap/look discrimination state
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Initialize camera position and orientation on mount
  useEffect(() => {
    playerPos.current.set(2.4, 1.6, 7.2);
    yaw.current = Math.PI;
    pitch.current = 0;
    camera.position.copy(playerPos.current);
    camera.rotation.set(0, Math.PI, 0, "YXZ");
  }, [camera]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // 1. Process Look Rotation (Yaw & Pitch) — only if lookDelta exceeds tap threshold
    const lookSensitivity = 0.0035;
    if (mobileWalkthroughInput.lookDelta.x !== 0 || mobileWalkthroughInput.lookDelta.y !== 0) {
      // Check if this exceeds the tap threshold; if not, treat as tap (do not rotate)
      const dx = mobileWalkthroughInput.lookDelta.x;
      const dy = mobileWalkthroughInput.lookDelta.y;
      const movement = Math.hypot(dx, dy);
      if (movement > TAP_THRESHOLD) {
        yaw.current -= dx * lookSensitivity;
        pitch.current -= dy * lookSensitivity;

        // Clamp vertical pitch between -65° and +65°
        const maxPitch = Math.PI * 0.36;
        pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));

        // Reset look delta after consumption (only for real look drags)
        mobileWalkthroughInput.lookDelta.x = 0;
        mobileWalkthroughInput.lookDelta.y = 0;
      } else {
        // Movement below threshold: reset to treat as tap, not look drag
        mobileWalkthroughInput.lookDelta.x = 0;
        mobileWalkthroughInput.lookDelta.y = 0;
      }
    }

    // 2. Process Horizontal Walking Movement (X-Z plane only)
    const mx = mobileWalkthroughInput.move.x;
    const my = mobileWalkthroughInput.move.y;

    if (mx !== 0 || my !== 0) {
      const walkSpeed = 2.8; // meters per second

      // Compute horizontal forward and right vectors from yaw
      const forwardX = -Math.sin(yaw.current);
      const forwardZ = -Math.cos(yaw.current);

      const rightX = Math.cos(yaw.current);
      const rightZ = -Math.sin(yaw.current);

      // Inverted Y on joystick corresponds to moving forward
      const moveX = forwardX * my + rightX * mx;
      const moveZ = forwardZ * my + rightZ * mx;

      playerPos.current.x += moveX * walkSpeed * dt;
      playerPos.current.z += moveZ * walkSpeed * dt;

      // Soft clamp inside bounds of apartment and exterior entrance terrace
      playerPos.current.x = Math.max(-4.1, Math.min(4.1, playerPos.current.x));
      playerPos.current.z = Math.max(-5.9, Math.min(7.6, playerPos.current.z));
    }

    // 3. Strictly lock camera/player height at walking level (1.6m)
    playerPos.current.y = 1.6;

    // Apply to Three.js camera
    camera.position.copy(playerPos.current);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return null;
}

/**
 * HTML Touch Controls Overlay for Mobile Walkthrough
 * Left-side virtual joystick + Right-side one-finger swipe look
 */
export function MobileTouchControls() {
  const joystickBaseRef = useRef(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const touchIdRef = useRef(null);
  const lookTouchIdRef = useRef(null);
  const lastLookPosRef = useRef({ x: 0, y: 0 });

  // Handle Joystick Touch Events
  const handleJoystickTouchStart = (e) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    setHasInteracted(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsJoystickActive(false);
        setStickPos({ x: 0, y: 0 });
        mobileWalkthroughInput.move.x = 0;
        mobileWalkthroughInput.move.y = 0;
        break;
      }
    }
  };

  const updateJoystick = (clientX, clientY) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setStickPos({ x: dx, y: dy });

    // Normalized coordinates (-1 to 1)
    // Note: dy negative means finger pushed upward (forward)
    mobileWalkthroughInput.move.x = dx / maxRadius;
    mobileWalkthroughInput.move.y = -dy / maxRadius;
  };

  // Handle Right-Side Look Touch Events
  const handleLookTouchStart = (e) => {
    if (lookTouchIdRef.current !== null) return;
    // Only accept single finger to prevent pinch
    if (e.touches.length > 1) return;

    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    // Record starting position for tap/look discrimination
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
    setHasInteracted(true);
  };

  const handleLookTouchMove = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        const touch = e.changedTouches[i];
        const dx = touch.clientX - lastLookPosRef.current.x;
        const dy = touch.clientY - lastLookPosRef.current.y;

        const movement = Math.hypot(dx, dy);

        if (movement > TAP_THRESHOLD) {
          // Intentional look drag: accumulate lookDelta
          mobileWalkthroughInput.lookDelta.x += dx;
          mobileWalkthroughInput.lookDelta.y += dy;
          // Stop propagation so tap/selection does not trigger
          e.stopPropagation();
        } else {
          // Below threshold: treat as tap, do not accumulate lookDelta
          // Do NOT stop propagation - allow tap to reach 3D scene for object selection
          // Reset accumulated delta so a subsequent drag starts fresh
          mobileWalkthroughInput.lookDelta.x = 0;
          mobileWalkthroughInput.lookDelta.y = 0;
        }

        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleLookTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        // Reset look delta on touch end
        mobileWalkthroughInput.lookDelta.x = 0;
        mobileWalkthroughInput.lookDelta.y = 0;
        break;
      }
    }
  };

  return (
    <div className="mobile-touch-controls">
      {/* Right-Side Look Surface */}
      <div
        className="mobile-look-surface"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* Left-Side Virtual Joystick Area */}
      <div className="mobile-joystick-zone">
        <div
          ref={joystickBaseRef}
          className={`virtual-joystick-base ${isJoystickActive ? "active" : ""}`}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
        >
          <div
            className="virtual-joystick-thumb"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Subtle First-Time User Guide Badge */}
      {!hasInteracted && (
        <div className="mobile-controls-hint">
          <span>Move (Left Stick)</span>
          <span className="dot">•</span>
          <span>Look (Swipe Right)</span>
        </div>
      )}
    </div>
  );
}

export default function MobileWalkthrough() {
  return <MobileWalkthroughCamera />;
}
