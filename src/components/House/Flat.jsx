import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useCustomization } from "../../state/customization";
import { TAP_THRESHOLD } from "../Walkthrough/mobileInput";
import { clickArbiter } from "../../utils/clickArbiter";

/**
 * Procedural 3D Furniture Items
 * Provides clean, lightweight, realistic placeholders until custom GLTF assets are supplied.
 */
function FurnitureItem({ item, isSelected, onSelect }) {
  const { position, rotation, scale, color, type } = item;

  const pointerStart = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);

  const handlePointerDown = (e) => {
    e.stopPropagation();

    pointerStart.current = {
      x: e.clientX,
      y: e.clientY,
    };

    dragged.current = false;
  };

  const handlePointerMove = (e) => {
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;

    if (Math.hypot(dx, dy) > TAP_THRESHOLD) {
      dragged.current = true;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // A camera-look drag must never select furniture.
    if (dragged.current) return;

    // Defer selection so a quick double-click can cancel it via the arbiter.
    clickArbiter.scheduleWallSelection(() => onSelect(item.id));
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {/* Selection Highlight Ring */}
      {isSelected && (
        <mesh
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.9, 1.05, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {type === "sofa" && (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.35, 0.85]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>

          <mesh position={[-0.48, 0.45, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.15, 0.7]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>

          <mesh position={[0.48, 0.45, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.15, 0.7]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>

          <mesh position={[0, 0.65, -0.35]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.55, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>

          <mesh position={[-0.95, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.4, 0.85]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>

          <mesh position={[0.95, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.4, 0.85]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>

          {[-0.85, 0.85].map((x) =>
            [-0.3, 0.3].map((z) => (
              <mesh
                key={`leg_${x}_${z}`}
                position={[x, 0.05, z]}
                castShadow
              >
                <cylinderGeometry args={[0.03, 0.02, 0.1, 16]} />
                <meshStandardMaterial
                  color="#4A3728"
                  roughness={0.5}
                />
              </mesh>
            ))
          )}
        </group>
      )}

      {type === "dining_table" && (
        <group>
          <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.05, 0.95]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
            />
          </mesh>

          {[-0.75, 0.75].map((x) =>
            [-0.4, 0.4].map((z) => (
              <mesh
                key={`tbl_leg_${x}_${z}`}
                position={[x, 0.35, z]}
                castShadow
              >
                <cylinderGeometry
                  args={[0.03, 0.025, 0.7, 16]}
                />
                <meshStandardMaterial
                  color="#1a1a1a"
                  roughness={0.3}
                  metalness={0.2}
                />
              </mesh>
            ))
          )}

          {[-0.45, 0.45].map((x) => (
            <group
              key={`chair_front_${x}`}
              position={[x, 0, 0.65]}
            >
              <mesh
                position={[0, 0.45, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.42, 0.04, 0.42]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.7}
                />
              </mesh>

              <mesh
                position={[0, 0.75, 0.18]}
                castShadow
              >
                <boxGeometry args={[0.42, 0.55, 0.04]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.7}
                />
              </mesh>

              {[-0.18, 0.18].map((cx) =>
                [-0.18, 0.18].map((cz) => (
                  <mesh
                    key={`chair_leg_${cx}_${cz}`}
                    position={[cx, 0.22, cz]}
                    castShadow
                  >
                    <cylinderGeometry
                      args={[0.015, 0.012, 0.44, 12]}
                    />
                    <meshStandardMaterial
                      color="#1a1a1a"
                      roughness={0.4}
                    />
                  </mesh>
                ))
              )}
            </group>
          ))}

          {[-0.45, 0.45].map((x) => (
            <group
              key={`chair_back_${x}`}
              position={[x, 0, -0.65]}
              rotation={[0, Math.PI, 0]}
            >
              <mesh
                position={[0, 0.45, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.42, 0.04, 0.42]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.7}
                />
              </mesh>

              <mesh
                position={[0, 0.75, 0.18]}
                castShadow
              >
                <boxGeometry args={[0.42, 0.55, 0.04]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.7}
                />
              </mesh>

              {[-0.18, 0.18].map((cx) =>
                [-0.18, 0.18].map((cz) => (
                  <mesh
                    key={`chair_leg_b_${cx}_${cz}`}
                    position={[cx, 0.22, cz]}
                    castShadow
                  >
                    <cylinderGeometry
                      args={[0.015, 0.012, 0.44, 12]}
                    />
                    <meshStandardMaterial
                      color="#1a1a1a"
                      roughness={0.4}
                    />
                  </mesh>
                ))
              )}
            </group>
          ))}
        </group>
      )}

      {type === "bed" && (
        <group>
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.25, 2.1]} />
            <meshStandardMaterial
              color="#2d2d2d"
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 0.42, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[1.75, 0.26, 1.95]} />
            <meshStandardMaterial
              color={color}
              roughness={0.8}
            />
          </mesh>

          <mesh position={[0, 0.75, -1.0]} castShadow>
            <boxGeometry args={[1.9, 0.9, 0.12]} />
            <meshStandardMaterial
              color="#2d2d2d"
              roughness={0.6}
            />
          </mesh>

          {[-0.45, 0.45].map((x) => (
            <mesh
              key={`pillow_${x}`}
              position={[x, 0.58, -0.65]}
              rotation={[-0.2, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.6, 0.12, 0.4]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.9}
              />
            </mesh>
          ))}

          <mesh
            position={[0, 0.56, 0.25]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.78, 0.05, 1.4]} />
            <meshStandardMaterial
              color="#4A5568"
              roughness={0.7}
            />
          </mesh>
        </group>
      )}

      {type === "coffee_table" && (
        <group>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map(
            (angle, idx) => {
              const legX = Math.sin(angle) * 0.35;
              const legZ = Math.cos(angle) * 0.35;

              return (
                <mesh
                  key={`ctl_${idx}`}
                  position={[legX, 0.18, legZ]}
                  castShadow
                >
                  <cylinderGeometry
                    args={[0.018, 0.014, 0.36, 16]}
                  />
                  <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.4}
                    metalness={0.2}
                  />
                </mesh>
              );
            }
          )}
        </group>
      )}

      {type === "armchair" && (
        <group>
          <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.25, 0.75]} />
            <meshStandardMaterial
              color={color}
              roughness={0.75}
            />
          </mesh>

          <mesh position={[0, 0.65, -0.3]} castShadow>
            <boxGeometry args={[0.75, 0.45, 0.15]} />
            <meshStandardMaterial
              color={color}
              roughness={0.75}
            />
          </mesh>

          {[-0.35, 0.35].map((x) => (
            <mesh
              key={`arm_${x}`}
              position={[x, 0.5, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.12, 0.32, 0.7]} />
              <meshStandardMaterial
                color={color}
                roughness={0.75}
              />
            </mesh>
          ))}

          {[-0.28, 0.28].map((x) =>
            [-0.28, 0.28].map((z) => (
              <mesh
                key={`ac_leg_${x}_${z}`}
                position={[x, 0.1, z]}
                castShadow
              >
                <cylinderGeometry
                  args={[0.02, 0.015, 0.2, 16]}
                />
                <meshStandardMaterial
                  color="#332211"
                  roughness={0.5}
                />
              </mesh>
            ))
          )}
        </group>
      )}

      {type === "indoor_plant" && (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <cylinderGeometry
              args={[0.22, 0.16, 0.44, 24]}
            />
            <meshStandardMaterial
              color="#E2E8F0"
              roughness={0.4}
            />
          </mesh>

          <mesh position={[0, 0.43, 0]}>
            <cylinderGeometry
              args={[0.2, 0.2, 0.03, 24]}
            />
            <meshStandardMaterial
              color="#2d1e18"
              roughness={0.9}
            />
          </mesh>

          {[0, 1, 2, 3, 4].map((i) => {
            const leafAngle =
              (i * Math.PI * 2) / 5;

            const lx =
              Math.sin(leafAngle) * 0.25;

            const lz =
              Math.cos(leafAngle) * 0.25;

            return (
              <group
                key={`plant_leaf_${i}`}
                position={[0, 0.44, 0]}
                rotation={[0.2, leafAngle, 0]}
              >
                <mesh
                  position={[
                    lx,
                    0.35 + i * 0.08,
                    lz,
                  ]}
                  rotation={[0.3, 0, 0.2]}
                  castShadow
                >
                  <sphereGeometry
                    args={[0.16, 16, 16]}
                  />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.6}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

/**
 * Flat Component
 *
 * Loads /models/flat.glb, prepares individual wall materials,
 * and applies shared customization.
 */
export default function Flat() {
  const { scene } = useGLTF("/models/flat.glb");

  const {
    wallColors,
    selectedWall,
    selectWall,
    wallFinish,
    furniture,
    selectedFurnitureId,
    selectFurniture,
  } = useCustomization();

  // Clone scene once to avoid mutating cached GLTF.
  const { clonedScene, originalMaterials } = useMemo(() => {
    const clone = scene.clone(true);
    const origMap = new Map();

    clone.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        origMap.set(
          child.name,
          child.material.clone()
        );

        child.material =
          child.material.clone();
      }

      const isWall =
        child.name.startsWith("backFace") ||
        child.name.startsWith("frontFace") ||
        child.name.startsWith("soul") ||
        child.name
          .toLowerCase()
          .includes("wall");

      child.userData.isWall = isWall;
    });

    return {
      clonedScene: clone,
      originalMaterials: origMap,
    };
  }, [scene]);

  // Apply wall customization.
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (
        !child.isMesh ||
        !child.userData.isWall ||
        !child.material
      ) {
        return;
      }

      const customColor =
        wallColors[child.name] ||
        wallColors.__all__;

      const originalMat =
        originalMaterials.get(child.name);

      if (customColor) {
        child.material.color.set(
          customColor.hex ||
            customColor.color ||
            "#ffffff"
        );

        if (wallFinish === "gloss") {
          child.material.roughness = 0.25;
          child.material.metalness = 0.1;
        } else if (wallFinish === "satin") {
          child.material.roughness = 0.55;
          child.material.metalness = 0.05;
        } else {
          child.material.roughness =
            customColor.roughness ?? 0.85;

          child.material.metalness =
            customColor.metalness ?? 0.0;
        }
      } else if (originalMat) {
        child.material.color.copy(
          originalMat.color
        );

        child.material.roughness =
          originalMat.roughness;

        child.material.metalness =
          originalMat.metalness;
      }

      // Selection highlight.
      if (selectedWall === child.name) {
        child.material.emissive =
          new THREE.Color("#38bdf8");

        child.material.emissiveIntensity = 0.25;
      } else {
        child.material.emissive =
          new THREE.Color(0x000000);

        child.material.emissiveIntensity = 0;
      }

      child.material.needsUpdate = true;
    });
  }, [
    clonedScene,
    originalMaterials,
    wallColors,
    selectedWall,
    wallFinish,
  ]);

  // ------------------------------------------------------------
  // WALL TAP / DRAG DISCRIMINATION
  // ------------------------------------------------------------

  const wallPointerStart = useRef({
    x: 0,
    y: 0,
  });

  const wallPointerMoved = useRef(false);

  const findWallMesh = (object) => {
    let current = object;

    while (current) {
      if (
        current.isMesh &&
        current.userData?.isWall
      ) {
        return current;
      }

      current = current.parent;
    }

    return null;
  };

  const handlePointerDown = (e) => {
    const wall = findWallMesh(e.object);

    if (!wall) return;

    wallPointerStart.current = {
      x: e.clientX,
      y: e.clientY,
    };

    wallPointerMoved.current = false;
  };

  const handlePointerMove = (e) => {
    const wall = findWallMesh(e.object);

    if (!wall) return;

    const dx =
      e.clientX -
      wallPointerStart.current.x;

    const dy =
      e.clientY -
      wallPointerStart.current.y;

    if (
      Math.hypot(dx, dy) >
      TAP_THRESHOLD
    ) {
      wallPointerMoved.current = true;
    }
  };

  const handlePointerUp = (e) => {
    const wall = findWallMesh(e.object);

    if (!wall) return;

    if (wallPointerMoved.current) {
      return;
    }

    e.stopPropagation();

    // Defer selection so a quick double-click can cancel it via the arbiter.
    clickArbiter.scheduleWallSelection(() => selectWall(wall.name));

    wallPointerMoved.current = false;
  };

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive object={clonedScene} />

      {/* Shared Furniture Instances */}
      {furniture.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          isSelected={
            selectedFurnitureId === item.id
          }
          onSelect={selectFurniture}
        />
      ))}
    </group>
  );
}

useGLTF.preload("/models/flat.glb");
