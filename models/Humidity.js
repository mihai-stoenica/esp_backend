import mongoose from 'mongoose';

export const Humidity = mongoose.model('Humidity', {
  timestamp: { type: Date, default: Date.now },
  humidity: Number,
});