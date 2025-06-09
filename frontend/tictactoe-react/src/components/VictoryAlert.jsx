import { Canvas } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import XPiece from "./pieces/XPiece";
import OPiece from "./pieces/OPiece";

export default function VictoryAlert({ onReset, winner }) {
  return (
    <div className="victory-alert">
      <div className="victory-alert-overlay"></div>

      <div className="victory-alert-inside">
        <span className="winner-text">Vencedor : </span>
        <div className="canvas-small">
          <Canvas
            camera={{ position: [1, 1, 1], fov: winner === "O" ? 40 : 50 }}
          >
            <ambientLight intensity={0.5} />

            <directionalLight position={[0, 1, 1]} intensity={1} />
            {winner == "O" ? (
              <OPiece x={0} z={0} y={0} color="red" won={true}></OPiece>
            ) : (
              <XPiece x={0} z={0} y={0} color="red" won={true}></XPiece>
            )}
          </Canvas>
        </div>
        <button onClick={onReset}>Jogar Novamente</button>
      </div>
    </div>
  );
}
