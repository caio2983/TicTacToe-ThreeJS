import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function OPiece({ x, z, color, notSelected, won }) {
  const meshRef = useRef();

  useFrame(() => {
    if (won && meshRef.current) {
      meshRef.current.rotation.y += 0.03;
    }
  });

  const initialRotation = won ? [0, 0, 0] : [-Math.PI / 2, 0, 0];

  return (
    <mesh ref={meshRef} position={[x, 0.08, z]} rotation={initialRotation}>
      <torusGeometry args={[0.35, 0.08, 16, 100]} />
      <meshStandardMaterial
        color={color}
        opacity={notSelected ? 0.5 : 1}
        transparent={notSelected}
      />
    </mesh>
  );
}
