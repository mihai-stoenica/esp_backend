const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Serve the HTML file
});

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("WebSocket connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
    // Example: echo or process humidity
    if (message.toString().startsWith("{")) {
      // parse and process humidity
    } else {
      // maybe send control message back
      ws.send("WATER");
    }
  });

  ws.on("close", () => {
    console.log("WebSocket disconnected");
  });
});

// Start both HTTP and WebSocket on port 8080
server.listen(8080, () => {
  console.log("HTTP & WebSocket server listening on port 8080");
});



