import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCustomization } from "../../state/customization";

export default function DesktopWalkthrough() {
  const { camera, gl } = useThree();
  const { mode, activePanel, resetModalOpen } = useCustomization();

  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  const isLocked = useRef(false);

  const yaw = useRef(Math.PI);
  const pitch = useRef(0);
  const playerPos = useRef(new THREE.Vector3(2.4, 1.6, 7.2));

  // Initialize camera position near the entrance (walkthrough) or interior (customization)
  useEffect(() => {
    const isCustomization = mode === "customization";
    if (isCustomization) {
      playerPos.current.set(0, 1.6, 2.0);
    } else {
      playerPos.current.set(2.4, 1.6, 7.2);
    }
    yaw.current = Math.PI;
    pitch.current = 0;
    camera.position.copy(playerPos.current);
    camera.rotation.set(0, Math.PI, 0, "YXZ");
    if ("fov" in camera) {
      Object.assign(camera, { fov: 60 });
      camera.updateProjectionMatrix();
    }
  }, [camera, mode]);

  // Automatically release pointer lock when a panel or modal is open
  useEffect(() => {
    if (activePanel || resetModalOpen) {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock?.();
      }
    }
  }, [activePanel, resetModalOpen, gl]);

  // Pointer lock & mouse event listeners
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      isLocked.current = locked;
    };

    const handleMouseMove = (e) => {
      if (!isLocked.current) return;

      const sensitivity = 0.0024;
      yaw.current -= e.movementX * sensitivity;
      pitch.current -= e.movementY * sensitivity;

      const maxPitch = Math.PI * 0.45; // ~81 degrees
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    };

    const handleClick = () => {
      // Do not trap mouse in pointer lock when interacting with UI panels
      if (activePanel || resetModalOpen) return;

      if (!isLocked.current) {
        canvas.requestPointerLock?.();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }
    };
  }, [gl, activePanel, resetModalOpen]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (keysPressed.current[key] !== undefined) {
        keysPressed.current[key] = true;
      }
      if (keysPressed.current[e.key] !== undefined) {
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current[key] !== undefined) {
        keysPressed.current[key] = false;
      }
      if (keysPressed.current[e.key] !== undefined) {
        keysPressed.current[e.key] = false;
      }
    };

    // Prevent keys getting stuck on window blur / tab switch
    const handleBlur = () => {
      Object.keys(keysPressed.current).forEach((k) => {
        keysPressed.current[k] = false;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Frame loop for movement update
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const speed = 3.6; // Walking speed m/s

    const moveForward = keysPressed.current.w || keysPressed.current.ArrowUp ? 1 : 0;
    const moveBackward = keysPressed.current.s || keysPressed.current.ArrowDown ? 1 : 0;
    const moveLeft = keysPressed.current.a || keysPressed.current.ArrowLeft ? 1 : 0;
    const moveRight = keysPressed.current.d || keysPressed.current.ArrowRight ? 1 : 0;

    const inputY = moveForward - moveBackward;
    const inputX = moveRight - moveLeft;

    if (inputX !== 0 || inputY !== 0) {
      // Forward vector on X-Z plane
      const forwardX = -Math.sin(yaw.current);
      const forwardZ = -Math.cos(yaw.current);

      // Right vector on X-Z plane
      const rightX = Math.cos(yaw.current);
      const rightZ = -Math.sin(yaw.current);

      // Combine directions
      let dx = forwardX * inputY + rightX * inputX;
      let dz = forwardZ * inputY + rightZ * inputX;

      const len = Math.hypot(dx, dz);
      if (len > 0.001) {
        dx = (dx / len) * speed * dt;
        dz = (dz / len) * speed * dt;

        playerPos.current.x += dx;
        playerPos.current.z += dz;

        // Clamp inside property boundary
        if (mode === "customization") {
          playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -3.7, 3.7);
          playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, -5.0, 5.0);
        } else {
          playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -4.1, 4.1);
          playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, -5.9, 7.6);
        }
      }
    }

    // Strictly enforce fixed eye-level walking height
    playerPos.current.y = 1.6;

    camera.position.copy(playerPos.current);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return null;
}
