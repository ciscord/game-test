const socket = io("http://localhost");

let mode = false; // mode:true is human vs human. mode:false is human vs computer
let myName = "";  // my name variable

let playerPoints = 0; // my score
let computerPoints = 0; // computer or human score

//listen server event
socket.on("updateGame", (players) => updatePlayers(players));

function updatePlayers(players) {

  if (mode === true && players.length === 2) {// we only support two players mode
    OtherPlayer.innerHTML = players.filter(
      (el) => el.id !== socket.id
    )[0].name;
    const theWinner = playRound(
      players.filter((el) => el.id === socket.id)[0].rps,
      players.filter((el) => el.id !== socket.id)[0].rps
    );
    drawWiner(theWinner);
  } else if (mode === true && players.length > 2) {
    console.log(
      "does not support more than two players. Please disconnect"
    );
  } else if (mode === true && players.length === 1) {
    OtherPlayer.innerHTML = "Wait";
  }
}

function playRound(playerSelection, computerSelection) {
  if (mode && (playerSelection === "none")) {
    //You need to choice.
    return 0;
  }
  if (mode && (computerSelection === "none")) {
    //need to wait other's choice.
    return 3;
  }
  socket.emit("reset"); //reset all user's choice
  if (playerSelection === computerSelection) return -1; //draw
  if (
    (playerSelection === "Rock" && computerSelection === "Scissor") ||
    (playerSelection === "Paper" && computerSelection === "Rock") ||
    (playerSelection === "Scissor" && computerSelection === "Paper")
  ) {
    return 1; // win
  } else {
    return 2; // lose
  }
}

// computer choice - random
function computerChoiche() {
  const possibileChoiche = ["Rock", "Paper", "Scissor"];
  const randomChoice = Math.floor(Math.random() * possibileChoiche.length);
  return possibileChoiche[randomChoice];
}

// show winer, fail, draw, other's choice, your select
function drawWiner(theWinner) {
  if (theWinner === 1) {
    playerPoints++;
    playerPointsEl.innerText = playerPoints;
    showStatusEl.innerText = `You beats ${mode ? "other" : "computer"}`;
  } else if (theWinner === 2) {
    computerPoints++;
    computerPointsEl.innerText = computerPoints;
    showStatusEl.innerText = `${mode ? "Other" : "Computer"} beats you`;
  } else if (theWinner === -1) {
    showStatusEl.innerText = `Draw`;
  } else if (theWinner === 3) {
    showStatusEl.innerText = `Wait Other's choice.`;
  } else if (theWinner === 0) {
    showStatusEl.innerText = `You need to select`;
  }
}
// restart a new game
function newGame() {
  playerPointsEl.innerText = "0";
  computerPointsEl.innerText = "0";
  playerPoints = 0;
  computerPoints = 0;

}

// Main function
function startGame() {
  for (btn of btnChoicheEl) {
    btn.addEventListener("click", (e) => {

      // send command to server
      socket.emit("command", {
        id: socket.id,
        rps: e.target.name,
        name: myName,
      });

      if (!mode) {
        // computer mode
        let currentPlayerChoiche = e.target.name;
        let currentComputerChoiche = computerChoiche();
        const theWinner = playRound(
          currentPlayerChoiche,
          currentComputerChoiche
        );
        drawWiner(theWinner);
      }
    });
  }


  // computer mode
  optComputer.addEventListener("click", (e) => {
    optComputer.checked = true;
    mode = false;
    OtherPlayer.innerHTML = "Computer";
    newGame();
  });

  // human vs human mode
  optHuman.addEventListener("click", (e) => {
    optHuman.checked = true;
    mode = true;
    OtherPlayer.innerHTML = "Wait";
    socket.emit("command", { id: socket.id, rps: "none", name: myName });
    newGame();
  });

  // change name
  nameField.addEventListener("change", (e) => {
    myName = e.target.value;
    socket.emit("command", { id: socket.id, rps: "none", name: myName });
  });


}

// Init the game
const btnChoicheEl = document.querySelectorAll(".btn-choiche");
const playerPointsEl = document.querySelector(".player-points");
const computerPointsEl = document.querySelector(".computer-points");
const showStatusEl = document.querySelector(".show-status");
const OtherPlayer = document.querySelector(".computer-choiche");
const optComputer = document.querySelector("#computer");
const optHuman = document.querySelector("#human");
const nameField = document.querySelector("#name");

startGame();
