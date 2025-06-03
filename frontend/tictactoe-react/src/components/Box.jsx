import React from "react";

export default function Box({ x, z }) {
  return (
    <mesh position={[x, 0.5, z]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" opacity={0.5} transparent={true} />
    </mesh>
  );
}
