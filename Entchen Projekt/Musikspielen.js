const serverUrl = 'wss://nosch.uber.space/web-rooms/';
const roomId = 'musikspiel-uni-demo'; // beliebig, gleich für alle Teilnehmer
let socket;

function connectToWebRooms() {
  socket = new WebSocket(serverUrl + roomId);

  socket.onopen = () => {
    console.log("🔌 Verbunden mit WebRooms");
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
}

function startSong() {
  alert("Los geht's!");
}

connectToWebRooms();
