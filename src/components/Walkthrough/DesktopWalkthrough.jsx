import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function DesktopWalkthrough() {
  const { camera, gl } = useThree();

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

  // Initialize camera position near the main entrance
  useEffect(() => {
    playerPos.current.set(2.4, 1.6, 7.2);
    yaw.current = Math.PI;
    pitch.current = 0;
    camera.position.copy(playerPos.current);
    camera.rotation.set(0, Math.PI, 0, "YXZ");
  }, [camera]);

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
    };
  }, [gl]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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
        playerPos.current.x = Math.max(-4.1, Math.min(4.1, playerPos.current.x));
        playerPos.current.z = Math.max(-5.9, Math.min(7.6, playerPos.current.z));
      }
    }

    // Strictly enforce fixed eye-level walking height
    playerPos.current.y = 1.6;

    camera.position.copy(playerPos.current);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return null;
}
