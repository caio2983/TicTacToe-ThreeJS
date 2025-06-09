import React from "react";

export default function XPiece({ x, z, color, notSelected }) {
  return (
    <group position={[x, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]}>
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
