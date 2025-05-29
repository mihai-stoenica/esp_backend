import express from 'express';
import cors from 'cors';
//import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToDb } from './db.js'; 
import { Humidity } from './models/Humidity.js'; 
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
//import { updateHumidity } from './public/humidityLogic.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;





app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

await connectToDb(); 

app.get('/', (req, res) => {
  res.sendFile(new URL('./public/index.html', import.meta.url).pathname); 
});

app.post('/api/humidity', async (req, res) => {
  const { humidity } = req.body;
  if (typeof humidity !== 'number') {
    return res.status(400).json({ error: 'Invalid humidity value' });
  }
  try {
    const humidityDocument = new Humidity({ humidity });
    await humidityDocument.save();
    console.log(`Humidity logged: ${humidity}`);
    res.status(201).json({ message: 'Humidity logged successfully' });
  } catch (error) {
    console.error('Error saving humidity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  
});

app.get('/api/log', async (req, res) => {
  try {
    const humidityLogs = await Humidity.find().sort({ timestamp: 1 }).limit(100);
    res.json(humidityLogs);
  } catch (error) {
    console.error('Error fetching humidity logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Web Socket setup

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();
let esp32Socket = null;

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.event === 'humidity' && typeof data.value === 'number') {
        console.log(`Received humidity: ${data.value}`);
        updateHumidity(data.value);

        for (const client of clients) {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ event: 'humidity', value: data.value }));
          }
        }

      } else if (data.event === 'register' && data.client === 'esp32') {
        esp32Socket = ws;
        console.log('ESP32 registered');

      } else if (data.event === 'motor' && typeof data.seconds === 'number') {
        console.log(`Motor activation requested for ${data.seconds} seconds`);
        if (esp32Socket && esp32Socket.readyState === ws.OPEN) {
          esp32Socket.send(JSON.stringify({ event: 'motor', seconds: data.seconds }));
        }
      }

    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    if (ws === esp32Socket) esp32Socket = null;
    console.log('WebSocket disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server + WS listening on port ${PORT}`);
});


