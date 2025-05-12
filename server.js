const WebSocket = require('ws');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

let espSocket = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Serve the HTML file
});

wss.on('connection', (ws, req) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());

    // Handle humidity updates from ESP32
    if (message.toString().includes('humidity')) {
      // Broadcast to all browser clients
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }

    // Identify ESP32
    if (message.toString() === 'ESP32') {
      espSocket = ws;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws === espSocket) espSocket = null;
  });
});

// Simple HTTP endpoint to trigger watering
app.post('/water', (req, res) => {
  if (espSocket && espSocket.readyState === WebSocket.OPEN) {
    espSocket.send('WATER');
    return res.send('Water command sent!');
  } else {
    return res.status(500).send('ESP32 not connected');
  }
});
