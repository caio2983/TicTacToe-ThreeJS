import React from "react";

export default function VictoryAlert({ onReset }) {
  return (
    <div className="victory-alert">
      Vitória!
      <button onClick={onReset}>Jogar Novamente</button>
    </div>
  );
}
