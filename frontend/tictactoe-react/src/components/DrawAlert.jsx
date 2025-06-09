import React from "react";

export default function DrawAlert({ onReset }) {
  return (
    <div className="victory-alert">
      Empate
      <button onClick={onReset}>Jogar Novamente</button>
    </div>
  );
}
