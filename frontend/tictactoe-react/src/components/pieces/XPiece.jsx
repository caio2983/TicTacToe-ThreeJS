import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function XPiece({ x, z, y, color, notSelected, won }) {
  const groupRef = useRef();

  useFrame(() => {
    if (won && groupRef.current) {
      groupRef.current.rotation.y += 0.03;
    }
  });

  const initialRotation = won ? [0, 0, 0] : [-Math.PI / 2, 0, 0];

  return (
    <group
      ref={groupRef}
      position={[x, y || 0.08, z]}
      rotation={initialRotation}
    >
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial
          color={color}
          opacity={notSelected ? 0.5 : 1}
          transparent={notSelected}
        />
      </mesh>

      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial
          color={color}
          opacity={notSelected ? 0.5 : 1}
          transparent={notSelected}
        />
      </mesh>
    </group>
  );
}
