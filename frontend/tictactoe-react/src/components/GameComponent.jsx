import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Box from "./Box";
import BoxSelected from "./BoxSelected";

import VictoryAlert from "./VictoryAlert";

import { io } from "socket.io-client";
import DrawAlert from "./DrawAlert";
import OPiece from "./pieces/OPiece";
import XPiece from "./pieces/XPiece";

export default function GameComponent() {
  const [x, setX] = useState(0);
  const [z, setZ] = useState(0);

  const [role, setRole] = useState("");

  const [board, setBoard] = useState({
    default: {
      moves_X: [],
      moves_O: [],
      turn: "X",
      victory: false,
      draw: false,
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

    socketRef.current.on("makeMove", (currentBoard) => {
      console.log(currentBoard);
      setBoard(currentBoard);
      setVictory(currentBoard.default.victory);
      if (
        !board.default.victory &&
        board.default.moves_O.length + board.default.moves_X.length === 9
      ) {
        setDraw(true);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const [isVictory, setVictory] = useState(false);
  const [isDraw, setDraw] = useState(false);

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
      },
    });

    setVictory(false);
    setDraw(false);

    socketRef.current.emit("resetBoard");
  }

  function testLength() {
    console.log(board.default.moves_O.length + board.default.moves_X.length);
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
      <button onClick={resetGame}>Reset</button>
      <button onClick={testLength}>Test</button>
      {isVictory && <VictoryAlert onReset={resetGame} />}
      {isDraw && <DrawAlert onReset={resetGame}></DrawAlert>}
      <Canvas camera={{ position: [2, 2, 2], fov: 85 }} className="canvas">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {role === board.default.turn ? (
          role === "O" ? (
            <OPiece x={x} z={z} color="orange" notSelected={true} />
          ) : (
            <XPiece x={x} z={z} color="orange" notSelected={true}></XPiece>
          )
        ) : null}

        {board.default.moves_O?.map((position, index) => (
          <>
            <OPiece key={index} x={position[0]} z={position[1]} color="blue" />
          </>
        ))}

        {board.default.moves_X?.map((position, index) => (
          <>
            <XPiece
              key={index}
              x={position[0]}
              z={position[1]}
              color="red"
            ></XPiece>
          </>
        ))}

        <primitive object={new THREE.AxesHelper(0)} />
        <primitive object={new THREE.GridHelper(3, 3)} />
        <OrbitControls enabled={!isVictory} />
      </Canvas>
    </>
  );
}
