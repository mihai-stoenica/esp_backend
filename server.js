// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Default LED state (can be toggled)
let ledState = "off";

app.get('/command', (req, res) => {
  res.json({ led: ledState });
});

app.get('/set-led/:state', (req, res) => {
  const state = req.params.state.toLowerCase();
  if (state === "on" || state === "off") {
    ledState = state;
    return res.send(`LED state set to ${state}`);
  }
  res.status(400).send("Invalid state. Use 'on' or 'off'.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
