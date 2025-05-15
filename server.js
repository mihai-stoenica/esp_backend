import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToDb } from './db.js'; 
import { Humidity } from './models/Humidity.js'; 

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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
