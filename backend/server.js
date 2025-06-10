const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

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

function checkGroup(group, playerMoves) {
  return (
    group.length > 0 &&
    group.every((pos) =>
      playerMoves.some((move) => move[0] === pos.x && move[1] === pos.z)
    )
  );
}

function victoryCheck([x, z], playerMoves) {
  const { diagonals, rows, columns } = victoryPositions(x, z);

  if (
    checkGroup(diagonals, playerMoves) ||
    checkGroup(rows, playerMoves) ||
    checkGroup(columns, playerMoves)
  ) {
    return true;
  }

  return false;
}

const EMPTY_BOARD = () => ({
  moves_X: [],
  moves_O: [],

  turn: "X",
  victory: false,
  draw: false,
  winner: null,
});

const players = [];
const playerMoves = new Map();
const boards = new Map();

io.on("connection", (socket) => {
  const room = "default";
  if (!boards.has(room)) boards.set(room, EMPTY_BOARD());
  socket.join(room);

  if (players.length < 2) {
    const role = players.length === 1 ? "X" : "O";
    players.push({ id: socket.id, role: role });

    socket.emit("assignedRole", role);
    console.log(`Jogador ${role} conectado: ${socket.id}`);
  } else {
    socket.emit("roomFull");
    socket.disconnect(true);
    return;
  }

  io.emit("connectedPlayers", players);

  socket.on("makeMove", (data) => {
    const player_who_moved = players.find((player) => player.id === socket.id);
    const current_board = boards.get("default");

    if (!player_who_moved || current_board.victory) return;

    const { role } = player_who_moved;
    const move = data; // data = [x, z]

    if (role === "X") {
      current_board.moves_X.push(move);
      current_board.turn = "O";

      if (victoryCheck(move, current_board.moves_X)) {
        current_board.victory = true;
        current_board.winner = "X";
        console.log("Vitória do jogador X");
      }
    } else {
      current_board.moves_O.push(move);
      current_board.turn = "X";

      if (victoryCheck(move, current_board.moves_O)) {
        current_board.victory = true;
        current_board.winner = "O";
        console.log("Vitória do jogador O");
      }

      console.log("O length: ", current_board.moves_O.length);
      console.log("X length: ", current_board.moves_X.length);

      if (current_board.moves_O.length + current_board.moves_X.length == 9) {
        current_board.draw = true;
        console.log("Empate");
      }
    }

    io.emit("makeMove", Object.fromEntries(boards));
  });

  socket.on("disconnect", () => {
    console.log("Cliente saiu:", socket.id);
  });

  socket.on("resetBoard", () => {
    boards.set("default", EMPTY_BOARD());
    io.emit("makeMove", Object.fromEntries(boards));
    console.log("board reseted by client:", socket.id);
  });
});

app.get("/", (_, res) => res.send("Servidor Socket.IO rodando!"));

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor escutando em http://localhost:${PORT}`);
});
