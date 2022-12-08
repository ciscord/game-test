const express = require("express");

let Player = require("./Player");

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
console.log("The server is now running at http://localhost/");
app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {
  console.log(`New connection ${socket.id}`);
  if (!players.some((el) => el.id === socket.id)) {
    players.push(new Player(socket.id));
    updateGame();
  }
  socket.on("disconnect", () => {
    socket.disconnect();
    players = players.filter((player) => player.id !== socket.id);
    console.log(`Disconnected ${socket.id}`);
    updateGame();
  });

  socket.on("command", (arg) => {
    let findIndex = players.findIndex((el) => el.id === arg.id);

    players[findIndex].rps = arg.rps;
    players[findIndex].name = arg.name;

    console.log(players, "==");
    updateGame();
  });

  socket.on("reset", (arg) => {
    
    players[0].rps = 'none';
    players[1].rps = 'none';
  });
});

function updateGame() {
  io.emit(
    "updateGame",
    players.map((el) => {
      return { id: el.id, name: el.name, rps: el.rps };
    })
  );
}

server.listen(80);
