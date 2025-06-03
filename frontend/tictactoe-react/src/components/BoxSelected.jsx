import React from "react";

export default function BoxSelected({ x, z }) {
  return (
    <mesh position={[x, 0.5, z]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
