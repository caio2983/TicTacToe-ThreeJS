import { Canvas } from "@react-three/fiber";
import React from "react";
import OPiece from "../pieces/OPiece";
import XPiece from "../pieces/XPiece";

export default function PlayerCard({ player }) {
  return (
    <div className="player-card">
      <div className="canvas-connected-wrapper">
        <Canvas
          camera={{ position: [1, 1, 1], fov: player.role === "O" ? 40 : 35 }}
        >
          <ambientLight intensity={0.5} />

          <directionalLight position={[0, 1, 1]} intensity={1} />
          {player.role == "O" ? (
            <OPiece x={0} z={0} y={-0.05} color="#39FF14" won={false}></OPiece>
          ) : (
            <XPiece x={0} z={0} y={-0.05} color="#9B30FF" won={false}></XPiece>
          )}
        </Canvas>
      </div>

      <span
        className="text-low-shadow"
        style={{
          color: player.role === "O" ? "#39FF14" : "#9B30FF",
          textShadow:
            player.role === "O"
              ? "0 0 0.5px #39FF14, 0 0 1px #39FF14"
              : "0 0 0.5px #9B30FF, 0 0 1px #9B30FF",
        }}
      >
        {player.id}
      </span>
    </div>
  );
}
