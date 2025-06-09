import React, { useMemo } from "react";
import * as THREE from "three";

export default function NeonRedGrid3x3() {
  const gridHelper = useMemo(() => {
    const neonRed = new THREE.Color("#FF073A");
    return new THREE.GridHelper(3, 3, neonRed, neonRed);
  }, []);

  return <primitive object={gridHelper} />;
}
