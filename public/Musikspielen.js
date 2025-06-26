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
    socket.send(JSON.stringify(['*enter-room*', 'Musikspielen']));
    socket.send(JSON.stringify(['*subscribe-client-count*']));
    updateCounterDisplay();
  };

  socket.onclose = () => {
    console.log("❌ Verbindung getrennt");
  };
}


function sendNote(note) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(['*broadcast-message*', { note }]));
  }
}


function playNote(note, buttonElement) {
  console.log("hier zähl ich hoch")
  const audio = new Audio(`notes/${note}.mp3`);
  audio.play();

  buttonElement.classList.remove('clicked');
  void buttonElement.offsetWidth;
  buttonElement.classList.add('clicked');

  sendNote(note);

  noteCount++;
  console.log(noteCount)
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

  //noteCount++;
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
  if (message[0] === "note") {
    playRemoteNote(message[1]);
  }
};



//broadcast 
//client count 