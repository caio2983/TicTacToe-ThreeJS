import React from "react";

export default function OPiece({ x, z, color, notSelected }) {
  return (
    <mesh position={[x, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.08, 16, 100]} />
      <meshStandardMaterial
        color={color}
        opacity={notSelected ? 0.5 : 1}
        transparent={notSelected}
      />
    </mesh>
  );
}
