const serverUrl = 'wss://nosch.uber.space/web-rooms/';
const roomId = 'musikspiel-interaktiv';
let socket;

// Spieler-Infos
let clientId = null;
let clientList = [];
let currentTurnIndex = 0;
let isMyTurn = false;

// Noten
const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];

// HTML-Elemente
const statusDisplay = document.getElementById('player-status');

function connectToWebRooms() {
  socket = new WebSocket(serverUrl + roomId);

  socket.onopen = () => {
    console.log("✅ Verbunden mit WebRooms");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
      clientId = data.clientId;
      console.log("🆔 Deine Client-ID:", clientId);
    }

    if (data.type === 'clientList') {
      clientList = data.clients;
      updateStatus();
    }

    if (data.type === 'turn') {
      currentTurnIndex = data.index;
      updateStatus();
    }

    if (data.type === 'notePlayed') {
      highlightNote(data.note);
    }
  };

  socket.onclose = () => {
    statusDisplay.innerText = "❌ Verbindung getrennt.";
  };
}

function updateStatus() {
  const myIndex = clientList.indexOf(clientId);
  const total = clientList.length;

  if (myIndex === -1) {
    statusDisplay.innerText = "❌ Du bist nicht mehr verbunden.";
    return;
  }

  isMyTurn = (myIndex === currentTurnIndex);

  statusDisplay.innerText =
    `👤 Du bist Spieler ${myIndex + 1}/${total}` +
    (isMyTurn ? " – ✅ Du bist jetzt dran!" : " – ⏳ Bitte warte ...");
}

function playNote(note) {
  if (!isMyTurn) return;

  const audio = new Audio(`notes/${note}.mp3`);
  audio.play();

  // An andere Spieler senden
  socket.send(JSON.stringify({
    type: 'notePlayed',
    note: note
  }));

  // Nächster Spieler ist dran
  const nextIndex = (currentTurnIndex + 1) % clientList.length;
  socket.send(JSON.stringify({
    type: 'turn',
    index: nextIndex
  }));
}

function highlightNote(note) {
  const button = document.getElementById(`btn-${note}`);
  if (!button) return;

  button.classList.remove('clicked');
  void button.offsetWidth;
  button.classList.add('clicked');

  const audio = new Audio(`notes/${note}.mp3`);
  audio.play();
}

function startSong() {
  alert("Los geht's!");
  if (clientList[0] === clientId) {
    // Host startet den ersten Zug
    socket.send(JSON.stringify({
      type: 'turn',
      index: 0
    }));
  }
}

connectToWebRooms();
