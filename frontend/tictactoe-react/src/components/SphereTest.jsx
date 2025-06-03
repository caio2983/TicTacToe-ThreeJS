import React from "react";

export default function SphereTest({ x, z }) {
  return (
    <mesh position={[x, 1.25, z]}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial color="orange" opacity={0.5} transparent={true} />
    </mesh>
  );
}
