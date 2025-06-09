import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Box from "./Box";
import BoxSelected from "./BoxSelected";
import SphereTest from "./SphereTest";
import VictoryAlert from "./VictoryAlert";

import { io } from "socket.io-client";

export default function GameComponent() {
  const [x, setX] = useState(0);
  const [z, setZ] = useState(0);

  const [x_moves, set_x_moves] = useState(null);
  const [o_moves, set_o_moves] = useState(null);

  const [board, setBoard] = useState({ moves: [], turn: "X", victory: false });

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
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado com ID:", socketRef.current.id);
    });

    socketRef.current.on("makeMove", (playerMoves) => {
      console.log("Jogadas recebidas :", playerMoves);
      console.log("Jogadas recebidas keys:", Object.entries(playerMoves));
      console.log("Jogadas recebidas values:", Object.values(playerMoves));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Positions that the user selected to place a piece
  const [selectedPositions, setSelectedPositions] = useState([]);

  // The three states below are used to verify a possible victory in each piece placement
  const [testVictoryColumns, setTestVictoryColumns] = useState([]);
  const [testVictoryRows, setTestVictoryRows] = useState([]);
  const [testVictoryDiagonals, setTestVictoryDiagonals] = useState([]);

  const [isVictory, setVictory] = useState(false);

  // The function below is executed when the user clicks the button in VictoryAlert component
  function resetGame() {
    setX(0);
    setZ(0);
    setSelectedPositions([]);
    setTestVictoryColumns([]);
    setTestVictoryRows([]);
    setTestVictoryDiagonals([]);
    setVictory(false);
  }

  function checkDiagonals(x, z) {
    const rightEdges = [
      { x: 1, z: 1 },
      { x: 1, z: -1 },
    ];
    const leftEdges = [
      { x: -1, z: 1 },

      { x: -1, z: -1 },
    ];

    const isCenter = x === 0 && z === 0;
    const isLeftEdge = leftEdges.some((pos) => pos.x === x && pos.z === z);
    const isRightEdge = rightEdges.some((pos) => pos.x === x && pos.z === z);

    if (!isCenter && !isLeftEdge && !isRightEdge) return [];

    const results = [
      ...(isCenter
        ? [
            { x: -1, z: 1 },
            { x: 1, z: -1 },
            { x: -1, z: -1 },
            { x: 1, z: 1 },
          ]
        : []),
      ...(isLeftEdge
        ? [
            { x: x + 1, z: z - 1 < -1 ? z + 1 : z - 1 },
            { x: x + 2, z: z - 1 < -1 ? z + 2 : z - 2 },
          ]
        : []),
      ...(isRightEdge
        ? [
            { x: x - 1, z: z - 1 < -1 ? z + 1 : z - 1 },
            { x: x - 2, z: z - 1 < -1 ? z + 2 : z - 2 },
          ]
        : []),
    ];

    return results;
  }

  // When a player selects a position , this function returns the positions that need to be filled in order to achieve victory
  function victoryPositions(x, z) {
    const xMinus1 = x - 1 < -1 ? -1 : x - 1;
    const xPlus1 = x + 1 > 1 ? 1 : x + 1;
    const zMinus1 = z - 1 < -1 ? -1 : z - 1;
    const zPlus1 = z + 1 > 1 ? 1 : z + 1;

    const diagonals = checkDiagonals(x, z);

    const rows = [
      { x: xMinus1, z: z },
      { x: xPlus1, z: z },
      ...(x + 1 > 1 ? [{ x: xPlus1 - 2, z: z }] : []),
      ...(x - 1 < -1 ? [{ x: xPlus1 + 1, z: z }] : []),
    ];

    const columns = [
      { x: x, z: zPlus1 },
      { x: x, z: zMinus1 },
      ...(z + 1 > 1 ? [{ x: x, z: zPlus1 - 2 }] : []),
      ...(z - 1 < -1 ? [{ x: x, z: zPlus1 + 1 }] : []),
    ];

    return {
      diagonals,
      rows,
      columns,
    };
  }

  function victoryCheck() {
    const checkGroup = (group) =>
      group.length > 0 &&
      group.every((pos) =>
        selectedPositions.some(
          (selected) => selected.x === pos.x && selected.z === pos.z
        )
      );

    if (
      checkGroup(testVictoryColumns) ||
      checkGroup(testVictoryRows) ||
      checkGroup(testVictoryDiagonals)
    ) {
      console.log("Vitória!");
      setVictory(true);
    }
  }

  useEffect(() => {
    victoryCheck();
  }, [
    selectedPositions,
    testVictoryColumns,
    testVictoryRows,
    testVictoryDiagonals,
  ]);

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
          // setSelectedPositions((prev) => {
          //   const exists = prev.some((pos) => pos.x === x && pos.z === z);
          //   return exists ? prev : [...prev, { x, z }];
          // });

          socketRef.current.emit("makeMove", [x, z]);

          setTestVictoryColumns(victoryPositions(x, z).columns);
          setTestVictoryRows(victoryPositions(x, z).rows);
          setTestVictoryDiagonals(victoryPositions(x, z).diagonals);

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

        {selectedPositions.map((pos, index) => (
          <>
            <BoxSelected key={index} x={pos.x} z={pos.z} />
          </>
        ))}

        {testVictoryColumns.map((pos, index) => (
          <>
            <SphereTest key={index} x={pos.x} z={pos.z} />
          </>
        ))}

        {testVictoryRows.map((pos, index) => (
          <>
            <SphereTest key={index} x={pos.x} z={pos.z} />
          </>
        ))}

        {testVictoryDiagonals.map((pos, index) => (
          <>
            <SphereTest key={index} x={pos.x} z={pos.z} />
          </>
        ))}

        <primitive object={new THREE.AxesHelper(2)} />
        <primitive object={new THREE.GridHelper(3, 3)} />
        <OrbitControls enabled={!isVictory} />
      </Canvas>
    </>
  );
}
