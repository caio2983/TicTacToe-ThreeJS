import React from "react";
import OPiece from "../pieces/OPiece";
import XPiece from "../pieces/XPiece";
import { Canvas } from "@react-three/fiber";

export default function WaitAlert({ playing }) {
  return (
    <div className="floating-rectangle wait">
      <div className="component-overlay"></div>
      <span className="waiting-text">Esperando a jogada de </span>
      <div className="canvas-connected-wrapper">
        <Canvas
          camera={{ position: [1, 1, 1], fov: playing === "O" ? 40 : 35 }}
        >
          <ambientLight intensity={0.5} />

          <directionalLight position={[0, 1, 1]} intensity={1} />
          {playing == "O" ? (
            <OPiece x={0} z={0} y={-0.05} color="#39FF14" won={false}></OPiece>
          ) : (
            <XPiece x={0} z={0} y={-0.05} color="#9B30FF" won={false}></XPiece>
          )}
        </Canvas>
      </div>
    </div>
  );
}
