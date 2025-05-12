// ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let ledState = 'off';

wss.on('connection', function connection(ws) {
  console.log('ESP32 connected');

  // Send initial state
  ws.send(ledState);

  // Receive message from client
  ws.on('message', function incoming(message) {
    console.log('Received from ESP32:', message);
  });
});

// Optional: change LED state manually from this file
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question('Set LED state (on/off): ', (input) => {
    ledState = input;
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(ledState);
      }
    });
    prompt();
  });
}
prompt();
