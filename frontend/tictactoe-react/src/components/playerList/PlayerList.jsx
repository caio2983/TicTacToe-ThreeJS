import React from "react";
import PlayerCard from "./playerCard";

export default function PlayerList({ players }) {
  return (
    <div className="floating-rectangle">
      <span className="player-list-container-title">Jogadores conectados</span>
      <div className="component-overlay"></div>
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
