import React from "react";
import * as THREE from "three";
import GameComponent from "./components/GameComponent";

export default function App() {
  return (
    <div className="main-container">
      <div className="canvas-wrapper">
        <GameComponent></GameComponent>
      </div>
    </div>
  );
}
