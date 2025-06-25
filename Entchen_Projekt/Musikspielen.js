let noteCount = 0;

function updateCounterDisplay() {
  const counter = document.getElementById('note-counter');
  const gameOverText = document.getElementById('game-over');
  const restartBtn = document.getElementById('restart-button');

  if (counter) {
    counter.innerText = `🎶 Gespielte Töne (von 27): ${noteCount}`;
  }

  if (noteCount > 27) {
    if (gameOverText) gameOverText.innerText = "🎉 Game Over!";
    if (restartBtn) restartBtn.style.display = 'inline-block';
  } else {
    if (gameOverText) gameOverText.innerText = "";
    if (restartBtn) restartBtn.style.display = 'none';
  }
}

const serverUrl = 'wss://nosch.uber.space/web-rooms/';
const roomId = 'musikspiel-uni-demo';
let socket;

function connectToWebRooms() {
  socket = new WebSocket(serverUrl + roomId);

  socket.onopen = () => {
    console.log("🔌 Verbunden mit WebRooms");
    updateCounterDisplay();
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.note) {
      playRemoteNote(message.note);
    }
  };

  socket.onclose = () => {
    console.log("❌ Verbindung getrennt");
  };
}

function sendNote(note) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ note }));
  }
}

function playNote(note, buttonElement) {
  const audio = new Audio(`notes/${note}.mp3`);
  audio.play();

  buttonElement.classList.remove('clicked');
  void buttonElement.offsetWidth;
  buttonElement.classList.add('clicked');

  sendNote(note);

  noteCount++;
  updateCounterDisplay();
}

function playRemoteNote(note) {
  const btn = document.querySelector(`button[onclick*="${note}"]`);
  if (btn) {
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');

    const audio = new Audio(`notes/${note}.mp3`);
    audio.play();
  }

  noteCount++;
  updateCounterDisplay();
}

function restartGame() {
  noteCount = 0;
  updateCounterDisplay();
}

function startSong() {
  alert("Spielt zusammen das Lied ohne Fehler!");
}

connectToWebRooms();

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  // Ton empfangen
  if (message.note) {
    playRemoteNote(message.note);
  }

  // Spielerzahl empfangen
  if (message.system === "clients" && message.count !== undefined) {
    const playerCountElem = document.getElementById("player-count");
    if (playerCountElem) {
      playerCountElem.innerText = `👥 Verbundene Spieler: ${message.count}`;
    }
  }
};



