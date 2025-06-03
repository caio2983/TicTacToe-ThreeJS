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

const EMPTY_BOARD = () => ({
  moves: [],
  turn: "X",
  victory: false,
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

  console.log("Novo cliente conectado:", socket.id);

  socket.on("makeMove", (data) => {
    console.log("Move made by", data);
    const moveKey = data.join(",");

    player_who_moved = players.find((player) => player.id === socket.id);
    playerMoves.set(data, player_who_moved.role);
    console.log(playerMoves);

    io.emit("makeMove", Object.fromEntries(playerMoves));
  });

  socket.on("disconnect", () => {
    console.log("Cliente saiu:", socket.id);
  });
});

app.get("/", (_, res) => res.send("Servidor Socket.IO rodando!"));

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor escutando em http://localhost:${PORT}`);
});
