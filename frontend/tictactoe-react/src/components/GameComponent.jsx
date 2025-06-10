import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import VictoryAlert from "./alerts/VictoryAlert";

import { io } from "socket.io-client";
import DrawAlert from "./alerts/DrawAlert";
import OPiece from "./pieces/OPiece";
import XPiece from "./pieces/XPiece";
import { InfiniteGridHelper } from "./grid";
import NeonRedGrid3x3 from "./NeonRedGrid3x3";
import PlayerList from "./PlayerList";
import WaitAlert from "./alerts/WaitAlert";

export default function GameComponent() {
  const [x, setX] = useState(0);
  const [z, setZ] = useState(0);

  const [isVictory, setVictory] = useState(false);
  const [isDraw, setDraw] = useState(false);
  const [winner, setWinner] = useState(null);
  const [players, setPlayers] = useState(null);

  const infiniteGridHelper = new InfiniteGridHelper();
  infiniteGridHelper.position.y = -5;

  const [role, setRole] = useState("");

  const [board, setBoard] = useState({
    default: {
      moves_X: [],
      moves_O: [],
      turn: "X",
      victory: false,
      draw: false,
      winner: null,
    },
  });

  const socketRef = useRef(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("playerRole");
    socketRef.current = io("http://localhost:3000", {
      auth: {
        role: storedRole || null,
      },
    });

    socketRef.current.on("assignedRole", (role) => {
      console.log("roleeeee", role);
      setRole(role);
    });

    socketRef.current.on("state", (state) => {
      setBoard(state);
      console.log("state", state);
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado com ID:", socketRef.current.id);
    });

    socketRef.current.on("connectedPlayers", (players) => {
      setPlayers(players);
    });

    socketRef.current.on("makeMove", (currentBoard) => {
      console.log(currentBoard);
      setBoard(currentBoard);
      setVictory(currentBoard.default.victory);
      setWinner(currentBoard.default.winner);
      setDraw(currentBoard.default.draw);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  function isOccupied(x, z, currentBoard) {
    const taken = [
      ...currentBoard.default.moves_X,
      ...currentBoard.default.moves_O,
    ];
    return taken.some(
      ([occupied_x, occupied_z]) => occupied_x === x && occupied_z === z
    );
  }

  // The function below is executed when the user clicks the button in VictoryAlert component
  function resetGame() {
    setBoard({
      default: {
        moves_X: [],
        moves_O: [],
        turn: "X",
        victory: false,
        draw: false,
        winner: null,
      },
    });

    setVictory(false);
    setDraw(false);

    socketRef.current.emit("resetBoard");
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case "a":
          setX((prev) => (prev - 1 < -1 ? 1 : prev - 1));
          break;
        case "d":
          setX((prev) => (prev + 1 > 1 ? -1 : prev + 1));
          break;
        case "w":
          setZ((prev) => (prev - 1 < -1 ? 1 : prev - 1));
          break;
        case "s":
          setZ((prev) => (prev + 1 > 1 ? -1 : prev + 1));
          break;
        case " ":
          if (
            isVictory ||
            role !== board.default.turn ||
            isOccupied(x, z, board)
          )
            return;

          socketRef.current.emit("makeMove", [x, z]);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [x, z, isVictory]);

  return (
    <>
      {isVictory && <VictoryAlert onReset={resetGame} winner={winner} />}

      {isDraw && <DrawAlert onReset={resetGame}></DrawAlert>}
      <Canvas camera={{ position: [2, 2, 2], fov: 85 }} className="canvas">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {role === board.default.turn ? (
          role === "O" ? (
            <OPiece x={x} z={z} color="#FFF700" notSelected={true} />
          ) : (
            <XPiece x={x} z={z} color="#FFF700" notSelected={true}></XPiece>
          )
        ) : null}

        {board.default.moves_O?.map((position, index) => (
          <>
            <OPiece
              key={index}
              x={position[0]}
              z={position[1]}
              color="#39FF14"
            />
          </>
        ))}

        {board.default.moves_X?.map((position, index) => (
          <>
            <XPiece
              key={index}
              x={position[0]}
              z={position[1]}
              color="#9B30FF"
            ></XPiece>
          </>
        ))}

        <primitive object={new THREE.AxesHelper(0)} />

        <NeonRedGrid3x3></NeonRedGrid3x3>
        <primitive object={infiniteGridHelper} />
        <OrbitControls enabled={!isVictory} />
      </Canvas>

      {players && <PlayerList players={players}></PlayerList>}

      {role !== board.default.turn && (
        <WaitAlert playing={board.default.turn}></WaitAlert>
      )}
    </>
  );
}
