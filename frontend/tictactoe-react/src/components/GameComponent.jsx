import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Box from "./Box";
import BoxSelected from "./BoxSelected";

import VictoryAlert from "./VictoryAlert";

import { io } from "socket.io-client";

export default function GameComponent() {
  const [x, setX] = useState(0);
  const [z, setZ] = useState(0);

  const [board, setBoard] = useState({
    default: {
      moves_X: [],
      moves_O: [],
      turn: "X",
      victory: false,
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
      localStorage.setItem("playerRole", role);
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
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const [isVictory, setVictory] = useState(false);

  // The function below is executed when the user clicks the button in VictoryAlert component
  function resetGame() {
    setBoard({
      default: {
        moves_X: [],
        moves_O: [],
        turn: "X",
        victory: false,
      },
    });

    setVictory(false);

    socketRef.current.emit("resetBoard");
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isVictory) return;
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
      {isVictory && <VictoryAlert onReset={resetGame} />}
      <Canvas camera={{ position: [2, 2, 2], fov: 85 }} className="canvas">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Box x={x} z={z} />

        {board.default.moves_O?.map((position, index) => (
          <>
            <BoxSelected
              key={index}
              x={position[0]}
              z={position[1]}
              color="blue"
            />
          </>
        ))}

        {board.default.moves_X?.map((position, index) => (
          <>
            <BoxSelected
              key={index}
              x={position[0]}
              z={position[1]}
              color="red"
            />
          </>
        ))}

        <primitive object={new THREE.AxesHelper(2)} />
        <primitive object={new THREE.GridHelper(3, 3)} />
        <OrbitControls enabled={!isVictory} />
      </Canvas>
    </>
  );
}
