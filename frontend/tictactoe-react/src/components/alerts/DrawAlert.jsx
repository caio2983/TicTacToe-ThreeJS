import React from "react";

export default function DrawAlert({ onReset }) {
  return (
    <div className="draw-alert">
      <div className="draw-alert-inside">
        <span className="draw-text">Empate</span>
        <button onClick={onReset}>Jogar Novamente</button>
      </div>
    </div>
  );
}
